import { Container, Head, Html, Preview, Text } from "@react-email/components";
import { Footer, Header, Main } from "../components";

interface Props {
    name: string;
    mail: string;
    meter: string;
    meterNumber: string;
    hasWifi: boolean;
    hasPower: boolean;
    participates: boolean;
    img?: string;
}

export default function AdminNewAccountCreatedTemplate({
    name,
    meter,
    mail,
    meterNumber,
    hasWifi,
    hasPower,
    participates,
}: Props) {
    return (
        <Html lang="de">
            <Preview>Energyleaf Konto erstellt.</Preview>
            <Head />
            <Main>
                <Header>Neues Konto erstellt.</Header>
                <Container className="flex flex-col gap-2 px-4">
                    <Text>
                        Es wurde ein neues Konto auf Energyleaf erstellt.
                        <br />
                        Folgende Details gibt es zu diesem Account:
                        <br />
                        <br />- Username: {name} <br />- E-Mail: {mail}
                        <br />- Zähler: {meter}
                        <br />- Zählernummer: {meterNumber}
                        <br />- WLAN: {hasWifi ? "Ja" : "Nein"}
                        <br />- Steckdose: {hasPower ? "Ja" : "Nein"}
                        <br />- Möchte an Umfrage Teilnehmen: {participates ? "Ja" : "Nein"}
                    </Text>
                </Container>
                <Footer />
            </Main>
        </Html>
    );
}
