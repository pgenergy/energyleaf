import db, { type DB as MySqlDB } from "@energyleaf/db";
import {
    device as mysqlDevice,
    deviceHistory as mysqlDeviceHistory,
    deviceToPeak as mysqlDeviceToPeak,
    historyReportConfig as mysqlHistoryReportConfig,
    historyUser as mysqlHistoryUser,
    historyUserData as mysqlHistoryUserData,
    logs as mysqlLogs,
    reportConfig as mysqlReportConfig,
    reports as mysqlReports,
    reportsDayStatistics as mysqlReportsDayStatistics,
    sensor as mysqlSensor,
    sensorHistory as mysqlSensorHistory,
    sensorSequenceMarkingLog as mysqlSensorSequenceMarkingLog,
    sensorToken as mysqlSensorToken,
    session as mysqlSession,
    token as mysqlToken,
    user as mysqlUser,
    userData as mysqlUserData,
    userTipOfTheDay as mysqlUserTipOfTheDay,
} from "@energyleaf/db/schema";
import { type DB as PgDB, db as pgDb } from "@energyleaf/postgres";
import {
    device as pgDevice,
    deviceHistory as pgDeviceHistory,
    deviceToPeak as pgDeviceToPeak,
} from "@energyleaf/postgres/schema/device";
import { logs as pgLogs } from "@energyleaf/postgres/schema/logs";
import {
    historyReportConfig as pgHistoryReportConfig,
    reportConfig as pgReportConfig,
    reports as pgReports,
    reportsDayStatistics as pgReportsDayStatistics,
} from "@energyleaf/postgres/schema/reports";
import {
    sensorTable as pgSensor,
    sensorHistoryTable as pgSensorHistory,
    sensorSequenceMarkingLogTable as pgSensorSequenceMarkingLog,
    sensorTokenTable as pgSensorToken,
} from "@energyleaf/postgres/schema/sensor";
import {
    historyUser as pgHistoryUser,
    historyUserData as pgHistoryUserData,
    session as pgSession,
    token as pgToken,
    user as pgUser,
    userData as pgUserData,
    userTipOfTheDay as pgUserTipOfTheDay,
} from "@energyleaf/postgres/schema/user";
import { getTableName, sql } from "drizzle-orm";

export async function timescaleDbMigrate(args: string[]) {
    await db.transaction(async (mysqlTrx) => {
        await pgDb.transaction(async (pgTrx) => {
            console.log("Starting migration.");

            await automaticMigrations(mysqlTrx, pgTrx);

            console.log("Migration done 🎉");
        });
    });
}

/**
 * Performs all migrations that can be done automatically and do not require any manual intervention.
 */
async function automaticMigrations(mysqlTrx: MySqlDB, pgTrx: PgDB) {
    // Define the tables that should be migrated automatically. overrideSystemValue is used to insert data with OVERRIDING SYSTEM VALUE which is required for fields with default values.
    const automaticMigrations = [
        { mySqlTable: mysqlUser, pgTable: pgUser },
        { mySqlTable: mysqlUserData, pgTable: pgUserData, overrideSystemValue: true },
        // { mySqlTable: mysqlUserExperimentData, pgTable: pgUserExperimentData, overrideSystemValue: true },
        { mySqlTable: mysqlUserTipOfTheDay, pgTable: pgUserTipOfTheDay },
        { mySqlTable: mysqlHistoryUser, pgTable: pgHistoryUser },
        { mySqlTable: mysqlHistoryUserData, pgTable: pgHistoryUserData, overrideSystemValue: true },
        { mySqlTable: mysqlSession, pgTable: pgSession },
        { mySqlTable: mysqlToken, pgTable: pgToken },
        { mySqlTable: mysqlDevice, pgTable: pgDevice, overrideSystemValue: true },
        { mySqlTable: mysqlDeviceHistory, pgTable: pgDeviceHistory, overrideSystemValue: true },
        { mySqlTable: mysqlDeviceToPeak, pgTable: pgDeviceToPeak },
        { mySqlTable: mysqlLogs, pgTable: pgLogs, overrideSystemValue: true },
        { mySqlTable: mysqlReports, pgTable: pgReports },
        { mySqlTable: mysqlReportsDayStatistics, pgTable: pgReportsDayStatistics },
        { mySqlTable: mysqlReportConfig, pgTable: pgReportConfig, overrideSystemValue: true },
        { mySqlTable: mysqlHistoryReportConfig, pgTable: pgHistoryReportConfig, overrideSystemValue: true },
        { mySqlTable: mysqlSensor, pgTable: pgSensor },
        // { mySqlTable: mysqlSensorData, pgTable: pgSensorData },
        { mySqlTable: mysqlSensorHistory, pgTable: pgSensorHistory },
        { mySqlTable: mysqlSensorToken, pgTable: pgSensorToken },
        { mySqlTable: mysqlSensorSequenceMarkingLog, pgTable: pgSensorSequenceMarkingLog },
    ];

    console.log("Starting automatic migrations.");
    for (const { mySqlTable, pgTable, overrideSystemValue } of automaticMigrations) {
        const tableName = getTableName(mySqlTable);
        console.log(`Automatically migrating table ${tableName}...`);
        const data = await mysqlTrx.select().from(mySqlTable);

        if (data.length > 0) {
            await pgTrx.delete(pgTable).execute(); // TODO: Make configurable

            const insertQuery = pgTrx.insert(pgTable).values(data).getSQL();
            if (overrideSystemValue) {
                // Some hacky way to insert data with OVERRIDING SYSTEM VALUE because drizzle-orm does not support it
                insertQuery.queryChunks.splice(6, 0, sql` OVERRIDING SYSTEM VALUE `);
            }
            await pgTrx.execute(insertQuery);
        }
        console.log(`Table ${tableName} migrated ✅`);
    }
}
