import { Container, Head, Html, Preview, Text } from "@react-email/components";
import { ButtonAltText, CustomButton, Footer, Header, Main } from "../components";

interface Props {
    name: string;
    link: string;
}

export default function PasswordResetTemplate({ name, link }: Props) {
    return (
        <Html lang="de">
            <Preview>Energyleaf Passwort zurücksetzen</Preview>
            <Head />
            <Main>
                <Header>Passwort zurücksetzen</Header>
                <Container className="px-4">
                    <Text>
                        Hallo {name}, <br />
                        <br />
                        Diese E-Mail wurde als Antwort auf Ihre Anfrage gesendet, Ihr Passwort zurückzusetzen. Bitte
                        klicken Sie hierzu auf den Link unten. Aus Sicherheitsgründen ist dieser nur eine Stunde gültig.
                    </Text>
                </Container>
                <CustomButton href={link}>Passwort zurücksetzen</CustomButton>
                <Container className="px-4">
                    <Text>
                        Sollten Sie nicht um ein neues Passwort gebeten haben, kann diese E-Mail ignoriert werden.
                    </Text>
                </Container>
                <ButtonAltText href={link} />
                <Footer />
            </Main>
        </Html>
    );
}