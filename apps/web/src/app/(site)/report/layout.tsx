import EnergyPageRangeSelector from "@/components/energy/ui/range-selector";
import { getSession } from "@/lib/auth/auth.server";
import {getMetaDataOfAllReportsForUser, getReportByIdAndUser} from "@energyleaf/db/query";
import { Card, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { redirect } from "next/navigation";
import React from "react";

interface Props {
    children: React.ReactNode;
    searchParams?: {
        id?: string;
    };
}

export default async function ReportPageLayout(props: Props) {
    const { user } = await getSession();
    if (!user) {
        redirect("/");
    }

    const last20Reports = await getMetaDataOfAllReportsForUser(user.id, 20);

    if (!last20Reports) {
        return (
            <div className="flex flex-col gap-4">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Berichte</CardTitle>
                        <CardDescription>
                            Es wurden noch keine Berichte erstellt. Kommen Sie später nochmal wieder. Sie können Ihre
                            Berichtsintervalle in den Einstellungen konfigurieren.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    if (!props.searchParams?.id) {
        const search = new URLSearchParams();
        search.set("id", last20Reports[0].id);
        redirect(`/report/?${search.toString()}`);
    }

    const reportId = props.searchParams.id;
    const report = await getReportByIdAndUser(reportId, user.id);

    if (!report) {
        return (
            <div className="flex flex-col gap-4">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Bericht</CardTitle>
                        <CardDescription>Der Bericht konnte nicht gefunden werden.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="gap-4">
            <h1 className="font-bold text-2xl">Berichte</h1>
            <EnergyPageRangeSelector />
            {props.children}
        </div>
    );
}
