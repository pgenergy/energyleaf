import { Container, Head, Html, Preview, Text } from "@react-email/components";

import { Footer, Header, Main } from "../components";

interface Props {
    name: string;
}

export default function AccountCreatedTemplate({ name }: Props) {
    return (
        <Html lang="de">
            <Preview>Energyleaf Konto erstellt.</Preview>
            <Head />
            <Main>
                <Header>Konto erstellt</Header>
                <Container className="px-4">
                    <Text>
                        Hallo {name}, <br />
                        <br />
                        Ihr Konto wurde erfolgreich erstellt.
                        <br />
                        Sobald wir Ihren Sensor installiert haben, können Sie sich mit ihren Zugangsdaten einloggen.
                    </Text>
                </Container>
                <Container className="px-4 text-muted-foreground">
                    <Text>Sollten Sie dieses Konto nicht erstellt haben, kontaktieren Sie uns bitte.</Text>
                </Container>
                <Footer />
            </Main>
        </Html>
    );
}
