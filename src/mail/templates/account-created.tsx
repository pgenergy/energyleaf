import { Container, Head, Html, Preview, Text } from "@react-email/components";
import { MailFooter } from "../components/mail-footer";
import { MailHeader } from "../components/mail-header";
import { MailMain } from "../components/mail-main";

interface Props {
	name: string;
	url: string;
}

export default function AccountCreatedTemplate({ name, url }: Props) {
	return (
		<Html lang="de">
			<Preview>Energyleaf Konto erstellt.</Preview>
			<Head />
			<MailMain>
				<MailHeader baseUrl={url}>Konto erstellt</MailHeader>
				<Container
					style={{
						paddingInline: "8px",
					}}
				>
					<Text>
						Hallo {name}, <br />
						<br />
						Ihr Konto wurde erfolgreich erstellt.
						<br />
						Sobald wir Ihren Sensor installiert haben, können Sie sich mit ihren Zugangsdaten einloggen.
					</Text>
				</Container>
				<Container className="text-muted-foreground px-4">
					<Text>Sollten Sie dieses Konto nicht erstellt haben, kontaktieren Sie uns bitte.</Text>
				</Container>
				<MailFooter baseUrl={url} />
			</MailMain>
		</Html>
	);
}
