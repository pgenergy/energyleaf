import { Body, Container, Head, Heading, Hr, Html, Preview, Tailwind, Text } from "@react-email/components";

import config from "@energyleaf/tailwindcss/mail-config";

interface Props {
    name: string;
}

export default function AccoutCreatedTemplate({ name }: Props) {
    return (
        <Html lang="de">
            <Preview>Energyleaf Konto erstellt.</Preview>
            <Head />
            <Tailwind
                config={{
                    ...config,
                }}
            >
                <Body className="bg-background font-sans text-foreground">
                    <Container className="mx-auto flex max-w-lg flex-col gap-4 px-8 py-4">
                        <Container>
                            <Heading>Konto erstellt</Heading>
                            <Hr className="border border-border" />
                        </Container>
                        <Container className="px-4">
                            <Text>
                                Hallo {name}, <br />
                                <br />
                                Ihr Konto wurde erfolgreich erstellt.
                                <br />
                                Sobald wir Ihren Sensor installiert haben, können Sie sich mit ihren Zugangsdaten
                                einloggen.
                            </Text>
                        </Container>
                        <Container className="px-4 text-muted-foreground">
                            <Text>Sollten Sie dieses Konto nicht erstellt haben, kontaktieren Sie uns bitte.</Text>
                        </Container>
                        <Hr className="border border-border" />
                        <Container className="flex flex-row justify-center gap-4">
                            <Text className="font-bold">Energyleaf</Text>
                        </Container>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}
