import { Container, Head, Html, Preview, Text } from "@react-email/components";
import MailButton from "../components/mail-button";
import { MailFooter } from "../components/mail-footer";
import { MailHeader } from "../components/mail-header";
import { MailMain } from "../components/mail-main";

interface Props {
	name: string;
	url: string;
}

export default function AccountActivatedTemplate({ name, url }: Props) {
	return (
		<Html lang="de">
			<Preview>Energyleaf Konto aktiviert.</Preview>
			<Head />
			<MailMain>
				<MailHeader baseUrl={url}>Konto aktiviert</MailHeader>
				<Container
					style={{
						paddingInline: "8px",
					}}
				>
					<Text>
						Hallo {name}, <br />
						<br />
						wir freuen uns, Ihnen mitteilen zu können, dass Ihr Energyleaf-Konto erfolgreich freigeschaltet
						wurde. Sie können sich nun mit Ihren Zugangsdaten auf unserer Plattform anmelden und alle
						Funktionen und Dienste nutzen:
					</Text>
				</Container>
				<MailButton href={url}>Zur App</MailButton>
				<Container
					style={{
						paddingInline: "8px",
					}}
				>
					<Text>
						Mit freundlichen Grüßen
						<br />
						Energyleaf
					</Text>
				</Container>
				<MailFooter baseUrl={url} />
			</MailMain>
		</Html>
	);
}
