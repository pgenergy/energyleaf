import { DrizzleMySQLAdapter } from "@lucia-auth/adapter-drizzle";
import db from "./";
import { session, user } from "./schema";

export const adapter = new DrizzleMySQLAdapter(db, session, user);
