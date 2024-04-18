import {int, mysqlEnum, mysqlTable, varchar} from "drizzle-orm/mysql-core";
import { number} from "zod";

export const logs = mysqlTable("logs", {
    id: int("id").autoincrement().primaryKey().notNull(),
    logType: mysqlEnum("log_type", ["web", "admin", "undefined"]).default("undefined"),
    branch: varchar("branch"),
    deploymentDomain: varchar("deployment_domain"),
    deploymentId: varchar("deployment_id"),
    environment: varchar("environment"),
    function: varchar("function"),
    host: varchar("host"),
    lambdaDurationInMs: number("lambda_duration_in_ms"),
    lambdaMaxMemoryUsed: number("lambda_max_memory_used"),
    lambdaMemorySize: number("lambda_memory_size"),
    lambdaRegion: varchar("lambda_region"),
    level: varchar("level"),
    message: varchar("message"),
    projectId: varchar("project_id"),
    requestId: varchar("request_id"),
    requestMethod: varchar("request_method"),
    requestPath: varchar("request_path"),
    requestUserAgent: varchar("request_user_agent"),
    responseStatusCode: number("response_status_code"),
    timestampInMs: number("timestamp_in_ms"),
    timeUTC: varchar("time_utc"),
    type: varchar("type"),
    vercelCache: varchar("vercel_cache"),
    wafAction: varchar("waf_action"),

});