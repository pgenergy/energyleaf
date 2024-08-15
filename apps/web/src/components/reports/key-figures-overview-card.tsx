import { type ReportProps, formatDate, formatNumber, getDayOfWeek, getTrendMode } from "@energyleaf/lib";
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
    return (
        <div className={"flex flex-col justify-between rounded bg-muted p-2 text-center"}>
            <div>
                <div className="mb-2 flex items-center justify-center">{icon}</div>
                <div className={"p-2 font-bold"}>{text} </div>
            </div>
            <div className={""}>
                <div>{`${formatNumber(currentValue)} ${unit}`}</div>
                {lastValue && (
                    <div className={"pt-3 text-xs"}>
                        <div className="mb-2 flex items-center justify-center">
                            <TrendIcon size={20} mode={getTrendMode(lastValue, currentValue)} />
                        </div>
                        <div className="font-semibold">Vorheriger Bericht:</div>
                        <div>
                            {" "}
                            {formatNumber(lastValue)} {unit}{" "}
                        </div>
                    </div>
                )}
            </div>
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
            <div className={"mb-2 flex items-center justify-center"}> {icon}</div>
            <div className={"p-4 font-bold"}>{text}</div>
            <div className={"p-0 text-base"}>
                <div>{getDayOfWeek(date)}</div>
                <div>{formatDate(date)}</div>
                <div>{`${formatNumber(valueOfDate)} ${unit}`}</div>
            </div>
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
                    text={"Durchschnittl. Verbrauch pro Tag"}
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
                    text={"Durchschnittl. Energiekosten pro Tag"}
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
