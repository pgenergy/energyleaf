import ReportSelector from "@/components/reports/ReportSelector";
import { getSession } from "@/lib/auth/auth.server";
import { getMetaDataOfAllReportsForUser } from "@energyleaf/db/query";
import { Card, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { redirect } from "next/navigation";
import React from "react";

interface Props {
    children: React.ReactNode;
}

export default async function ReportsPageLayout(props: Props) {
    const { user } = await getSession();
    if (!user) {
        redirect("/");
    }

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

    return (
        <div className="gap-4">
            <h1 className="font-bold text-2xl">Aktueller und vergangene Berichte</h1>
            <ReportSelector />
            {props.children}
        </div>
    );
}
