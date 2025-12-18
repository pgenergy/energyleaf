import { Container, Head, Html, Preview, Text } from "@react-email/components";
import MailButton from "../components/mail-button";
import { MailFooter } from "../components/mail-footer";
import { MailHeader } from "../components/mail-header";
import { MailMain } from "../components/mail-main";

interface Props {
	name: string;
	resetUrl: string;
	url: string;
}

export default function PasswordResetTemplate({ name, resetUrl, url }: Props) {
	return (
		<Html lang="de">
			<Preview>Energyleaf Passwort zurücksetzen.</Preview>
			<Head />
			<MailMain>
				<MailHeader baseUrl={url}>Passwort zurücksetzen</MailHeader>
				<Container
					style={{
						paddingInline: "8px",
					}}
				>
					<Text>
						Hallo {name}, <br />
						<br />
						Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts gestellt. Klicken Sie auf den folgenden
						Button, um Ihr Passwort zurückzusetzen:
					</Text>
				</Container>
				<MailButton href={resetUrl}>Passwort zurücksetzen</MailButton>
				<Container
					style={{
						paddingInline: "8px",
					}}
				>
					<Text>
						<strong>Hinweis:</strong> Dieser Link ist nur 5 Minuten gültig. Nach Ablauf müssen Sie eine neue
						Anfrage stellen.
					</Text>
				</Container>
				<Container
					style={{
						paddingInline: "8px",
					}}
				>
					<Text>
						Sollten Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren. Ihr Passwort
						bleibt unverändert.
					</Text>
				</Container>
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
