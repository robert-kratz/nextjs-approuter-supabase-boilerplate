import { pgTable, pgEnum, varchar, text, timestamp, boolean, integer, numeric, uuid } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { pgSchema } from 'drizzle-orm/pg-core';

/**
 * Optional direkte Sicht auf auth.users
 * Nur lesen, kein Schreiben
 */
export const auth = pgSchema('auth');
export const authUsers = auth.table('users', {
    id: uuid('id').primaryKey(),
    email: text('email'),
    createdAt: timestamp('created_at', { withTimezone: true }),
});

/**
 * Beispiel Enums
 */
export const currencyEnum = pgEnum('currency', ['EUR', 'USD']);
export const roleEnum = pgEnum('user_role', ['user', 'admin']);

/**
 * Profile mit FK auf auth.users
 */
export const profiles = pgTable(
    'profiles',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        userId: uuid('user_id').notNull().unique(), // FK unten
        displayName: varchar('display_name', { length: 120 }).notNull(),
        role: roleEnum('role').notNull().default('user'),
        createdAt: timestamp('created_at', { withTimezone: true })
            .notNull()
            .default(sql`now()`),
        updatedAt: timestamp('updated_at', { withTimezone: true })
            .notNull()
            .default(sql`now()`),
    },
    (t) => {
        return {
            userRef: {
                columns: [t.userId],
                foreignColumns: [authUsers.id],
                name: 'profiles_user_fk',
            },
        };
    }
);

/**
 * Produkte
 */
export const products = pgTable('products', {
    id: uuid('id').primaryKey().defaultRandom(),
    sku: varchar('sku', { length: 64 }).notNull().unique(),
    name: text('name').notNull(),
    price: numeric('price', { precision: 12, scale: 2 }).notNull(),
    currency: currencyEnum('currency').notNull().default('EUR'),
    stock: integer('stock').notNull().default(0),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
        .notNull()
        .default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
        .notNull()
        .default(sql`now()`),
});

/**
 * Orders mit Relation zu profiles
 */
export const orders = pgTable(
    'orders',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        profileId: uuid('profile_id').notNull(),
        total: numeric('total', { precision: 12, scale: 2 }).notNull(),
        currency: currencyEnum('currency').notNull().default('EUR'),
        createdAt: timestamp('created_at', { withTimezone: true })
            .notNull()
            .default(sql`now()`),
    },
    (t) => {
        return {
            profileRef: {
                columns: [t.profileId],
                foreignColumns: [profiles.id],
                name: 'orders_profile_fk',
            },
        };
    }
);

/**
 * OrderItems
 */
export const orderItems = pgTable(
    'order_items',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        orderId: uuid('order_id').notNull(),
        productId: uuid('product_id').notNull(),
        qty: integer('qty').notNull().default(1),
        unitPrice: numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
    },
    (t) => {
        return {
            orderRef: {
                columns: [t.orderId],
                foreignColumns: [orders.id],
                name: 'order_items_order_fk',
            },
            productRef: {
                columns: [t.productId],
                foreignColumns: [products.id],
                name: 'order_items_product_fk',
            },
        };
    }
);

/**
 * Relations für typed joins
 */
export const profilesRelations = relations(profiles, ({ many, one }) => ({
    orders: many(orders),
    user: one(authUsers, {
        fields: [profiles.userId],
        references: [authUsers.id],
    }),
}));

export const ordersRelations = relations(orders, ({ many, one }) => ({
    items: many(orderItems),
    profile: one(profiles, {
        fields: [orders.profileId],
        references: [profiles.id],
    }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
    order: one(orders, {
        fields: [orderItems.orderId],
        references: [orders.id],
    }),
    product: one(products, {
        fields: [orderItems.productId],
        references: [products.id],
    }),
}));
