import { redirect } from "next/navigation";
import SimulationToggleCard from "@/components/cards/settings/simulation-toggle-card";
import BatteryForm from "@/components/forms/settings/battery-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SimulationType } from "@/lib/enums";
import { getCurrentSession } from "@/server/lib/auth";
import { getSimulationBatterySettings } from "@/server/queries/simulations";

export default async function BatterySimulationPage() {
	const { user } = await getCurrentSession();
	if (!user) redirect("/");

	const data = await getSimulationBatterySettings(user.id);

	return (
		<div className="flex flex-col gap-4">
			<SimulationToggleCard
				simulationType={SimulationType.Battery}
				enabled={data?.enabled ?? false}
				configured={data !== null}
			/>
			<Card>
				<CardHeader>
					<CardTitle>Batteriespeicher</CardTitle>
					<CardDescription>Konfigurieren Sie hier Ihren Batteriespeicher für die Simulation.</CardDescription>
				</CardHeader>
				<CardContent>
					<BatteryForm
						initialValues={{
							capacityKwh: data?.capacityKwh ?? 5,
							maxPowerKw: data?.maxPowerKw ?? 3,
						}}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
