import { Container, Head, Html, Preview, Text } from "@react-email/components";
import { Footer } from "../components/footer";
import { Header } from "../components/header";
import { Main } from "../components/main";

interface Props {
    name: string;
}

export default function ExperimentRemovedWrongMeterTemplate({ name }: Props) {
    return (
        <Html lang="de">
            <Preview>Teilnahme nicht möglich.</Preview>
            <Head />
            <Main>
                <Header>Teilnahme nicht möglich</Header>
                <Container className="px-4">
                    <Text>
                        Hallo {name}, <br />
                        <br />
                        wir danken Ihnen sehr herzlich für Ihr Interesse an unserem Projekt und Ihre Bereitschaft zur
                        Teilnahme. Leider sind unsere Sensoren mit Ihrem Zählermodell nicht kompatibel. Sollten Sie
                        dennoch am Projekt teilnehmen wollen, melden Sie sich bitte nochmals bei uns. Es ist unter
                        Umständen möglich mit Ihrem Messstellenbetreiber (der Firma, die Ihren Zähler verwaltet) über
                        einen für Sie kostenlosen Zähleraustausch zu sprechen.
                    </Text>
                </Container>
                <Container className="px-4">
                    <Text>
                        Bitte entschuldigen Sie etwaige Aufwände. Wir hätten gerne im Projekt mit Ihnen gearbeitet.
                        Falls Sie Nachfragen haben, stehen wir Ihnen selbstverständlich gerne zur Verfügung. Nochmals
                        vielen Dank für Ihr Interesse und Ihr Verständnis.
                    </Text>
                </Container>
                <Container className="px-4">
                    <Text>
                        Mit freundlichen Grüßen
                        <br />
                        Jessy und Vanessa von Energyleaf
                    </Text>
                </Container>
                <Footer />
            </Main>
        </Html>
    );
}
