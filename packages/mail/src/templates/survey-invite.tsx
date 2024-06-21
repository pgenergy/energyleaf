import { Container, Head, Html, Link, Preview, Text } from "@react-email/components";
import { ButtonAltText, CustomButton, Footer, Header, Main } from "../components";

interface Props {
    name: string;
    surveyNumber: number;
    surveyLink: string;
}

export default function SurveyInviteTemplate(props: Props) {
    return (
        <Html lang="de">
            <Preview>Einladung zur Umfrage</Preview>
            <Head />
            <Main>
                <Header>Einladung zur Umfrage</Header>
                <Container className="px-4">
                    <Text>
                        Hallo {props.name}, <br />
                        <br />
                        hiermit möchten wir Sie zur Umfrage "Energyleaf Umfrage {props.surveyNumber}" einladen.
                        <br />
                        Im Rahmen unseres Projektes "Energyleaf" haben wir eine Plattform zur Kontrolle des eigenen
                        Energieverbrauchs entwickelt. Mit dieser Studie untersuchen wir, wie gut unsere Anwendung
                        private Haushalte beim Verständnis Ihres Energieverbrauchs unterstützt. Die Umfrage Nummer{" "}
                        {props.surveyNumber} dient zur Erfassung Ihres Energieverbrauchs-Verständnisses während der
                        Nutzung unserer Plattform. Es gibt keine richtigen oder falschen Antworten. Die Bearbeitungszeit
                        beträgt ca. 10 min.
                        {props.surveyNumber < 2 ? (
                            <>
                                <br />
                                Bitte beachten Sie, dass die Installation von Sensoren bei Ihnen zuhause zur Messung
                                Ihres Stromverbrauchs erst nach Abschluss dieser Umfrage möglich ist.
                            </>
                        ) : null}
                    </Text>
                </Container>
                <CustomButton href={props.surveyLink}>Zur Umfrage</CustomButton>
                <Container className="px-4">
                    <Text>
                        Bei Fragen antworten Sie auf diese E-Mail oder schreiben Sie uns pr Mail an{" "}
                        <Link href="mailto:energyleaf@uni-oldenburg.de">energyleaf@uni-oldenburg.de</Link>.
                    </Text>
                </Container>
                <Container className="px-4">
                    <Text>
                        Mit freundlichen Grüßen
                        <br />
                        Jessy und Vanessa von Energyleaf
                    </Text>
                </Container>
                <ButtonAltText href={props.surveyLink} />
                <Footer />
            </Main>
        </Html>
    );
}
