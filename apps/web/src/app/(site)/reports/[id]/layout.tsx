import ReportSelector from "@/components/reports/ReportSelector";
import { getSession } from "@/lib/auth/auth.server";
import { getMetaDataOfReports, getReportById } from "@/query/reports";
import { convertTZDate, formatDate } from "@energyleaf/lib";
import { buttonVariants } from "@energyleaf/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { differenceInDays } from "date-fns";
import { ArrowLeft, ArrowRight, SettingsIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

interface Props {
    children: React.ReactNode;
    params: {
        id: string;
    };
}

export default async function ReportsPageLayout({ children, params }: Props) {
    const { user } = await getSession();
    if (!user) {
        return null;
    }

    const last20Reports = await getMetaDataOfReports(user.id, 20);
    if (!last20Reports || last20Reports.length === 0) {
        return UserHasNoReportsCard();
    }

    const reportId = params.id || last20Reports[0].id;
    const report = await getReportById(reportId, user.id);

    if (!report) {
        return (
            <div className="flex flex-col gap-4">
                <h1 className="font-bold text-2xl">Aktueller und vergangene Berichte</h1>

                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Bericht</CardTitle>
                        <CardDescription>Der Bericht konnte nicht gefunden werden. </CardDescription>
                    </CardHeader>
                    <div className="m-5 w-full items-center justify-between">
                        <div className="w-200">Hier können Sie einen Ihrer letzten Berichte auswählen:</div>
                        <div className="mt-3 flex">
                            <ReportSelector reportId={reportId} last20Reports={last20Reports} />
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    const reportHasMoreThanOneDay =
        differenceInDays(convertTZDate(report.dateTo, "client"), convertTZDate(report.dateFrom, "client")) > 0;
    const stringEnd = reportHasMoreThanOneDay
        ? `${formatDate(convertTZDate(report.dateFrom, "client"))} - ${formatDate(convertTZDate(report.dateTo, "client"))}`
        : ` vom ${formatDate(convertTZDate(report.dateTo, "client"))}`;

    const currentIndex = last20Reports.findIndex((r) => r.id === reportId);
    const reportIdBefore = currentIndex < last20Reports.length - 1 ? last20Reports[currentIndex + 1].id : undefined;
    const reportIdAfter = currentIndex > 0 ? last20Reports[currentIndex - 1].id : undefined;

    return (
        <div className="flex flex-col gap-4">
            <h1 className="font-bold text-xl">Aktueller und vergangene Berichte</h1>
            <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-3">
                <div className="flex flex-row items-center justify-center md:justify-start">
                    <ReportSelector reportId={reportId} last20Reports={last20Reports} />
                </div>
                <div className="flex flex-row items-center justify-center gap-2">
                    <Link
                        href={reportIdBefore ? `/reports/${reportIdBefore}` : "#"}
                        className={buttonVariants({ variant: reportIdBefore ? "nav" : "ghost", size: "icon" })}
                        aria-disabled={!reportIdBefore}
                    >
                        <ArrowLeft />
                    </Link>
                    <p>Bericht {stringEnd}</p>
                    <Link
                        href={reportIdAfter ? `/reports/${reportIdAfter}` : "#"}
                        className={buttonVariants({ variant: reportIdAfter ? "nav" : "ghost", size: "icon" })}
                        aria-disabled={!reportIdAfter}
                    >
                        <ArrowRight />
                    </Link>
                </div>
                <div className="flex flex-row items-center justify-center md:justify-end">
                    <Link className={buttonVariants({ variant: "ghost", size: "icon" })} href="/settings/reports">
                        <SettingsIcon className="h-6 w-6" />
                    </Link>
                </div>
            </div>
            <div className="my-4 border-primary-background border-t" />
            {children}
        </div>
    );
}

function UserHasNoReportsCard() {
    return (
        <div className="flex flex-col gap-4">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Berichte</CardTitle>
                    <CardDescription>
                        Es wurde bisher noch kein Bericht für Sie erstellt. Kommen Sie später nochmal wieder. Sie können
                        das Intervall, in dem Ihr Berichte erstellt werden{" "}
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
