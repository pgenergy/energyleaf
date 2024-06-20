import { Container, Head, Html, Preview, Text } from "@react-email/components";
import { Footer, Header, Main } from "../components";

interface Props {
    name: string;
}

export default function ExperimentDoneTemplate({ name }: Props) {
    return (
        <Html lang="de">
            <Preview>Vielen Dank für Ihre Teilnahme bei Energyleaf</Preview>
            <Head />
            <Main>
                <Header>Vielen Dank für Ihre Teilnahme bei Energyleaf</Header>
                <Container className="px-4">
                    <Text>
                        Hallo {name}, <br />
                        <br />
                        wir möchten uns herzlich bei Ihnen für Ihre Mitarbeit bedanken. Ihre Teilnahme und Ihr
                        Engagement haben zum Erfolg unseres Projekts beigetragen. Sollten Sie Fragen oder weiteres
                        Feedback haben, stehen wir Ihnen selbstverständlich gerne zur Verfügung. Vielen Dank für Ihre
                        Zeit und Ihr Vertrauen.
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
