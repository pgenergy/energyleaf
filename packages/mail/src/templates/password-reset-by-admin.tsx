import { Container, Head, Html, Preview, Text } from "@react-email/components";
import { ButtonAltText, CustomButton, Footer, Header, Main } from "../components";

interface Props {
    name: string;
    link: string;
}

export default function PasswordResetByAdminTemplate({ name, link }: Props) {
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
                        diese E-Mail wurde von einem Administrator gesendet, damit Sie Ihr Passwort zurücksetzen können.
                        Bitte klicken Sie hierzu auf den Link unten. Aus Sicherheitsgründen ist dieser nur eine Stunde
                        gültig.
                    </Text>
                </Container>
                <CustomButton href={link}>Passwort zurücksetzen</CustomButton>
                <Container className="px-4">
                    <Text>Sollten Sie kein neues Passwort benötigen, kann diese E-Mail ignoriert werden.</Text>
                </Container>
                <ButtonAltText href={link} />
                <Footer />
            </Main>
        </Html>
    );
}
