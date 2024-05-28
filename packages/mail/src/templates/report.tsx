import { Container, Head, Html, Img, Preview, Text } from "@react-email/components";
import { BadgeEuroIcon, BarChart3, RadioReceiver, ReceiptEuroIcon, Zap } from "lucide-react";
import React from "react";

import type { ReportProps } from "@energyleaf/lib";
import { Footer, Header, Main, UnsubscribeText } from "../components";
import DayTile from "../components/dayTile";
import Tile from "../components/tile";

export default function ReportTemplate(props: ReportProps, unsubscribeLink: string) {
    return (
        <Html lang="de">
            <Preview>Energyleaf Bericht für {props.dateFrom}</Preview>
            <Head />
            <Main>
                <Header>{`Bericht von ${props.dateFrom}`}</Header>

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
                                {props.avgEnergyConsumptionPerDay}
                                {" kWh"}
                                <span className="pl-1 font-normal">∅ pro Tag</span>
                            </div>
                        </div>
                    </Tile>

                    <Tile visible={true} large={false} icon={<BadgeEuroIcon />} heading="Gesamte Energiekosten">
                        <>{props.totalEnergyCost} €</>
                    </Tile>

                    <Tile
                        visible={true}
                        large={false}
                        icon={<ReceiptEuroIcon />}
                        heading="Durchschnittliche Energiekosten pro Tag"
                    >
                        <>{props.avgEnergyCost} €</>
                    </Tile>

                    <Tile visible={true} large={false} icon={<BarChart3 />} heading="Höchster Peak">
                        {!props.highestPeak ? (
                            <></>
                        ) : (
                            <div>
                                <div>{props.highestPeak.deviceName}</div>
                                <div>{props.highestPeak.consumption}{" kWh"}</div>
                                <div>{props.highestPeak.dateTime}</div>
                            </div>
                        )}
                    </Tile>

                    <Tile visible={true} large={false} icon={<RadioReceiver />} heading="Größter Verbraucher">
                        <div />
                    </Tile>

                    <Tile visible={true} large={true} heading="Verbrauch" icon={null}>
                        <Img className="pb-4" src={props.consumptionGraph1} alt="Verbrauch" />
                    </Tile>

                    <Tile visible={true} large={true} heading="Verbrauch" icon={null}>
                        <Img className="pb-4" src={props.consumptionGraph2} alt="Verbrauch" />
                    </Tile>

                    <Tile visible={true} large={true} heading="Verbrauch" icon={null}>
                        <Img className="pb-4" src={props.consumptionGraph3} alt="Verbrauch" />
                    </Tile>
                </div>
                <UnsubscribeText href={unsubscribeLink} />
                <Footer />
            </Main>
        </Html>
    );
}
