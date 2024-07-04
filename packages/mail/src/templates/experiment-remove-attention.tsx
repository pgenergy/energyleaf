import { Container, Head, Html, Preview, Text } from "@react-email/components";
import { Footer } from "../components/footer";
import { Header } from "../components/header";
import { Main } from "../components/main";

interface Props {
    name: string;
}

export default function ExperimentRemovedAttentionTemplate({ name }: Props) {
    return (
        <Html lang="de">
            <Preview>Teilnahme nicht möglich.</Preview>
            <Head />
            <Main>
                <Header>Teilnahme nicht möglich</Header>
                <Container className="px-4">
                    <Text>
                        Hallo {name}, <br />
                        <br />
                        wir danken Ihnen herzlich für Ihr Interesse an unserem Projekt und Ihre Bereitschaft zur
                        Teilnahme. Leider können wir Sie nicht in unser Projekt integrieren. Sie haben in der Umfrage
                        eine Aufmerksamkeitsprüfung übersehen. Daher können wir Ihre Daten nicht verwenden.
                    </Text>
                </Container>
                <Container className="px-4">
                    <Text>
                        Wir bedauern diesen Umstand. Falls Sie Nachfragen haben, stehen wir Ihnen selbstverständlich
                        gerne zur Verfügung. Nochmals vielen Dank für Ihr Interesse und Ihr Verständnis.
                    </Text>
                </Container>
                <Container className="px-4">
                    <Text>
                        Mit freundlichen Grüßen
                        <br />
                        Jessy und Vanessa von Energyleaf
                    </Text>
                </Container>
                <Footer />
            </Main>
        </Html>
    );
}
