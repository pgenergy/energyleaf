import EnergyTariffForm from "@/components/forms/settings/energy-tariff-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TariffType } from "@/lib/enums";
import { getCurrentSession } from "@/server/lib/auth";
import { getUserData } from "@/server/queries/user";

export default async function EnergyTariffCard() {
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
				<CardTitle>Stromtarif</CardTitle>
				<CardDescription>Daten über Ihren Stromtarif</CardDescription>
			</CardHeader>
			<CardContent>
				<EnergyTariffForm
					initialValues={{
						tariffType: data.tariff || TariffType.Basic,
						basePrice: data.basePrice || 0.01,
						workingPrice: data.workingPrice || 0.01,
						monthlyPayment: data.monthlyPayment || 0.01,
					}}
				/>
			</CardContent>
		</Card>
	);
}
