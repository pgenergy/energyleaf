import { Container, Head, Html, Img, Preview, Text } from "@react-email/components";
import { BadgeEuroIcon, ReceiptEuroIcon, ThumbsDown, ThumbsUp, Zap } from "lucide-react";
import React from "react";

import { type ReportProps, formatDate, formatNumber, getDayOfWeek } from "@energyleaf/lib";
import { Footer, Header, Main, UnsubscribeText } from "../components";
import Card from "../components/card";
import DayTile from "../components/day-tile";
import Tile from "../components/tile";

export default function ReportTemplate(props: ReportProps, unsubscribeLink: string) {
    const dateForm = formatDate(props.dateFrom);
    const dateTo = formatDate(props.dateTo);

    return (
        <Html lang="de">
            <Preview>
                Energyleaf Bericht für {dateForm} bis {dateTo}
            </Preview>
            <Head />
            <Main>
                <Header>{`Bericht von ${dateForm} bis ${dateTo}`}</Header>

                <Container className="mb-8 px-4">
                    <Text>Hallo {props.userName},</Text>
                    <Text>
                        Hier ist Ihre Energieverbrauch-Übersicht für den Zeitraum vom {dateForm} bis zum {dateTo}:
                    </Text>
                </Container>

                <Tile visible={(props.dayEnergyStatistics?.length ?? 0) > 0} heading="Tägliche Ziele">
                    <div className="grid-flow grid grid-cols-3 justify-evenly">
                        {props.dayEnergyStatistics?.map((x) => (
                            <DayTile key={x.day.toDateString()} stats={x} />
                        ))}
                    </div>
                </Tile>

                <Tile heading="Aktuelle Kennzahlen">
                    <div className="grid grid-cols-2 gap-2">
                        <Card heading="Verbrauch Gesamt" icon={<Zap />}>{`${props.totalEnergyConsumption} kWh`}</Card>
                        <Card heading="Durschnittl. Verbrauch pro Tag" icon={<Zap />}>
                            {`${formatNumber(props.avgEnergyConsumptionPerDay)} kWh`}
                        </Card>
                        <Card heading="Energiekosten Gesamt" icon={<BadgeEuroIcon />}>
                            {`${formatNumber(props.totalEnergyCost)} €`}
                        </Card>
                        <Card heading="Durschschnittl. Energiekosten pro Tag" icon={<ReceiptEuroIcon />}>
                            {`${formatNumber(props.avgEnergyCost)} €`}
                        </Card>
                        <Card heading="Bester Tag" icon={<ThumbsUp className="text-primary" />}>
                            <div className="flex flex-col items-center gap-1">
                                <span>{getDayOfWeek(props.bestDay.day)}</span>
                                <span>{formatDate(props.bestDay.day)}</span>
                                <span>{`${formatNumber(props.bestDay.consumption)} kWh`}</span>
                            </div>
                        </Card>
                        <Card heading="Schlechtester Tag" icon={<ThumbsDown className="text-destructive" />}>
                            <div className="flex flex-col items-center gap-1">
                                <span>{getDayOfWeek(props.worstDay.day)}</span>
                                <span>{formatDate(props.worstDay.day)}</span>
                                <span>{`${formatNumber(props.worstDay.consumption)} kWh`}</span>
                            </div>
                        </Card>
                    </div>
                </Tile>

                <Tile heading="Absoluter Tagesverbrauch">
                    <Img className="pb-4" src={props.consumptionGraph1} alt="Graph mit absolutem Tagesverbrauch" />
                </Tile>

                <UnsubscribeText href={unsubscribeLink} />
                <Footer />
            </Main>
        </Html>
    );
}
