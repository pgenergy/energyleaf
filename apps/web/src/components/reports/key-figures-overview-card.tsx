import {
    type ReportProps,
    type TrendModes,
    formatDate,
    formatNumber,
    getDayOfWeek,
    getTrendMode,
} from "@energyleaf/lib";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { TrendIcon } from "@energyleaf/ui/utils/trend-icon";
import { BadgeEuroIcon, ReceiptEuroIcon, ThumbsDown, ThumbsUp, Zap } from "lucide-react";
import React from "react";

interface Props {
    report: ReportProps | undefined;
}

interface KeyFiguresCardProps {
    text: string;
    icon: React.ReactNode;
    currentValue: number;
    lastValue?: number;
    unit: string;
}

function KeyFiguresCard({ text, icon, currentValue, lastValue, unit }: KeyFiguresCardProps) {
    const mode: TrendModes = getTrendMode(lastValue, currentValue);
    console.log(lastValue, currentValue, mode);
    return (
        <div className={"rounded bg-muted p-2 text-center"}>
            {icon}
            <div className={"h-4"}>{text} </div>
            {lastValue && (
                <div className={"pt-3 text-xs"}>
                    <TrendIcon size={4} mode={mode} />
                    <div className="font-semibold">Vorheriger Bericht:</div>
                    <div>
                        {" "}
                        `${formatNumber(lastValue)} ${unit}`{" "}
                    </div>
                </div>
            )}
            <div>{`${formatNumber(currentValue)} ${unit}`}</div>
        </div>
    );
}

interface DateCardProps {
    text: string;
    icon: React.ReactNode;
    date: Date;
    valueOfDate: number;
    unit: string;
}

function DayCard({ text, icon, date, valueOfDate, unit }: DateCardProps) {
    return (
        <div className={"rounded bg-muted p-2 text-center"}>
            <div> {icon}</div>
            <div>{text}</div>
            <div>{getDayOfWeek(date)}</div>
            <div>{formatDate(date)}</div>
            <div>{`${formatNumber(valueOfDate)} ${unit}`}</div>
        </div>
    );
}

export default function KeyFiguresOverviewCard({ report }: Props) {
    if (!report) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Aktuelle Kennzahlen</CardTitle>
                <CardDescription>Hier sehen Sie Ihre Kennzahlen für die vergangene Periode.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-2">
                <KeyFiguresCard
                    text={"Verbrauch Gesamt"}
                    icon={<Zap />}
                    currentValue={report.totalEnergyConsumption}
                    unit={"kWh"}
                    lastValue={report.lastReport?.totalEnergyConsumption}
                />
                <KeyFiguresCard
                    text={"Durschnittl. Verbrauch pro Tag"}
                    icon={<Zap />}
                    currentValue={report.avgEnergyConsumptionPerDay}
                    unit={"kWh"}
                    lastValue={report.lastReport?.avgEnergyConsumptionPerDay}
                />
                <KeyFiguresCard
                    text={"Gesamtkosten"}
                    icon={<BadgeEuroIcon />}
                    currentValue={report.totalEnergyCost ?? 0}
                    unit={"€"}
                    lastValue={report.lastReport?.totalEnergyCost}
                />
                <KeyFiguresCard
                    text={"Durschschnittl. Energiekosten pro Tag"}
                    icon={<ReceiptEuroIcon />}
                    currentValue={report.avgEnergyCost ?? 0}
                    unit={"€"}
                    lastValue={report.lastReport?.avgEnergyCost}
                />
                <DayCard
                    text={"Bester Tag"}
                    icon={<ThumbsUp />}
                    date={report.bestDay.day}
                    valueOfDate={report.bestDay.consumption}
                    unit={"kWh"}
                />
                <DayCard
                    text={"Schlechtester Tag"}
                    icon={<ThumbsDown />}
                    date={report.worstDay.day}
                    valueOfDate={report.worstDay.consumption}
                    unit={"kWh"}
                />
            </CardContent>
        </Card>
    );
}
