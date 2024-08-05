import ReportSelector from "@/components/reports/ReportSelector";
import { getSession } from "@/lib/auth/auth.server";
import { getMetaDataOfAllReportsForUser, getReportByIdAndUser } from "@energyleaf/db/query";
import { formatDate } from "@energyleaf/lib";
import { buttonVariants } from "@energyleaf/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { differenceInDays } from "date-fns";
import { ArrowLeft, ArrowRight, SettingsIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
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
        redirect("/");
    }

    const last20Reports = await getMetaDataOfAllReportsForUser(user.id, 20);
    if (!last20Reports || last20Reports.length === 0) {
        return UserHasNoReportsCard();
    }

    const reportId = params.id;

    const report = reportId
        ? await getReportByIdAndUser(reportId, user.id)
        : await getReportByIdAndUser(last20Reports[0].id, user.id);

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
                        <div className="w-200">Hier kannst du einen deiner letzten Berichte auswählen:</div>
                        <div className="mt-3 flex">
                            <ReportSelector reportId={reportId} last20Reports={last20Reports} />
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    const reportHasMoreThanOneDay = !(differenceInDays(report.dateTo, report.dateFrom) === 1);
    const stringEnd = reportHasMoreThanOneDay
        ? `${formatDate(report.dateFrom)} - ${formatDate(report.dateTo)}`
        : ` vom ${formatDate(report.dateFrom)}`;

    const currentIndex = last20Reports.findIndex((r) => r.id === reportId);
    const reportIdBefore = currentIndex < last20Reports.length - 1 ? last20Reports[currentIndex + 1].id : undefined;
    const reportIdAfter = currentIndex > 0 ? last20Reports[currentIndex - 1].id : undefined;

    return (
        <div className="gap-4">
            <h1 className="mb-3 font-bold text-2xl">Aktueller und vergangene Berichte</h1>
            <div className="mb-3 flex w-full items-center justify-between">
                <ReportSelector reportId={reportId} last20Reports={last20Reports} />
                <div className={" flex w-200 items-center rounded px-2 py-1"}>
                    <Link
                        href={reportIdBefore ? `/reports/${reportIdBefore}` : "#"}
                        className={buttonVariants({ variant: reportIdBefore ? "nav" : "ghost" })}
                        aria-disabled={!reportIdBefore}
                    >
                        <ArrowLeft />
                    </Link>
                    <div className="flex flex-row gap-4 text-xl">Bericht {stringEnd}</div>
                    <Link
                        href={reportIdAfter ? `/reports/${reportIdAfter}` : "#"}
                        className={buttonVariants({ variant: reportIdAfter ? "nav" : "ghost" })}
                        aria-disabled={!reportIdAfter}
                    >
                        <ArrowRight />
                    </Link>
                </div>
                <Link className={buttonVariants({ variant: "ghost", size: "icon" })} href="/settings/reports">
                    <SettingsIcon className="h-7 w-7" />
                </Link>
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
