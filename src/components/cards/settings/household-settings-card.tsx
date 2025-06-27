import HouseholdForm from "@/components/forms/settings/household-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HouseType } from "@/lib/enums";
import { getCurrentSession } from "@/server/lib/auth";
import { getUserData } from "@/server/queries/user";

export default async function HouseholdSettingsCard() {
	const { user } = await getCurrentSession();

	if (!user) {
		return null;
	}

	const data = await getUserData(user.id);
	if (!data) {
		return null;
	}
	return (
		<Card>
			<CardHeader>
				<CardTitle>Haushalt</CardTitle>
				<CardDescription>Daten über Ihren Haushalt</CardDescription>
			</CardHeader>
			<CardContent>
				<HouseholdForm
					initialValues={{
						livingSpace: data.livingSpace || 1,
						houseType: data.property || HouseType.Apartement,
						people: data.household || 1,
					}}
				/>
			</CardContent>
		</Card>
	);
}
