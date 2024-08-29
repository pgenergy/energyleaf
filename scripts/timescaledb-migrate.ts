import type { DB as MySqlDB } from "@energyleaf/db";
import db from "@energyleaf/db";
import {
    sensorDataSequence as mySqlSensorDataSequence,
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
    sensorData as mysqlSensorData,
    sensorHistory as mysqlSensorHistory,
    sensorSequenceMarkingLog as mysqlSensorSequenceMarkingLog,
    sensorToken as mysqlSensorToken,
    session as mysqlSession,
    token as mysqlToken,
    user as mysqlUser,
    userData as mysqlUserData,
    userExperimentData as mysqlUserExperimentData,
    userTipOfTheDay as mysqlUserTipOfTheDay,
} from "@energyleaf/db/schema";
import { type DB as PgDB, db as pgDb } from "@energyleaf/postgres";
import {
    deviceTable as pgDevice,
    deviceHistory as pgDeviceHistory,
    deviceToPeakTable as pgDeviceToPeak,
} from "@energyleaf/postgres/schema/device";
import { logs as pgLogs } from "@energyleaf/postgres/schema/logs";
import {
    historyReportConfigTable as pgHistoryReportConfig,
    reportConfigTable as pgReportConfig,
    reportsTable as pgReports,
    reportsDayStatisticsTable as pgReportsDayStatistics,
} from "@energyleaf/postgres/schema/reports";
import {
    sensorTable as pgSensor,
    sensorDataTable as pgSensorData,
    sensorDataSequenceTable as pgSensorDataSequence,
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
    userExperimentData as pgUserExperimentData,
    userTipOfTheDay as pgUserTipOfTheDay,
} from "@energyleaf/postgres/schema/user";
import { getTableName, sql } from "drizzle-orm";
import type { MySqlColumn, MySqlTable } from "drizzle-orm/mysql-core";
import type { PgTable } from "drizzle-orm/pg-core";

export async function timescaleDbMigrate(args: string[]) {
    await pgDb.transaction(async (pgTrx) => {
        console.log("Starting migration.");

        // Start stopwatch
        const start = Date.now();

        await automaticMigrations(db, pgTrx);

        console.log("Migration done 🎉");

        // Stop stopwatch
        const end = Date.now();
        console.log(`Migration took ${end - start}ms.`);
    });

    return;
}

/**
 * Performs all migrations that can be done automatically and do not require any manual intervention.
 */
async function automaticMigrations(mysqlTrx: MySqlDB, pgTrx: PgDB) {
    // Define the tables that should be migrated automatically.
    // overrideSystemValue is used to insert data with OVERRIDING SYSTEM VALUE which is required for fields with default values.
    // batched is used to enable batch insert. This is needed to prevent the drizzle issue "Maximum call stack size exceeded.". (https://github.com/drizzle-team/drizzle-orm/issues/2063)
    const automaticMigrations = [
        { mySqlTable: mysqlUser, pgTable: pgUser },
        { mySqlTable: mysqlUserData, pgTable: pgUserData, overrideSystemValue: true },
        { mySqlTable: mysqlUserExperimentData, pgTable: pgUserExperimentData, overrideSystemValue: true },
        { mySqlTable: mysqlUserTipOfTheDay, pgTable: pgUserTipOfTheDay },
        { mySqlTable: mysqlHistoryUser, pgTable: pgHistoryUser },
        { mySqlTable: mysqlHistoryUserData, pgTable: pgHistoryUserData, overrideSystemValue: true },
        { mySqlTable: mysqlSession, pgTable: pgSession },
        { mySqlTable: mysqlToken, pgTable: pgToken },
        { mySqlTable: mysqlDevice, pgTable: pgDevice, overrideSystemValue: true },
        { mySqlTable: mysqlDeviceHistory, pgTable: pgDeviceHistory, overrideSystemValue: true },
        { mySqlTable: mysqlDeviceToPeak, pgTable: pgDeviceToPeak },
        {
            mySqlTable: mysqlLogs,
            pgTable: pgLogs,
            overrideSystemValue: true,
            batched: true,
            orderBy: mysqlLogs.timestamp,
        },
        { mySqlTable: mysqlReports, pgTable: pgReports },
        { mySqlTable: mysqlReportsDayStatistics, pgTable: pgReportsDayStatistics },
        { mySqlTable: mysqlReportConfig, pgTable: pgReportConfig, overrideSystemValue: true },
        { mySqlTable: mysqlHistoryReportConfig, pgTable: pgHistoryReportConfig, overrideSystemValue: true },
        { mySqlTable: mysqlSensor, pgTable: pgSensor },
        { mySqlTable: mysqlSensorHistory, pgTable: pgSensorHistory },
        { mySqlTable: mysqlSensorToken, pgTable: pgSensorToken },
        { mySqlTable: mysqlSensorSequenceMarkingLog, pgTable: pgSensorSequenceMarkingLog },
        { mySqlTable: mySqlSensorDataSequence, pgTable: pgSensorDataSequence },
        {
            mySqlTable: mysqlSensorData,
            pgTable: pgSensorData,
            overrideSystemValue: true,
            batched: true,
            orderBy: mysqlSensorData.timestamp,
        },
    ];

    console.log("Starting automatic migrations.");
    for (const { mySqlTable, pgTable, overrideSystemValue, batched, orderBy } of automaticMigrations) {
        const tableName = getTableName(mySqlTable);

        await pgTrx.delete(pgTable).execute();

        if (batched && orderBy) {
            console.log(`Migrating table ${tableName}...`);
            await batchInsertData(mySqlTable, mysqlTrx, pgTable, pgTrx, orderBy, overrideSystemValue);
        } else {
            console.log(`Migrating table ${tableName} with batching...`);
            const data = await mysqlTrx.select().from(mySqlTable);
            await insertData(data, pgTable, pgTrx, overrideSystemValue);
        }

        console.log(`Table ${tableName} migrated ✅`);
    }
}

async function insertData<T>(data: T[], pgTable: PgTable, trx: PgDB, overrideSystemValue?: boolean) {
    const insertQuery = trx.insert(pgTable).values(data).onConflictDoNothing().getSQL();
    if (overrideSystemValue) {
        // Some hacky way to insert data with OVERRIDING SYSTEM VALUE because drizzle-orm does not support it
        insertQuery.queryChunks.splice(6, 0, sql` OVERRIDING SYSTEM VALUE `);
    }
    await trx.execute(insertQuery);
}

async function batchInsertData(
    mysqlTable: MySqlTable,
    mysqlTrx: MySqlDB,
    pgTable: PgTable,
    pgTrx: PgDB,
    orderBy: MySqlColumn,
    overrideSystemValue?: boolean,
) {
    const batchSize = 8000;
    let batchIndex = 0;
    let finished = false;
    while (!finished) {
        const data = await mysqlTrx
            .select()
            .from(mysqlTable)
            .limit(batchSize)
            .offset(batchSize * batchIndex++)
            .orderBy(orderBy);

        if (data.length === 0) {
            finished = true;
            break;
        }

        await insertData(data, pgTable, pgTrx, overrideSystemValue);
        console.log(`Batch ${batchIndex} inserted.`);
    }
}
