"use client";

import { convertTZDate, formatDate } from "@energyleaf/lib";
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
        <div>
            <Select defaultValue={preselectedReport ? preselectedReport.id : undefined} onValueChange={handleChange}>
                <SelectTrigger>
                    <SelectValue placeholder="Wähle einen Bericht" />
                </SelectTrigger>
                <SelectContent>
                    {last20Reports.map((report) => {
                        const from = convertTZDate(report.dateFrom, "client");
                        const to = convertTZDate(report.dateTo, "client");

                        const reportHasMoreThanOneDay = differenceInDays(to, from) > 0;
                        const dateString = reportHasMoreThanOneDay
                            ? `Bericht ${formatDate(from)} - ${formatDate(to)}`
                            : `Bericht vom ${formatDate(from)}`;
                        return (
                            <SelectItem key={report.id} value={report.id}>
                                {dateString}
                            </SelectItem>
                        );
                    })}
                </SelectContent>
            </Select>
        </div>
    );
}
