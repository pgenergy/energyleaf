import React from "react";
import {Body, Button, Container, Head, Html, Img, Preview, Tailwind, Text, Link} from "@react-email/components";

import config from "@energyleaf/tailwindcss/mail-config";

import Header from "../components/header";
import { AnomalyProps } from "../types";
import Footer from "../components/footer";

export default function AnomalyDetectedMail(props: AnomalyProps) {
    return (
        <Html lang="de">
            <Preview>Energyleaf hat einen auffälligen Stromverbrauch festgestellt.</Preview>
            <Head/>
            <Tailwind
                config={{
                    ...config,
                }}
            >
                <Body className="bg-background font-sans text-foreground">
                    <Container className="mx-auto flex max-w-xl flex-row justify-center px-8 py-4">
                        <Header heading="Hoher Stromverbrauch festgestellt"/>

                        <Container className="mb-8 px-4">
                            <Text>Hallo {props.name},</Text>
                            <Text>
                                Energyleaf hat festgestellt, dass Sie aktuell viel Strom verbrauchen.
                                Wollen Sie sich Ihren Stromverbrauch anschauen?
                            </Text>
                            <div className="flex flex-row justify-center">
                                <Button className="bg-primary rounded text-white p-2 mb-2">Zur Übersicht</Button>
                            </div>

                            <Container className="mb-8 flex flex-col gap-2 px-4 text-sm text-muted-foreground">
                                <Container>Sollte der Button nicht funktionieren, nutzen Sie folgenden Link:</Container>
                                <Container>
                                    <Link className="text-primary" href={props.link}>
                                        {props.link}
                                    </Link>
                                </Container>
                            </Container>

                            <Container className="mb-8 flex flex-col gap-2 px-4 text-sm text-muted-foreground">
                                <Container>
                                    <Link className="" href={props.link}>
                                        Klicken Sie hier, wenn sie keine weiteren Benachrichtigungen bei Auffälligkeiten erhalten möchten.
                                    </Link>
                                </Container>
                            </Container>
                        </Container>

                        <Footer />
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}