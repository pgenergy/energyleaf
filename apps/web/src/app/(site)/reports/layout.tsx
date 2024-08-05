import ReportSelector from "@/components/reports/ReportSelector";
import { getSession } from "@/lib/auth/auth.server";
import {getLastReportIdByUser, getMetaDataOfAllReportsForUser, getReportByIdAndUser} from "@energyleaf/db/query";
import {formatDate} from "@energyleaf/lib";
import {Button, buttonVariants} from "@energyleaf/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

interface Props {
    children: React.ReactNode;
    params: {
        id: string;
    };
}

export default async function ReportsPageLayout({children, params}: Props) {
    const { user } = await getSession();
    if (!user) {
        redirect("/");
    }

    console.log(params);

    const last20Reports = await getMetaDataOfAllReportsForUser(user.id, 20);
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

    const reportId  = params.id;

    console.log(reportId);

    const report = reportId ? await getReportByIdAndUser(reportId, user.id) : await getReportByIdAndUser(last20Reports[0].id, user.id);

    // console.log(report);

    const stringEnd = report.dateTo > report.dateFrom ? `bis zum ${formatDate(report.dateTo)}` : "";

    const currentIndex = last20Reports.findIndex((r) => r.id === reportId);
    const reportIdBefore = currentIndex < last20Reports.length - 1 ? last20Reports[currentIndex + 1].id : undefined;
    const reportIdAfter = currentIndex > 0 ? last20Reports[currentIndex - 1].id : undefined;

    // console.log(last20Reports);
    // console.log (currentIndex, reportIdBefore, reportIdAfter);

    return (
        <div className="gap-4">
            <h1 className="font-bold text-2xl">Aktueller und vergangene Berichte</h1>
            <div className="flex gap-4">
            <ReportSelector />
                <div className={"flex"}>
                        {reportIdBefore && (
                            <Link
                                href={`/reports/${reportIdBefore}`}
                                className={buttonVariants({
                                    variant: "ghost",
                                })}
                            >
                                Vorheriger Bericht
                            </Link>
                        )}
                    <div className="flex flex-row gap-4">Bericht vom {formatDate(report.dateFrom)} {stringEnd}</div>
                {reportIdAfter && (
                    <Link
                        href={`/reports/${reportIdAfter}`}
                        className={buttonVariants({
                            variant: "ghost",
                        })}
                    >
                        Nächster Bericht
                    </Link>
                )}

            </div>
            </div>
            {children}
        </div>
    );
}
