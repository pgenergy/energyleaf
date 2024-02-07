import { Body, Container, Head, Heading, Hr, Html, Preview, Tailwind, Text } from "@react-email/components";

import config from "@energyleaf/tailwindcss/mail-config";

interface Props {
    name: string;
}

export default function PasswordChangedTemplate({ name }: Props) {
    return (
        <Html lang="de">
            <Head />
            <Preview>Energyleaf Passwort geändert</Preview>
            <Tailwind
                config={{
                    ...config,
                }}
            >
                <Body className="dark:bg-background-dark dark:text-foreground-dark bg-background font-sans text-foreground">
                    <Container className="mx-auto flex max-w-lg flex-col gap-4 px-8 py-4">
                        <Container>
                            <Heading>Passwort geändert</Heading>
                            <Hr className="dark:border-border-dark border border-border" />
                        </Container>
                        <Container className="mb-8 px-4">
                            <Text>
                                Hallo {name}, <br />
                                <br />
                                Sie haben Ihr Energyleaf Passwort geändert.
                            </Text>
                        </Container>
                        <Container className="mt-8 px-4">
                            <Text>
                                Sollest du nicht um ein neues Passwort gebeten haben, kann diese E-Mail ignoriert
                                werden.
                            </Text>
                        </Container>
                        <Hr className="dark:border-border-dark border border-border" />
                        <Container className="flex flex-row justify-center gap-4">
                            <Text className="font-bold">Energyleaf</Text>
                        </Container>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}
