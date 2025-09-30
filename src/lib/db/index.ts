/* eslint-disable */
// src/lib/db/index.ts

try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('server-only');
} catch {
    // ignore for scripts
}

import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

const queryClient = postgres(process.env.DATABASE_URL!, {
    max: 1,
    prepare: true,
    idle_timeout: 20,
});

export const db = drizzle(queryClient, { schema });
export type Db = typeof db;

export async function closeDb() {
    await queryClient.end({ timeout: 5 });
}
