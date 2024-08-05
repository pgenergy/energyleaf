"use client";

import { formatDate } from "@energyleaf/lib";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@energyleaf/ui/select";
import { differenceInDays } from "date-fns";
import { useRouter } from "next/navigation";

interface ReportSelectorProps {
    last20Reports: Array<{ id: string; dateFrom: Date; dateTo: Date }>;
    reportId: string;
}

export default function ReportSelector({ last20Reports, reportId }: ReportSelectorProps) {
    const router = useRouter();
    const preselectedReport = last20Reports.find((report) => report.id === reportId);

    const handleChange = (value: string) => {
        router.push(`/reports/${value}`);
    };

    return (
        <div className={"w-200"}>
            <Select defaultValue={preselectedReport ? preselectedReport.id : undefined} onValueChange={handleChange}>
                <SelectTrigger className=" text-lg">
                    <SelectValue placeholder="Wähle einen Bericht" className="w-full" />
                </SelectTrigger>
                <SelectContent>
                    {last20Reports.map((report) => {
                        const reportHasMoreThanOneDay = !(differenceInDays(report.dateTo, report.dateFrom) === 1);
                        const dateString = reportHasMoreThanOneDay
                            ? `Bericht ${formatDate(report.dateFrom)} - ${formatDate(report.dateTo)}`
                            : `Bericht vom ${formatDate(report.dateFrom)}`;
                        return (
                            <SelectItem key={report.id} value={report.id} className="text-lg">
                                {dateString}
                            </SelectItem>
                        );
                    })}
                </SelectContent>
            </Select>
        </div>
    );
}
