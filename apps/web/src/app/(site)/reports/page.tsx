import ReportView from "@/components/reports/ReportView";
import { getSession } from "@/lib/auth/auth.server";
import { getLastReportIdByUser } from "@energyleaf/db/query";
import React from "react";

export const metadata = {
    title: "Berichte | Energyleaf",
};

interface Props {
    searchParams?: {
        id?: string;
    };
}

export default async function ReportsPage(props: Props) {
    const { user } = await getSession();
    if (!user) {
        return null;
    }

    let reportId = props.searchParams?.id;
    if (!reportId) {
        reportId = await getLastReportIdByUser(user.id);
    }

    if (!reportId) {
        return null;
    }

    return <ReportView reportId={reportId} userId={user.id} />;
}
