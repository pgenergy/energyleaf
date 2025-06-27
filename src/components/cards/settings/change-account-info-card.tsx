import AccountInfoForm from "@/components/forms/settings/account-info-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TimeZoneType } from "@/lib/enums";
import { getCurrentSession } from "@/server/lib/auth";
import { getUser } from "@/server/queries/user";

export default async function ChangeAccountInfoCard() {
	const { user } = await getCurrentSession();
	if (!user) {
		return null;
	}

	const data = await getUser(user.id);
	if (!data) {
		return null;
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Konto Informationen</CardTitle>
				<CardDescription>Weiter Daten zu Ihrem Konto</CardDescription>
			</CardHeader>
			<CardContent>
				<AccountInfoForm
					initialValues={{
						phone: data.phone || undefined,
						address: data.address,
						timezone: data.timezone || TimeZoneType.Europe_Berlin,
					}}
				/>
			</CardContent>
		</Card>
	);
}
