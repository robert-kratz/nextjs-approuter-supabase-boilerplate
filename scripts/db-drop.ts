import path from 'node:path';
import postgres from 'postgres';
import dotenv from 'dotenv';

// zuerst .env.local dann .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

async function main() {
    const url = process.env.DATABASE_URL;
    if (!url) {
        console.error('DATABASE_URL is missing: please set it in .env.local / .env');
        process.exit(1);
    }

    const sql = postgres(url, { max: 1 });

    try {
        await sql`DROP SCHEMA IF EXISTS public CASCADE;`;
        await sql`CREATE SCHEMA public;`;
        await sql`GRANT ALL ON SCHEMA public TO postgres;`;
        await sql`GRANT ALL ON SCHEMA public TO public;`;
        await sql`COMMENT ON SCHEMA public IS 'standard public schema';`;
        console.log('Reset schema public');
    } finally {
        await sql.end({ timeout: 5 });
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
