import { Container, Head, Html, Preview, Text } from "@react-email/components";
import { Footer, Header, Main } from "../components";

interface Props {
    name: string;
}

export default function PasswordChangedTemplate({ name }: Props) {
    return (
        <Html lang="de">
            <Preview>Energyleaf Passwort geändert</Preview>
            <Head />
            <Main>
                <Header>Passwort geändert</Header>
                <Container className="px-4">
                    <Text>
                        Hallo {name}, <br />
                        <br />
                        Sie haben Ihr Energyleaf Passwort geändert.
                    </Text>
                </Container>
                <Container className="px-4 text-muted-foreground">
                    <Text>
                        Sollten Sie nicht um ein neues Passwort gebeten haben, wenden Sie sich bitte unverzüglich an
                        uns.
                    </Text>
                </Container>
                <Footer />
            </Main>
        </Html>
    );
}
