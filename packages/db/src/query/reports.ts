import { and, desc, eq, gt, lt, lte, or, sql } from "drizzle-orm";

import type { LastReport, ReportProps } from "@energyleaf/lib";
import db, { type DB, genId } from "../";
import { reportConfig, reports, reportsDayStatistics } from "../schema/reports";
import { user } from "../schema/user";

export async function getReportConfigByUserId(trx: DB, id: string) {
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

export async function getLastReportForUser(userId: string): Promise<LastReport | null> {
    const userReports = await db
        .select({
            totalEnergyConsumption: reports.totalEnergyConsumption,
            avgEnergyConsumptionPerDay: reports.avgEnergyConsumptionPerDay,
            totalEnergyCost: reports.totalEnergyCost,
            avgEnergyCost: reports.avgEnergyCost,
            bestDay: {
                day: reports.bestDay,
                consumption: reports.bestDayConsumption,
            },
            worstDay: {
                day: reports.worstDay,
                consumption: reports.worstDayConsumption,
            },
        })
        .from(reports)
        .where(eq(reports.userId, userId))
        .orderBy(desc(reports.timestamp))
        .limit(1);

    if (!userReports || userReports.length === 0) {
        console.info("No report found for user");
        return null;
    }

    const lastReport = userReports[0];

    return {
        totalEnergyConsumption: lastReport.totalEnergyConsumption,
        avgEnergyConsumptionPerDay: lastReport.avgEnergyConsumptionPerDay,
        totalEnergyCost: lastReport.totalEnergyCost ?? undefined,
        avgEnergyCost: lastReport.avgEnergyCost ?? undefined,
        bestDay: {
            day: new Date(lastReport.bestDay.day),
            consumption: lastReport.bestDay.consumption,
        },
        worstDay: {
            day: new Date(lastReport.worstDay.day),
            consumption: lastReport.worstDay.consumption,
        },
    };
}

export async function getMetaDataOfAllReportsForUser(
    userId: string,
    limit: number,
): Promise<Array<{ id: string; dateFrom: Date; dateTo: Date }>> {
    return db
        .select({
            id: reports.id,
            dateFrom: reports.dateFrom,
            dateTo: reports.dateTo,
        })
        .from(reports)
        .where(eq(reports.userId, userId))
        .orderBy(desc(reports.timestamp))
        .limit(limit);
}

export async function getLastReportIdByUser(userId: string) {
    const result = await db
        .select({ id: reports.id })
        .from(reports)
        .where(eq(reports.userId, userId))
        .orderBy(desc(reports.timestamp))
        .limit(1);

    return result.length > 0 ? result[0].id : undefined;
}

export async function getReportByIdAndUser(reportId: string, userId: string): Promise<ReportProps | null> {
    const report = await db
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
            timestamp: reports.timestamp,
        })
        .from(reports)
        .where(and(eq(reports.userId, userId), eq(reports.id, reportId)));

    if (report.length === 0) {
        return null;
    }

    const reportBefore = await db
        .select({
            id: reports.id,
            totalEnergyConsumption: reports.totalEnergyConsumption,
            avgEnergyConsumptionPerDay: reports.avgEnergyConsumptionPerDay,
            totalEnergyCost: reports.totalEnergyCost,
            avgEnergyCost: reports.avgEnergyCost,
            bestDay: {
                day: reports.bestDay,
                consumption: reports.bestDayConsumption,
            },
            worstDay: {
                day: reports.worstDay,
                consumption: reports.worstDayConsumption,
            },
        })
        .from(reports)
        .where(and(eq(reports.userId, userId), lt(reports.timestamp, report[0].timestamp)))
        .orderBy(desc(reports.timestamp))
        .limit(1);

    let lastReport: LastReport | undefined = undefined;

    if (reportBefore.length > 0) {
        lastReport = {
            totalEnergyConsumption: reportBefore[0].totalEnergyConsumption,
            avgEnergyConsumptionPerDay: reportBefore[0].avgEnergyConsumptionPerDay,
            totalEnergyCost: reportBefore[0].totalEnergyCost ?? undefined,
            avgEnergyCost: reportBefore[0].avgEnergyCost ?? undefined,
            bestDay: {
                day: new Date(reportBefore[0].bestDay.day),
                consumption: reportBefore[0].bestDay.consumption,
            },
            worstDay: {
                day: new Date(reportBefore[0].worstDay.day),
                consumption: reportBefore[0].worstDay.consumption,
            },
        };
    }

    const dayStatistics = await db
        .select({
            date: reportsDayStatistics.date,
            dailyConsumption: reportsDayStatistics.dailyConsumption,
            dailyGoal: reportsDayStatistics.dailyGoal,
            exceeded: reportsDayStatistics.exceeded,
            progress: reportsDayStatistics.progress,
        })
        .from(reportsDayStatistics)
        .where(eq(reportsDayStatistics.reportId, reportId))
        .orderBy(reportsDayStatistics.date);

    return {
        ...report[0],
        totalEnergyCost: report[0].totalEnergyCost ?? undefined,
        avgEnergyCost: report[0].avgEnergyCost ?? undefined,
        bestDay: {
            day: new Date(report[0].bestDay),
            consumption: report[0].bestDayConsumption,
        },
        worstDay: {
            day: new Date(report[0].worstDay),
            consumption: report[0].worstDayConsumption,
        },
        dayEnergyStatistics: dayStatistics.map((stat) => ({
            day: new Date(stat.date),
            dailyConsumption: stat.dailyConsumption,
            dailyGoal: stat.dailyGoal ?? undefined,
            exceeded: stat.exceeded ?? undefined,
            progress: stat.progress ?? undefined,
            image: "",
        })),
        lastReport: lastReport,
    };
}

export async function saveReport(reportProps: ReportProps, userId: string) {
    return db.transaction(async (trx) => {
        const reportId = genId(35);
        await trx.insert(reports).values({
            id: reportId,
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
