import { Container, Head, Html, Img, Preview, Text } from "@react-email/components";
import { Footer, Header, Main } from "../components";

interface Props {
    name: string;
    mail: string;
    meter: string;
    img?: string;
}

export default function AdminNewAccountCreatedTemplate({ name, meter, mail, img }: Props) {
    return (
        <Html lang="de">
            <Preview>Energyleaf Konto erstellt.</Preview>
            <Head />
            <Main>
                <Header>Neues Konto erstellt.</Header>
                <Container className="flex flex-col gap-2 px-4">
                    <Text>
                        Es wurde ein neues Konto auf energyleaf.de erstellt.
                        <br />
                        Folgende Details gibt es zu diesem Account:
                        <br />
                        <br />- Username: {name} <br />- E-Mail: {mail}
                        <br />- Zähler: {meter}
                    </Text>
                    {img ? <Img src={img} /> : null}
                </Container>
                <Footer />
            </Main>
        </Html>
    );
}
