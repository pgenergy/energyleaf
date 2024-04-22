import config from "@energyleaf/tailwindcss/mail-config";
import { Body, Container, Head, Heading, Hr, Html, Preview, Tailwind, Text } from "@react-email/components";

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
                        <Container>
                            <Heading>Passwort geändert</Heading>
                            <Hr className="border border-border" />
                        </Container>
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
