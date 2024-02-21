import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@energyleaf/ui";
import React, {Suspense} from "react";


export default function ReportPage() {
    return (
        <div className="flex flex-col gap-4">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Berichte</CardTitle>
                    <CardDescription>Hier siehst du zukünftig deine vergangenen Berichte</CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
}