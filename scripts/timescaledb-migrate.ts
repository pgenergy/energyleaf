import db, { type DB as MySqlDB } from "@energyleaf/db";
import {
    deviceToPeak as mysqlDeviceToPeak,
    historyUser as mysqlHistoryUser,
    reports as mysqlReports,
    reportsDayStatistics as mysqlReportsDayStatistics,
    sensor as mysqlSensor,
    sensorHistory as mysqlSensorHistory,
    sensorSequenceMarkingLog as mysqlSensorSequenceMarkingLog,
    sensorToken as mysqlSensorToken,
    session as mysqlSession,
    token as mysqlToken,
    user as mysqlUser,
    userTipOfTheDay as mysqlUserTipOfTheDay,
} from "@energyleaf/db/schema";
import { type DB as PgDB, db as pgDb } from "@energyleaf/postgres";
import { deviceToPeak as pgDeviceToPeak } from "@energyleaf/postgres/schema/device";
import {
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
    session as pgSession,
    token as pgToken,
    user as pgUser,
    userTipOfTheDay as pgUserTipOfTheDay,
} from "@energyleaf/postgres/schema/user";
import { getTableName } from "drizzle-orm";

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
    const automaticMigrations = [
        { mySqlTable: mysqlUser, pgTable: pgUser },
        // { mySqlTable: mysqlUserData, pgTable: pgUserData },
        // { mySqlTable: mysqlUserExperimentData, pgTable: pgUserExperimentData },
        { mySqlTable: mysqlUserTipOfTheDay, pgTable: pgUserTipOfTheDay },
        { mySqlTable: mysqlHistoryUser, pgTable: pgHistoryUser },
        // { mySqlTable: mysqlHistoryUserData, pgTable: pgHistoryUserData },
        { mySqlTable: mysqlSession, pgTable: pgSession },
        { mySqlTable: mysqlToken, pgTable: pgToken },
        // { mySqlTable: mysqlDevice, pgTable: pgDevice },
        // { mySqlTable: mysqlDeviceHistory, pgTable: pgDeviceHistory },
        { mySqlTable: mysqlDeviceToPeak, pgTable: pgDeviceToPeak },
        // { mySqlTable: mysqlLogs, pgTable: pgLogs },
        { mySqlTable: mysqlReports, pgTable: pgReports },
        { mySqlTable: mysqlReportsDayStatistics, pgTable: pgReportsDayStatistics },
        // { mySqlTable: mysqlReportConfig, pgTable: pgReportConfig },
        // { mySqlTable: mysqlHistoryReportConfig, pgTable: pgHistoryReportConfig },
        { mySqlTable: mysqlSensor, pgTable: pgSensor },
        // { mySqlTable: mysqlSensorData, pgTable: pgSensorData },
        { mySqlTable: mysqlSensorHistory, pgTable: pgSensorHistory },
        { mySqlTable: mysqlSensorToken, pgTable: pgSensorToken },
        { mySqlTable: mysqlSensorSequenceMarkingLog, pgTable: pgSensorSequenceMarkingLog },
    ];

    console.log("Starting automatic migrations.");
    for (const { mySqlTable, pgTable } of automaticMigrations) {
        const tableName = getTableName(mySqlTable);
        console.log(`Automatically migrating table ${tableName}...`);
        const data = await mysqlTrx.select().from(mySqlTable);
        if (data.length > 0) {
            await pgTrx.delete(pgTable).execute(); // TODO: Make configurable
            await pgTrx.insert(pgTable).values(data);
        }
        console.log(`Table ${tableName} migrated ✅`);
    }
}
