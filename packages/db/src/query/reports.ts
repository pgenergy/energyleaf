import { type ExtractTablesWithRelations, and, desc, eq, gt, lte, or, sql } from "drizzle-orm";

import type { ReportProps } from "@energyleaf/lib";
import type { MySqlTransaction } from "drizzle-orm/mysql-core";
import type { PlanetScalePreparedQueryHKT, PlanetscaleQueryResultHKT } from "drizzle-orm/planetscale-serverless";
import db from "../";
import { historyReportConfig, reportConfig, reports, reportsDayStatistics } from "../schema/reports";
import { user } from "../schema/user";

interface ReportConfig {
    receiveMails: boolean;
    interval: number;
    time: number;
}

/**
 * Update the user report settings data in the database
 */
export async function updateReportConfig(data: ReportConfig, userId: string) {
    return db.transaction(async (trx) => {
        const oldReportData = await getReportConfigByUserId(trx, userId);
        if (!oldReportData) {
            throw new Error("Old user data not found");
        }
        await trx.insert(historyReportConfig).values({
            userId: oldReportData.userId,
            receiveMails: oldReportData.receiveMails,
            interval: oldReportData.interval,
            time: oldReportData.time,
            timestampLast: oldReportData.timestampLast,
            createdTimestamp: oldReportData.createdTimestamp,
        });

        await trx
            .update(reportConfig)
            .set({
                receiveMails: data.receiveMails,
                interval: data.interval,
                time: data.time,
                createdTimestamp: new Date(),
            })
            .where(eq(reportConfig.userId, userId));
    });
}

export async function getReportConfigByUserId(
    trx: MySqlTransaction<
        PlanetscaleQueryResultHKT,
        PlanetScalePreparedQueryHKT,
        Record<string, never>,
        ExtractTablesWithRelations<Record<string, never>>
    >,
    id: string,
) {
    const data = await trx.select().from(reportConfig).where(eq(reportConfig.userId, id));

    if (data.length === 0) {
        return null;
    }

    return data[0];
}

export async function updateLastReportTimestamp(userId: string) {
    return db.update(reportConfig).set({ timestampLast: new Date() }).where(eq(reportConfig.userId, userId));
}

/**
 * Get users with due report to create and send reports. </br>
 * The report is due if the current date is greater than the last report date + interval or </br>
 * if the current date is equal to the last report date + interval and the current time is greater than the report time </br>
 *
 * @returns The users with due report
 */
export async function getUsersWitDueReport() {
    return db
        .select({
            userId: user.id,
            userName: user.username,
            appVersion: user.appVersion,
            email: user.email,
            receiveMails: reportConfig.receiveMails,
            interval: reportConfig.interval,
        })
        .from(reportConfig)
        .innerJoin(user, eq(user.id, reportConfig.userId))
        .where(
            and(
                or(
                    gt(sql`DATEDIFF(NOW(), report_config.timestamp_last)`, reportConfig.interval),
                    and(
                        eq(sql`DATEDIFF(NOW(), report_config.timestamp_last)`, reportConfig.interval),
                        lte(reportConfig.time, new Date().getHours()),
                    ),
                ),
                eq(user.isActive, true),
            ),
        );
}

export async function getLastReportForUser(userId: string): Promise<ReportProps | null> {
    const userReports = await getReportForUserDescending(userId);

    if (!userReports || userReports.length === 0) {
        console.info("No report found for user");
        return null;
    }

    const lastReport = userReports[0];

    return {
        dateFrom: new Date(lastReport.dateFrom),
        dateTo: new Date(lastReport.dateTo),
        totalEnergyConsumption: lastReport.totalEnergyConsumption,
        avgEnergyConsumptionPerDay: lastReport.avgEnergyConsumptionPerDay,
        totalEnergyCost: lastReport.totalEnergyCost,
        avgEnergyCost: lastReport.avgEnergyCost,
        bestDay: {
            day: new Date(lastReport.bestDay),
            consumption: lastReport.bestDayConsumption,
        },
        worstDay: {
            day: new Date(lastReport.worstDay),
            consumption: lastReport.worstDayConsumption,
        },
        dayEnergyStatistics: [],
    };
}

export async function getReportForUserDescending(userId: string) {
    return db
        .select({
            id: reports.id,
            dateFrom: reports.dateFrom,
            dateTo: reports.dateTo,
            totalEnergyConsumption: reports.totalEnergyConsumption,
            avgEnergyConsumptionPerDay: reports.avgEnergyConsumptionPerDay,
            totalEnergyCost: reports.totalEnergyCost,
            avgEnergyCost: reports.avgEnergyCost,
            bestDay: reports.bestDay,
            bestDayConsumption: reports.bestDayConsumption,
            worstDay: reports.worstDay,
            worstDayConsumption: reports.worstDayConsumption,
        })
        .from(reports)
        .where(eq(reports.userId, userId))
        .orderBy(desc(reports.timestamp));
}

export async function saveReport(reportProps: ReportProps, userId: string) {
    return db.transaction(async (trx) => {
        await trx.insert(reports).values({
            timestamp: new Date(),
            dateFrom: reportProps.dateFrom,
            dateTo: reportProps.dateTo,
            userId: userId,
            totalEnergyConsumption: reportProps.totalEnergyConsumption,
            avgEnergyConsumptionPerDay: reportProps.avgEnergyConsumptionPerDay,
            totalEnergyCost: reportProps.totalEnergyCost,
            avgEnergyCost: reportProps.avgEnergyCost,
            bestDay: reportProps.bestDay.day,
            bestDayConsumption: reportProps.bestDay.consumption,
            worstDay: reportProps.worstDay.day,
            worstDayConsumption: reportProps.worstDay.consumption,
        });
        const newReport = await trx
            .select({ id: reports.id })
            .from(reports)
            .where(and(eq(reports.userId, userId), eq(reports.dateFrom, reportProps.dateFrom)));

        const reportId = newReport[0].id;

        for (const dayStat of reportProps.dayEnergyStatistics ?? []) {
            await trx.insert(reportsDayStatistics).values({
                date: dayStat.day,
                dailyConsumption: dayStat.dailyConsumption,
                progress: dayStat.progress,
                exceeded: dayStat.exceeded,
                dailyGoal: dayStat.dailyGoal,
                reportId: reportId,
            });
        }
    });
}
