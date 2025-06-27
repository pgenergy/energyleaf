import AccountNameForm from "@/components/forms/settings/account-name-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentSession } from "@/server/lib/auth";
import { getUser } from "@/server/queries/user";

export default async function ChangeNameCard() {
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
				<CardTitle>Namen</CardTitle>
				<CardDescription>Ändern Sie wie Sie angesprochen werden</CardDescription>
			</CardHeader>
			<CardContent>
				<AccountNameForm
					initialValues={{
						firstname: data.firstname,
						lastname: data.lastname,
					}}
				/>
			</CardContent>
		</Card>
	);
}
