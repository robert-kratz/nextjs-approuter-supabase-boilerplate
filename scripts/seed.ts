import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

import { db, closeDb } from '@/lib/db';
import { products } from '@/lib/db/schema';

async function main() {
    await db.insert(products).values([
        { sku: 'SKU-1', name: 'Demo 1', price: '19.90' },
        { sku: 'SKU-2', name: 'Demo 2', price: '29.90' },
    ]);
}

main().finally(() => closeDb());
