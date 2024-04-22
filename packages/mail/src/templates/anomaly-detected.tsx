import { Container, Head, Html, Preview, Text } from "@react-email/components";

import { ButtonAlt, CustomButton, Footer, Header, Main } from "../components";
import AnomalyProps from "../types/AnomalyProps";

export default function AnomalyDetectedTemplate({ name, link, unsubscribeLink }: AnomalyProps) {
    return (
        <Html lang="de">
            <Preview>Energyleaf hat </Preview>
            <Head />
            <Main>
                <Header>Passwort geändert</Header>
                <Container className="px-4">
                    <Text>
                        Hallo {name}, <br />
                        <br />
                        Energyleaf hat festgestellt, dass Sie aktuell viel Strom verbrauchen. Wollen Sie sich Ihren
                        Stromverbrauch anschauen?
                    </Text>
                    <CustomButton href={link}>Zur Übersicht</CustomButton>
                    <ButtonAlt href={link} />
                </Container>
                <Footer />
            </Main>
        </Html>
    );
}
