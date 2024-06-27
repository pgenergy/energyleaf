import { Card, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";
import React from "react";

export const metadata = {
    title: "Berichte | Energyleaf",
};

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
