import { Container, Head, Html, Img, Preview, Text } from "@react-email/components";
import { BadgeEuroIcon, ReceiptEuroIcon, ThumbsDown, ThumbsUp, Zap } from "lucide-react";
import React from "react";

import { type ReportProps, formatDate, formatNumber, getDayOfWeek } from "@energyleaf/lib";
import { Footer, Header, Main, UnsubscribeText } from "../components";
import Card from "../components/card";
import DayTile from "../components/day-tile";
import MetricCard from "../components/metric-card";
import { TrendIcon } from "../components/tend-icon";
import Tile from "../components/tile";
import { TrendModes, getTrendMode } from "../types/trend-modes";

export default function ReportTemplate(
    {
        dateFrom: fromDate,
        dateTo: toDate,
        lastReport,
        userName,
        dayEnergyStatistics,
        totalEnergyConsumption,
        totalEnergyCost,
        avgEnergyConsumptionPerDay,
        avgEnergyCost,
        bestDay,
        worstDay,
        dailyTotalConsumptionGraph,
    }: ReportProps,
    unsubscribeLink: string,
) {
    const dateForm = formatDate(fromDate);
    const dateTo = formatDate(toDate);

    const hasLastReport = !!lastReport;

    return (
        <Html lang="de">
            <Preview>
                Energyleaf Bericht für {dateForm} bis {dateTo}
            </Preview>
            <Head />
            <Main>
                <Header>{`Bericht von ${dateForm} bis ${dateTo}`}</Header>

                <Container className="mb-8 px-4">
                    <Text>Hallo {userName},</Text>
                    <Text>
                        Hier ist Ihre Energieverbrauch-Übersicht für den Zeitraum vom {dateForm} bis zum {dateTo}:
                    </Text>
                </Container>

                <Tile visible={(dayEnergyStatistics?.length ?? 0) > 0} heading="Tägliche Ziele">
                    <div className="flex flex-wrap">
                        {dayEnergyStatistics?.map((x) => (
                            <DayTile key={x.day.toDateString()} stats={x} />
                        ))}
                    </div>
                </Tile>

                <Tile heading="Aktuelle Kennzahlen">
                    <div className="grid grid-cols-2 gap-2">
                        <MetricCard
                            heading="Verbrauch Gesamt"
                            icon={<Zap />}
                            lastReportInfo={
                                lastReport && {
                                    mode: getTrendMode(lastReport.totalEnergyConsumption, totalEnergyConsumption),
                                    lastReportElement: () => `${formatNumber(lastReport.totalEnergyConsumption)} kWh`,
                                }
                            }
                        >
                            {`${formatNumber(totalEnergyConsumption)} kWh`}
                        </MetricCard>
                        <MetricCard
                            heading="Durschnittl. Verbrauch pro Tag"
                            icon={<Zap />}
                            lastReportInfo={
                                lastReport && {
                                    mode: getTrendMode(
                                        lastReport.avgEnergyConsumptionPerDay,
                                        avgEnergyConsumptionPerDay,
                                    ),
                                    lastReportElement: () =>
                                        `${formatNumber(lastReport.avgEnergyConsumptionPerDay)} kWh`,
                                }
                            }
                        >
                            {`${formatNumber(avgEnergyConsumptionPerDay)} kWh`}
                        </MetricCard>
                        <MetricCard
                            heading="Energiekosten Gesamt"
                            icon={<BadgeEuroIcon />}
                            lastReportInfo={
                                lastReport?.totalEnergyCost
                                    ? {
                                          mode: totalEnergyCost
                                              ? getTrendMode(lastReport.totalEnergyCost, totalEnergyCost)
                                              : TrendModes.RIGHT,
                                          lastReportElement: () =>
                                              `${formatNumber(Number(lastReport.totalEnergyCost))} €`,
                                      }
                                    : undefined
                            }
                        >
                            {totalEnergyCost ? `${formatNumber(totalEnergyCost)} €` : <i>Nicht konfiguriert</i>}
                        </MetricCard>
                        <MetricCard
                            heading="Durschschnittl. Energiekosten pro Tag"
                            icon={<ReceiptEuroIcon />}
                            lastReportInfo={
                                lastReport?.avgEnergyCost
                                    ? {
                                          mode: avgEnergyCost
                                              ? getTrendMode(lastReport.avgEnergyCost, avgEnergyCost)
                                              : TrendModes.RIGHT,
                                          lastReportElement: () =>
                                              `${formatNumber(Number(lastReport.avgEnergyCost))} €`,
                                      }
                                    : undefined
                            }
                        >
                            {avgEnergyCost ? `${formatNumber(avgEnergyCost)} €` : <i>Nicht konfiguriert</i>}
                        </MetricCard>
                        <Card heading="Bester Tag" icon={<ThumbsUp className="text-primary" />}>
                            <div className="flex flex-col items-center gap-1">
                                <span>{getDayOfWeek(bestDay.day)}</span>
                                <span>{formatDate(bestDay.day)}</span>
                                <span>{`${formatNumber(bestDay.consumption)} kWh`}</span>
                            </div>
                        </Card>
                        <Card heading="Schlechtester Tag" icon={<ThumbsDown className="text-destructive" />}>
                            <div className="flex flex-col items-center gap-1">
                                <span>{getDayOfWeek(worstDay.day)}</span>
                                <span>{formatDate(worstDay.day)}</span>
                                <span>{`${formatNumber(worstDay.consumption)} kWh`}</span>
                            </div>
                        </Card>
                    </div>
                </Tile>

                <Tile heading="Absoluter Tagesverbrauch">
                    <Img className="pb-4" src={dailyTotalConsumptionGraph} alt="Graph mit absolutem Tagesverbrauch" />
                </Tile>

                <UnsubscribeText href={unsubscribeLink} />
                <Footer />
            </Main>
        </Html>
    );
}
