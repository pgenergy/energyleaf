import ReportView from "@/components/reports/ReportView";
import { getSession } from "@/lib/auth/auth.server";
import React from "react";

export const metadata = {
    title: "Berichte | Energyleaf",
};

interface Props {
    params?: {
        id?: string;
    };
}

export default async function ReportsPage(props: Props) {
    const { user } = await getSession();
    if (!user) {
        return null;
    }

    const reportId = props.params?.id;

    if (!reportId) {
        return null;
    }

    return <ReportView reportId={reportId} userId={user.id} />;
}
