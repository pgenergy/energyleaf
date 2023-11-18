import { sql } from "drizzle-orm";
import { boolean, float, int, mysqlEnum, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

export const user = mysqlTable("user", {
    id: int("id").autoincrement().primaryKey().notNull(),
    created: timestamp("created").default(sql`CURRENT_TIMESTAMP`),
    email: varchar("email", { length: 30 }).notNull(),
    username: varchar("username", { length: 30 }).notNull(),
    password: varchar("password", { length: 256 }).notNull(),
    sensorId: varchar("sensor_id", { length: 30 }).notNull(),
    isAdmin: boolean("is_admin").default(false).notNull(),
});

export const userData = mysqlTable("user_data", {
    id: int("id").autoincrement().primaryKey().notNull(),
    userId: int("user_id").notNull(),
    budget: int("budget").default(2500),
    basispreis: float("basispreis"),
    arbeitspreis: float("arbeitspreis"),
    tarif: mysqlEnum("tarif", ["basic", "eco"]).default("basic"),
    limitEnergy: int("limit_energy").default(800),
    household: int("household"),
    immobilie: mysqlEnum("immobilie", ["house", "apartment"]),
    wohnfläche: int("wohnfläche"),
    warmwasser: mysqlEnum("warmwasser", ["electric", "not_electric"]),
});

export const userDataTarfiEnums: Record<(typeof userData.tarif.enumValues)[number], string> = {
    basic: "BasisStrom",
    eco: "ÖkoStrom",
};

export const userDataImmobilieEnums: Record<(typeof userData.immobilie.enumValues)[number], string> = {
    house: "Haus",
    apartment: "Wohnung",
};

export const userDataWarmwasserEnums: Record<(typeof userData.warmwasser.enumValues)[number], string> = {
    electric: "Elektrisch",
    not_electric: "Nicht elektrisch",
};

export const mail = mysqlTable("mail", {
    id: int("id").autoincrement().primaryKey().notNull(),
    userId: int("user_id").notNull(),
    mailDaily: boolean("mail_daily").default(true).notNull(),
    mailWeekly: boolean("mail_weekly").default(true).notNull(),
});
