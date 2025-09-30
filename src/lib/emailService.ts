/* eslint-disable */

// lib/emailService.ts
import fs from 'node:fs/promises';
import path from 'node:path';
import Handlebars from 'handlebars';
import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';

export type Lang = 'de' | 'en';
export type DefaultLang = Lang;

/** Globale Konfiguration */
export type EmailServiceConfig = {
    templatesDir?: string;
    transporter?: Transporter;
    defaultLang?: DefaultLang;
    languages?: readonly Lang[];
};

export type Attachment = NonNullable<SendMailOptions['attachments']>[number];

export type EmailDefinition<TData> = {
    id: string;
    languages?: readonly Lang[];
    subject: (ctx: { data: TData; lang: Lang }) => Record<Lang, string>;
};

type AnyEmailDefinition = EmailDefinition<any>;

type RegisteredEmail<TData> = {
    def: EmailDefinition<TData>;
    compiledByLang: Map<Lang, HandlebarsTemplateDelegate<TData>>;
};

type Registry = Map<string, RegisteredEmail<any>>;
const registry: Registry = new Map();

let SVC:
    | (Required<Pick<EmailServiceConfig, 'templatesDir'>> & {
          transporter: Transporter;
          defaultLang: DefaultLang;
          languages: readonly Lang[];
      })
    | null = null;

export function initEmailService(config?: EmailServiceConfig) {
    if (SVC) return SVC;
    const templatesDir = config?.templatesDir ?? path.resolve(process.cwd(), 'templates');

    const transporter = config?.transporter ?? createTransporterFromEnv();

    const defaultLang: DefaultLang = config?.defaultLang ?? 'de';
    const languages: readonly Lang[] = config?.languages ?? ['de', 'en'];

    SVC = { templatesDir, transporter, defaultLang, languages };
    return SVC;
}

function createTransporterFromEnv(): Transporter {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE, FROM_EMAIL } = process.env;
    if (!SMTP_HOST || !SMTP_PORT) {
        throw new Error('SMTP_HOST und SMTP_PORT müssen gesetzt sein oder eigenen Transporter übergeben');
    }
    return nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        from: FROM_EMAIL,
        secure: String(SMTP_SECURE ?? 'false') === 'true',
        auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    });
}

export function registerEmail<TData>(def: EmailDefinition<TData>) {
    if (!SVC) initEmailService();
    if (registry.has(def.id)) {
        throw new Error(`E‑Mail "${def.id}" ist bereits registriert`);
    }
    const allLangs = resolveLanguages(def);
    if (allLangs.length === 0) {
        throw new Error(`Sprachenmenge für "${def.id}" ist leer`);
    }
    registry.set(def.id, {
        def,
        compiledByLang: new Map<Lang, HandlebarsTemplateDelegate<TData>>(),
    });

    return {
        send: (args: {
            to: string | string[];
            data: TData;
            lang?: Lang;
            attachments?: Attachment[];
            from?: string;
            cc?: string | string[];
            bcc?: string | string[];
            replyTo?: string;
        }) =>
            sendEmail<TData>({
                templateId: def.id,
                to: args.to,
                data: args.data,
                lang: args.lang,
                attachments: args.attachments,
                from: args.from,
                cc: args.cc,
                bcc: args.bcc,
                replyTo: args.replyTo,
            }),
    };
}

export async function sendEmail<TData>(args: {
    templateId: string;
    to: string | string[];
    data: TData;
    lang?: Lang;
    attachments?: Attachment[];
    from?: string;
    cc?: string | string[];
    bcc?: string | string[];
    replyTo?: string;
}) {
    if (!SVC) initEmailService();
    const svc = SVC!;

    const reg = registry.get(args.templateId);
    if (!reg) {
        throw new Error(`Template "${args.templateId}" ist nicht registriert. Bitte registerEmail(...) aufrufen`);
    }

    const allowedLangs = resolveLanguages(reg.def);
    const lang = pickLang(args.lang, allowedLangs, svc.defaultLang);

    const html = await renderHtmlFromFs<TData>({
        templatesDir: svc.templatesDir,
        folder: reg.def.id,
        lang,
        data: args.data,
        compiledCache: reg.compiledByLang,
    });

    const subjects = reg.def.subject({ data: args.data, lang });
    const subject = subjects[lang] ?? subjects[svc.defaultLang];

    const message: SendMailOptions = {
        to: args.to,
        from: args.from ?? process.env.MAIL_FROM ?? 'no-reply@example.com',
        subject,
        html,
        text: stripHtml(html),
        attachments: args.attachments,
        cc: args.cc,
        bcc: args.bcc,
        replyTo: args.replyTo,
    };

    const info = await svc.transporter.sendMail(message);
    return {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
        envelope: info.envelope,
    };
}

function resolveLanguages(def: AnyEmailDefinition): readonly Lang[] {
    const svc = SVC!;
    const set = new Set<Lang>(svc.languages);
    if (def.languages) def.languages.forEach((l) => set.add(l));
    return Array.from(set.values());
}

function pickLang(requested: Lang | undefined, allowed: readonly Lang[], fallback: DefaultLang): Lang {
    if (requested && allowed.includes(requested)) return requested;
    if (allowed.includes(fallback)) return fallback;
    return allowed[0] as Lang;
}

async function renderHtmlFromFs<TData>(opts: {
    templatesDir: string;
    folder: string;
    lang: Lang;
    data: TData;
    compiledCache: Map<Lang, HandlebarsTemplateDelegate<TData>>;
}) {
    const { templatesDir, folder, lang, data, compiledCache } = opts;

    let compiled = compiledCache.get(lang);
    if (!compiled) {
        const filePath = path.join(templatesDir, folder, `${lang}.hbs`);
        const source = await fs.readFile(filePath, 'utf8');
        compiled = Handlebars.compile<TData>(source, { noEscape: false, strict: true });
        compiledCache.set(lang, compiled);
    }
    return compiled(data);
}

function stripHtml(html: string) {
    return html
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim();
}

export type WelcomeEmailData = {
    userName: string;
    signupDateIso: string;
};

export const WelcomeEmail = registerEmail<WelcomeEmailData>({
    id: 'welcome-email',
    subject: ({ data }) => ({
        de: `Willkommen, ${data.userName}`,
        en: `Welcome, ${data.userName}`,
    }),
});

initEmailService({
    templatesDir: path.resolve(process.cwd(), 'templates'),
    defaultLang: 'de',
    languages: ['de'] as const,
});

/* =========================
   Example: Server-side initialization
   ========================= */

// initEmailService({
//   templatesDir: path.resolve(process.cwd(), "templates"),
//   defaultLang: "de",
//   languages: ["de", "en"] as const,
//   // oder eigenen Transporter liefern
// });

/* =========================
   Example: Send email
   ========================= */

// await WelcomeEmail.send({
//   to: "user@example.com",
//   data: { userName: "Robert", signupDateIso: new Date().toISOString() },
//   lang: "de",
//   attachments: [{ filename: "terms.pdf", path: "/abs/terms.pdf" }],
// });
