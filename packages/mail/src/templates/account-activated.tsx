import { Container, Head, Html, Preview, Text } from "@react-email/components";
import { CustomButton, Footer, Header, Main } from "../components";

interface Props {
    name: string;
}

export default function AccountActivatedTemplate({ name }: Props) {
    return (
        <Html lang="de">
            <Preview>Energyleaf Konto aktiviert.</Preview>
            <Head />
            <Main>
                <Header>Konto aktiviert</Header>
                <Container className="px-4">
                    <Text>
                        Hallo {name}, <br />
                        <br />
                        wir freuen uns, Ihnen mitteilen zu können, dass Ihr Energyleaf-Konto erfolgreich freigeschaltet
                        wurde. Sie können sich nun mit Ihren Zugangsdaten auf unserer Plattform anmelden und alle
                        Funktionen und Dienste nutzen:
                    </Text>
                </Container>
                <CustomButton href="https://energyleaf.de">Zur App</CustomButton>
                <Container>
                    <Text>
                        In einer Woche erhalten Sie die Einladung zur Durchführung der zweiten Umfrage. Falls Sie Fragen
                        zur Nutzung der Plattform haben oder Unterstützung benötigen, stehen wir Ihnen
                        selbstverständlich jederzeit gerne zur Verfügung.
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
