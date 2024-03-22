import { Body, Container, Head, Heading, Hr, Html, Preview, Tailwind, Text } from "@react-email/components";

import config from "@energyleaf/tailwindcss/mail-config";
import Footer from "../components/footer";
import Header from "../components/header";

interface Props {
    name: string;
}

export default function PasswordChangedTemplate({ name }: Props) {
    return (
        <Html lang="de">
            <Preview>Energyleaf Passwort geändert</Preview>
            <Head />
            <Tailwind
                config={{
                    ...config,
                }}
            >
                <Body className="bg-background font-sans text-foreground">
                    <Container className="mx-auto flex max-w-lg flex-col gap-4 px-8 py-4">
                        <Header heading="Passwort geändert"/>
                        <Container className="px-4">
                            <Text>
                                Hallo {name}, <br />
                                <br />
                                Sie haben Ihr Energyleaf Passwort geändert.
                            </Text>
                        </Container>
                        <Container className="px-4 text-muted-foreground">
                            <Text>
                                Sollten Sie nicht um ein neues Passwort gebeten haben, wenden Sie sich bitte
                                unverzüglich an uns.
                            </Text>
                        </Container>
                        <Footer/>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}
