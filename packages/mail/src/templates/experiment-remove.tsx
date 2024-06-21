import { Container, Head, Html, Preview, Text } from "@react-email/components";
import { Footer } from "../components/footer";
import { Header } from "../components/header";
import { Main } from "../components/main";

interface Props {
    name: string;
}

export default function ExperimentRemovedTemplate({ name }: Props) {
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
                        wir danken Ihnen herzlich für Ihr Interesse an unserem Projekt und Ihre Bereitschaft zur
                        Teilnahme. Nach sorgfältiger Prüfung Ihrer Angaben müssen wir Ihnen leider mitteilen, dass eine
                        Teilnahme aktuell nicht möglich ist. Mögliche Gründe für den Teilnahmeausschluss sind:
                    </Text>
                </Container>
                <Container className="px-4">
                    <Text>
                        - Ungeeigneter Stromzähler
                        <br />- Unpassende Antwort bei der Aufmerksamkeitsprüfung in den Umfragen
                        <br />
                        <br />
                        Wir bedauern sehr, dass wir Ihnen diese Nachricht überbringen müssen.
                    </Text>
                </Container>
                <Container className="px-4">
                    <Text>
                        Falls Sie Fragen zu dieser Entscheidung haben oder weitere Informationen benötigen, stehen wir
                        Ihnen selbstverständlich gerne zur Verfügung. Nochmals vielen Dank für Ihr Interesse und Ihr
                        Verständnis.
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
