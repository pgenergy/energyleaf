import { Container, Head, Html, Preview, Text } from "@react-email/components";
import { ButtonAltText, CustomButton, Footer, Header, Main, UnsubscribeText } from "../components";
import type { AnomalyProps } from "../types";

export default function AnomalyDetectedTemplate({ name, link, unsubscribeLink }: AnomalyProps) {
    return (
        <Html lang="de">
            <Preview>Energyleaf hat festgestellt, dass Sie aktuell viel Strom verbrauchen.</Preview>
            <Head />
            <Main>
                <Header>Stromverbrauch anschauen?</Header>
                <Container className="px-4">
                    <Text>
                        Hallo {name}, <br />
                        <br />
                        Energyleaf hat festgestellt, dass Sie aktuell viel Strom verbrauchen. Wollen Sie sich Ihren
                        Stromverbrauch anschauen?
                    </Text>
                    <CustomButton href={link}>Zur Übersicht</CustomButton>
                    <ButtonAltText href={link} />
                    <UnsubscribeText href={unsubscribeLink} />
                </Container>
                <Footer />
            </Main>
        </Html>
    );
}
