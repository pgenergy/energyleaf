import PasswordChangeForm from "@/components/forms/auth/password-change-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentSession } from "@/server/lib/auth";

export default async function SecurityPage() {
	const { user } = await getCurrentSession();
	if (!user) {
		return null;
	}

	if (user.id === "demo") {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Passwort ändern</CardTitle>
				</CardHeader>
				<CardContent>
					<p>Als Demo-Benutzer können Sie Ihr Passwort nicht ändern.</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Passwort ändern</CardTitle>
				<CardDescription>Ändern Sie Ihr Passwort</CardDescription>
			</CardHeader>
			<CardContent>
				<PasswordChangeForm />
			</CardContent>
		</Card>
	);
}
