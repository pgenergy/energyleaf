import {float, int, mysqlEnum, mysqlTable, varchar} from "drizzle-orm/mysql-core";

export const logs = mysqlTable("logs", {
    id: int("id").autoincrement().primaryKey().notNull(),
    logType: mysqlEnum("log_type", ["web", "admin", "undefined"]).default("undefined"),
    branch: varchar("branch", {length: 255}),
    deploymentDomain: varchar("deployment_domain", {length: 255}),
    deploymentId: varchar("deployment_id", {length: 255}),
    environment: varchar("environment", {length: 255}),
    function: varchar("function", {length: 255}),
    host: varchar("host", {length: 255}),
    lambdaDurationInMs: int("lambda_duration_in_ms"),
    lambdaMaxMemoryUsed: float("lambda_max_memory_used"),
    lambdaMemorySize: float("lambda_memory_size"),
    lambdaRegion: varchar("lambda_region", {length: 255}),
    level: varchar("level", {length: 255}),
    message: varchar("message", {length: 255}),
    projectId: varchar("project_id", {length: 255}),
    requestId: varchar("request_id", {length: 255}),
    requestMethod: varchar("request_method", {length: 255}),
    requestPath: varchar("request_path", {length: 255}),
    requestUserAgent: varchar("request_user_agent", {length: 255}),
    responseStatusCode: float("response_status_code"),
    timestampInMs: float("timestamp_in_ms"),
    timeUTC: varchar("time_utc", {length: 255}),
    type: varchar("type", {length: 255}),
    vercelCache: varchar("vercel_cache", {length: 255}),
    wafAction: varchar("waf_action", {length: 255}),
});