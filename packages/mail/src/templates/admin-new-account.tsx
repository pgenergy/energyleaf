import { Container, Head, Html, Preview, Text } from "@react-email/components";
import { Footer, Header, Main } from "../components";

interface Props {
    name: string;
    mail: string;
    meter: string;
}

export default function AdminNewAccountCreatedTemplate({ name, meter, mail }: Props) {
    return (
        <Html lang="de">
            <Preview>Energyleaf Konto erstellt.</Preview>
            <Head />
            <Main>
                <Header>Neues Konto erstellt.</Header>
                <Container className="px-4">
                    <Text>
                        Es wurde ein neues Konto auf energyleaf.de erstellt.
                        <br />
                        Folgende Details gibt es zu diesem Account:
                        <br />
                        <br />- Username: {name} <br />- E-Mail: {mail}
                        <br />- Zähler: {meter}
                        <br />
                    </Text>
                </Container>
                <Footer />
            </Main>
        </Html>
    );
}
