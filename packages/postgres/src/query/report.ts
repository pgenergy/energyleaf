import type { LastReport, ReportProps } from "@energyleaf/lib";
import { and, desc, eq, gt, lt, lte, or, sql } from "drizzle-orm";
import { type DB, db, genId } from "../";
import { reportConfigTable, reportsDayStatisticsTable, reportsTable } from "../schema/reports";
import { userTable } from "../schema/user";

export async function getReportConfigByUserId(trx: DB, id: string) {
    const data = await trx.select().from(reportConfigTable).where(eq(reportConfigTable.userId, id));

    if (data.length === 0) {
        return null;
    }

    return data[0];
}

export async function updateLastReportTimestamp(userId: string) {
    return db.update(reportConfigTable).set({ timestampLast: new Date() }).where(eq(reportConfigTable.userId, userId));
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
            userId: userTable.id,
            userName: userTable.username,
            appVersion: userTable.appVersion,
            email: userTable.email,
            receiveMails: reportConfigTable.receiveMails,
            interval: reportConfigTable.interval,
        })
        .from(reportConfigTable)
        .innerJoin(userTable, eq(userTable.id, reportConfigTable.userId))
        .where(
            and(
                or(
                    gt(
                        sql`DATE_PART('day', NOW()::timestamp - ${reportConfigTable.timestampLast})`,
                        reportConfigTable.interval,
                    ),
                    and(
                        eq(
                            sql`DATE_PART('day', NOW()::timestamp - ${reportConfigTable.timestampLast})`,
                            reportConfigTable.interval,
                        ),
                        lte(reportConfigTable.time, new Date().getHours()),
                    ),
                ),
                eq(userTable.isActive, true),
            ),
        );
}

export async function getLastReportForUser(userId: string): Promise<LastReport | null> {
    const userReports = await db
        .select({
            totalEnergyConsumption: reportsTable.totalEnergyConsumption,
            avgEnergyConsumptionPerDay: reportsTable.avgEnergyConsumptionPerDay,
            totalEnergyCost: reportsTable.totalEnergyCost,
            avgEnergyCost: reportsTable.avgEnergyCost,
            bestDay: {
                day: reportsTable.bestDay,
                consumption: reportsTable.bestDayConsumption,
            },
            worstDay: {
                day: reportsTable.worstDay,
                consumption: reportsTable.worstDayConsumption,
            },
        })
        .from(reportsTable)
        .where(eq(reportsTable.userId, userId))
        .orderBy(desc(reportsTable.timestamp))
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

export async function getMetaDataOfAllReportsForUser(userId: string, limit: number) {
    return db
        .select({
            id: reportsTable.id,
            dateFrom: reportsTable.dateFrom,
            dateTo: reportsTable.dateTo,
        })
        .from(reportsTable)
        .where(eq(reportsTable.userId, userId))
        .orderBy(desc(reportsTable.timestamp))
        .limit(limit);
}

export async function getLastReportIdByUser(userId: string) {
    const result = await db
        .select({ id: reportsTable.id })
        .from(reportsTable)
        .where(eq(reportsTable.userId, userId))
        .orderBy(desc(reportsTable.timestamp))
        .limit(1);

    return result.length > 0 ? result[0].id : undefined;
}

export async function getReportByIdAndUser(reportId: string, userId: string): Promise<ReportProps | null> {
    const report = await db
        .select({
            id: reportsTable.id,
            dateFrom: reportsTable.dateFrom,
            dateTo: reportsTable.dateTo,
            totalEnergyConsumption: reportsTable.totalEnergyConsumption,
            avgEnergyConsumptionPerDay: reportsTable.avgEnergyConsumptionPerDay,
            totalEnergyCost: reportsTable.totalEnergyCost,
            avgEnergyCost: reportsTable.avgEnergyCost,
            bestDay: reportsTable.bestDay,
            bestDayConsumption: reportsTable.bestDayConsumption,
            worstDay: reportsTable.worstDay,
            worstDayConsumption: reportsTable.worstDayConsumption,
            timestamp: reportsTable.timestamp,
        })
        .from(reportsTable)
        .where(and(eq(reportsTable.userId, userId), eq(reportsTable.id, reportId)));

    if (report.length === 0) {
        return null;
    }

    const reportBefore = await db
        .select({
            id: reportsTable.id,
            totalEnergyConsumption: reportsTable.totalEnergyConsumption,
            avgEnergyConsumptionPerDay: reportsTable.avgEnergyConsumptionPerDay,
            totalEnergyCost: reportsTable.totalEnergyCost,
            avgEnergyCost: reportsTable.avgEnergyCost,
            bestDay: {
                day: reportsTable.bestDay,
                consumption: reportsTable.bestDayConsumption,
            },
            worstDay: {
                day: reportsTable.worstDay,
                consumption: reportsTable.worstDayConsumption,
            },
        })
        .from(reportsTable)
        .where(and(eq(reportsTable.userId, userId), lt(reportsTable.timestamp, report[0].timestamp)))
        .orderBy(desc(reportsTable.timestamp))
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
            date: reportsDayStatisticsTable.date,
            dailyConsumption: reportsDayStatisticsTable.dailyConsumption,
            dailyGoal: reportsDayStatisticsTable.dailyGoal,
            exceeded: reportsDayStatisticsTable.exceeded,
            progress: reportsDayStatisticsTable.progress,
        })
        .from(reportsDayStatisticsTable)
        .where(eq(reportsDayStatisticsTable.reportId, reportId))
        .orderBy(reportsDayStatisticsTable.date);

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
        await trx.insert(reportsTable).values({
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
            const id = genId(35);
            await trx.insert(reportsDayStatisticsTable).values({
                id,
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
