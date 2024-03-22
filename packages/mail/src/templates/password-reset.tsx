import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Link,
    Preview,
    Tailwind,
    Text,
} from "@react-email/components";

import config from "@energyleaf/tailwindcss/mail-config";
import Footer from "../components/footer";
import Header from "../components/header";

interface Props {
    name: string;
    link: string;
}

export default function PasswordResetTemplate({ name, link }: Props) {
    return (
        <Html lang="de">
            <Preview>Energyleaf Passwort zurücksetzen</Preview>
            <Head />
            <Tailwind
                config={{
                    ...config,
                }}
            >
                <Body className="bg-background font-sans text-foreground">
                    <Container className="mx-auto flex max-w-lg flex-col gap-4 px-8 py-4">
                        <Header heading="Passwort zurücksetzen" />
                        <Container className="mb-8 px-4">
                            <Text>
                                Hallo {name}, <br />
                                <br />
                                Diese E-Mail wurde als Antwort auf Ihre Anfrage gesendet, Ihr Passwort zurückzusetzen.
                                Bitte klicken Sie hierzu auf den Link unten. Aus Sicherheitsgründen ist dieser nur eine
                                Stunde gültig.
                            </Text>
                        </Container>
                        <Container className="flex justify-center">
                            <Button className="m-0 rounded bg-primary px-4 py-2 text-primary-foreground" href={link}>
                                Passwort zurücksetzen
                            </Button>
                        </Container>
                        <Container className="mt-8 px-4">
                            <Text>
                                Sollten Sie nicht um ein neues Passwort gebeten haben, kann diese E-Mail ignoriert
                                werden.
                            </Text>
                        </Container>
                        <Container className="mb-8 flex flex-col gap-2 px-4 text-sm text-muted-foreground">
                            <Container>Sollte der Button nicht funktionieren, nutzen Sie folgenden Link:</Container>
                            <Container>
                                <Link className="text-primary" href={link}>
                                    {link}
                                </Link>
                            </Container>
                        </Container>
                        <Footer/>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}
