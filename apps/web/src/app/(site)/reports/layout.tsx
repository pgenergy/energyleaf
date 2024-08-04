import ReportSelector from "@/components/reports/ReportSelector";
import { getSession } from "@/lib/auth/auth.server";
import {getLastReportIdByUser, getMetaDataOfAllReportsForUser, getReportByIdAndUser} from "@energyleaf/db/query";
import { Card, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { redirect } from "next/navigation";
import React from "react";
import {Button} from "@energyleaf/ui/button";
import {formatDate} from "@energyleaf/lib";

interface Props {
    searchParams?: {
        id?: string;
    };
    children: React.ReactNode;
}

export default async function ReportsPageLayout(props: Props) {
    const { user } = await getSession();
    if (!user) {
        redirect("/");
    }

    const last20Reports = await getMetaDataOfAllReportsForUser(user.id, 20);

    let reportId = props.searchParams?.id;
    if (!reportId) {
        reportId = await getLastReportIdByUser(user.id);
    }
    const report = reportId ? await getReportByIdAndUser(reportId, user.id) : undefined;

    if (!last20Reports || last20Reports.length === 0) {
        return (
            <div className="flex flex-col gap-4">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Berichte</CardTitle>
                        <CardDescription>
                            Es wurde bisher noch kein Bericht für Sie erstellt. Kommen Sie später nochmal wieder. Sie
                            können das Intervall, in dem Ihr Berichte erstellt werden{" "}
                            <a
                                className="text-primary hover:underline"
                                href="/settings/reports"
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                hier
                            </a>{" "}
                            in den Einstellungen konfigurieren.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    console.log(report.dateTo > report.dateFrom);
    const stringEnd = report.dateTo > report.dateFrom ? `bis zum ${formatDate(report.dateTo)}` : "";

    return (
        <div className="gap-4">
            <h1 className="font-bold text-2xl">Aktueller und vergangene Berichte</h1>
            <div className="flex gap-4">
            <ReportSelector />
                <div>
                    {/*<Button onClick={() => redirect("/reports")}>Alle Berichte</Button>*/}
                    <div className="flex flex-row gap-4">Bericht vom {formatDate(report.dateFrom)} {stringEnd}</div>
                    {/*<Button onClick={() => redirect("/reports")}>T</Button>*/}
                </div>
            </div>
            {props.children}
        </div>
    );
}
