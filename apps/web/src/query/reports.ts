import { getDemoMetaDataOfReports, getDemoReport, getDemoReportIds } from "@/lib/demo/demo";
import {
    getLastReportIdByUser,
    getMetaDataOfAllReportsForUser,
    getReportByIdAndUser,
} from "@energyleaf/postgres/query/report";
import { cache } from "react";
import "server-only";

export const getLastReportId = cache(async (userId: string) => {
    if (userId === "demo") {
        return getDemoReportIds()[0];
    }
    const reportId = await getLastReportIdByUser(userId);
    return reportId;
});

export const getMetaDataOfReports = cache(async (userId: string, limit: number) => {
    if (userId === "demo") {
        return getDemoMetaDataOfReports();
    }
    const metadata = await getMetaDataOfAllReportsForUser(userId, limit);
    return metadata;
});

export const getReportById = cache(async (reportId: string, userId: string) => {
    if (userId === "demo") {
        return getDemoReport();
    }
    const report = await getReportByIdAndUser(reportId, userId);
    return report;
});
