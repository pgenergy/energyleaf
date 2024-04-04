import React from "react";
import { Body, Container, Head, Html, Img, Preview, Tailwind, Text } from "@react-email/components";
import { BadgeEuroIcon, BarChart3, CircleSlash2, RadioReceiver, ReceiptEuroIcon, Zap } from "lucide-react";

import config from "@energyleaf/tailwindcss/mail-config";

import DayTile from "../components/dayTile";
import Footer from "../components/footer";
import Header from "../components/header";
import Tile from "../components/tile";
import { ReportProps } from "../types/reportProps";

export default function ReportTemplate(props: ReportProps) {
    return (
        <Html lang="de">
            <Preview>Energyleaf Bericht für {props.dateFrom}</Preview>
            <Head />
            <Tailwind
                config={{
                    ...config,
                }}
            >
                <Body className="bg-background font-sans text-foreground">
                    <Container className="mx-auto flex max-w-xl flex-row justify-center px-8 py-4">
                        <Header heading={`Bericht von ${props.dateFrom}`} />

                        <Container className="mb-8 px-4">
                            <Text>Hallo {props.name},</Text>
                            <Text>Hier ist Ihre Energieverbrauch-Übersicht für den Zeitraum vom {props.dateFrom.toLocaleDateString()} bis
                                zum  {props.dateTo.toLocaleDateString()}:</Text>
                        </Container>

                        <div className="flex flex-row justify-evenly">
                            {props.dayStatistics?.map((x) => <DayTile stats={x} />)}
                        </div>

                        <div className="mb-4 flex flex-row flex-wrap items-stretch justify-evenly gap-4">
                            <Tile visible={true} large={true} icon={<Zap />} heading="Energieverbrauch">
                                <div>
                                    <div className="flex flex-row items-center justify-center">
                                        {props.totalEnergyConsumption}{" kwh"}
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

                            <Tile visible={true} large={false} icon={<BarChart3 />} heading="Höchster Peak"></Tile>

                            <Tile visible={true} large={false} icon={<RadioReceiver />} heading="Größter Verbraucher">
                                props
                            </Tile>

                            <Tile visible={true} large={true} heading="Verbrauch" icon={""}>
                                <Img className="pb-4" src={props.consumptionGraph1} alt="Verbrauch" />
                            </Tile>

                            <Tile visible={true} large={true} heading="Verbrauch" icon={""}>
                                <Img className="pb-4" src={props.consumptionGraph2} alt="Verbrauch" />
                            </Tile>

                            <Tile visible={true} large={true} heading="Verbrauch" icon={""}>
                                <Img className="pb-4" src={props.consumptionGraph3} alt="Verbrauch" />
                            </Tile>
                        </div>
                        <Footer />
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}
