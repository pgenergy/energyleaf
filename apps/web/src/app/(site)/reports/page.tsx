import React from "react";
import ReportView from "@/components/reports/ReportView";
import {getLastReportIdByUser, getMetaDataOfAllReportsForUser} from "@energyleaf/db/query";
import {getSession} from "@/lib/auth/auth.server";

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

    let reportId = props.searchParams?.id
    if (!reportId){
        reportId = await getLastReportIdByUser(user.id)
    }

    return (
        <ReportView reportId={reportId} userId={user.id} />
    );
}
