import { Container, Head, Html, Img, Preview, Text } from "@react-email/components";
import { BadgeEuroIcon, BarChart3, CircleSlash2, RadioReceiver, ReceiptEuroIcon, Zap } from "lucide-react";
import React from "react";

import { Footer, Header, Main, UnsubscribeText } from "../components";
import DayTile from "../components/dayTile";
import Tile from "../components/tile";
import type { ReportProps } from "../types/reportProps";

export default function ReportTemplate(props: ReportProps) {
    return (
        <Html lang="de">
            <Preview>Energyleaf Bericht für {props.dateFrom}</Preview>
            <Head />
            <Main>
                <Header>Bericht von {props.dateFrom}</Header>

                <Container className="mb-8 px-4">
                    <Text>Hallo {props.name},</Text>
                    <Text>
                        Hier ist Ihre Energieverbrauch-Übersicht für den Zeitraum vom {props.dateFrom} bis zum{" "}
                        {props.dateTo}:
                    </Text>
                </Container>

                <div className="flex flex-row justify-evenly">
                    {props.dayEnergyStatistics?.map((x) => (
                        <DayTile key={x.day} stats={x} />
                    ))}
                </div>

                <div className="mb-4 flex flex-row flex-wrap items-stretch justify-evenly gap-4">
                    <Tile visible={true} large={true} icon={<Zap />} heading="Energieverbrauch">
                        <div>
                            <div className="flex flex-row items-center justify-center">
                                {props.totalEnergyConsumption}
                                {" kWh"}
                                <span className="pl-1 font-normal">insgesamt</span>
                            </div>
                            <div className="flex flex-row items-center justify-center">
                                <CircleSlash2 size={16} />
                                <Text className="m-0 ml-1">pro Tag {props.avgEnergyConsumptionPerDay}</Text>
                            </div>
                        </div>
                    </Tile>

                    <Tile visible={true} large={false} icon={<BadgeEuroIcon />} heading="Gesamte Energiekosten">
                        {props.totalEnergyCost}
                    </Tile>

                    <Tile
                        visible={true}
                        large={false}
                        icon={<ReceiptEuroIcon />}
                        heading="Durchschnittliche Energiekosten pro Tag"
                    >
                        {props.avgEnergyCost}
                    </Tile>

                    <Tile visible={true} large={false} icon={<BarChart3 />} heading="Höchster Peak">
                        <>
                            {props.highestPeak.deviceName}
                            {props.highestPeak.dateTime}
                            {props.highestPeak.consumption}
                        </>
                    </Tile>
                </div>
                <UnsubscribeText href={props.unsubscribeLink} />
                <Footer />
            </Main>
        </Html>
    );
}
