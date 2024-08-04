import { Container, Head, Html, Img, Preview, Row, Section, Text } from "@react-email/components";
import { BadgeEuroIcon, ReceiptEuroIcon, ThumbsDown, ThumbsUp, Zap } from "lucide-react";
import React from "react";

import { type ReportProps, TrendModes, formatDate, formatNumber, getDayOfWeek, getTrendMode } from "@energyleaf/lib";
import { Footer, Header, Main, UnsubscribeText } from "../components";
import Card from "../components/card";
import Centering from "../components/centering";
import DayTile from "../components/day-tile";
import HalfRow from "../components/half-row";
import MetricCard from "../components/metric-card";
import Tile from "../components/tile";
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
                    <Section align="center">
                        {dayEnergyStatistics?.map((x) => (
                            <Row key={x.day.toDateString()}>
                                <DayTile stats={x} />
                            </Row>
                        ))}
                    </Section>
                </Tile>

                <Tile heading="Aktuelle Kennzahlen">
                    <Section>
                        <HalfRow>
                            <MetricCard
                                heading="Verbrauch Gesamt"
                                icon={<Zap />}
                                lastReportInfo={
                                    lastReport && {
                                        mode: getTrendMode(lastReport.totalEnergyConsumption, totalEnergyConsumption),
                                        lastReportElement: () =>
                                            `${formatNumber(lastReport.totalEnergyConsumption)} kWh`,
                                    }
                                }
                            >
                                {`${formatNumber(totalEnergyConsumption)} kWh`}
                            </MetricCard>
                            <MetricCard
                                heading="Durchschnittl. Verbrauch pro Tag"
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
                        </HalfRow>
                        <HalfRow>
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
                                heading="Durchschnittl. Energiekosten pro Tag"
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
                        </HalfRow>
                        <HalfRow>
                            <Card heading="Bester Tag" icon={<ThumbsUp className="text-primary" />}>
                                <Row>{getDayOfWeek(bestDay.day)}</Row>
                                <Row>{formatDate(bestDay.day)}</Row>
                                <Row>{`${formatNumber(bestDay.consumption)} kWh`}</Row>
                            </Card>
                            <Card heading="Schlechtester Tag" icon={<ThumbsDown className="text-destructive" />}>
                                <Row>{getDayOfWeek(worstDay.day)}</Row>
                                <Row>{formatDate(worstDay.day)}</Row>
                                <Row>{`${formatNumber(worstDay.consumption)} kWh`}</Row>
                            </Card>
                        </HalfRow>
                    </Section>
                </Tile>

                <Tile heading="Absoluter Tagesverbrauch">
                    <Img className="pb-4" src={dailyTotalConsumptionGraph} alt="Graph mit absolutem Tagesverbrauch" />
                </Tile>

                <Centering>
                    <UnsubscribeText href={unsubscribeLink} />
                    <Footer />
                </Centering>
            </Main>
        </Html>
    );
}
