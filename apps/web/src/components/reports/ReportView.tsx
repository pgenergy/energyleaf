import React from "react";
import {Card, CardDescription, CardHeader, CardTitle} from "@energyleaf/ui/card";
import {getReportByIdAndUser} from "@energyleaf/db/query";

interface Props {
    reportId?: string;
    userId?: string;
}

export default async function ReportView (props: Props) {



    const report = await getReportByIdAndUser(props.reportId, props.userId);

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
        <div className="flex flex-col gap-4">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Berichte</CardTitle>
                    <CardDescription>Toller Bericht hier oder?</CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
}