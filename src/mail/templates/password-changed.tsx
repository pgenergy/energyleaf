import { Container, Head, Html, Preview, Text } from "@react-email/components";
import MailButton from "../components/mail-button";
import { MailFooter } from "../components/mail-footer";
import { MailHeader } from "../components/mail-header";
import { MailMain } from "../components/mail-main";

interface Props {
	name: string;
	url: string;
}

export default function PasswordChangedTemplate({ name, url }: Props) {
	return (
		<Html lang="de">
			<Preview>Energyleaf Passwort geändert.</Preview>
			<Head />
			<MailMain>
				<MailHeader baseUrl={url}>Passwort geändert</MailHeader>
				<Container
					style={{
						paddingInline: "8px",
					}}
				>
					<Text>
						Hallo {name}, <br />
						<br />
						Ihr Passwort wurde erfolgreich geändert. Sie können sich ab sofort mit Ihrem neuen Passwort
						anmelden.
					</Text>
				</Container>
				<MailButton href={url}>Zur App</MailButton>
				<Container
					style={{
						paddingInline: "8px",
					}}
				>
					<Text>
						<strong>Wichtig:</strong> Sollten Sie diese Änderung nicht selbst vorgenommen haben,
						kontaktieren Sie uns bitte umgehend.
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
