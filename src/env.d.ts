/// <reference types="next/types/global" />
declare namespace NodeJS {
    interface ProcessEnv {
        SMTP_HOST: string;
        SMTP_PORT: number;
        SMTP_USER: string;
        SMTP_PASS: string;
        SMTP_SECURE: boolean;
        FROM_EMAIL: string;
        NEXT_PUBLIC_SUPABASE_URL: string;
        NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
        SUPABASE_SERVICE_ROLE_KEY: string;
        DATABASE_URL: string;
    }
}
