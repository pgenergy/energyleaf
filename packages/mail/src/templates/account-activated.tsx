import { Container, Head, Html, Preview, Text } from "@react-email/components";
import { Footer, Header, Main } from "../components";

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
                        Ihr Konto wurde erfolgreich aktiviert. Sie können sich jetzt mit Ihren Zugangsdaten einloggen.
                    </Text>
                </Container>
                <Container className="px-4 text-muted-foreground">
                    <Text>Sollten Sie kein Konto erstellt haben, kontaktieren Sie uns bitte.</Text>
                </Container>
                <Footer />
            </Main>
        </Html>
    );
}
