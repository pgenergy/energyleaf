import { sql } from "drizzle-orm";
import { int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

export const device = mysqlTable("device", {
    id: int("id").autoincrement().primaryKey().notNull(),
    userId: int("user_id").notNull(),
    name: varchar("name", { length: 30 }).notNull(),
    created: timestamp("created").default(sql`CURRENT_TIMESTAMP`),
});
