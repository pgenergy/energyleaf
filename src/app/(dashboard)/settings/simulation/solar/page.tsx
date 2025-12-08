import { redirect } from "next/navigation";
import SimulationToggleCard from "@/components/cards/settings/simulation-toggle-card";
import SolarForm from "@/components/forms/settings/solar-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SimulationType, SolarOrientation } from "@/lib/enums";
import { getCurrentSession } from "@/server/lib/auth";
import { getSimulationSolarSettings } from "@/server/queries/simulations";

export default async function SolarSimulationPage() {
	const { user } = await getCurrentSession();
	if (!user) redirect("/");

	const data = await getSimulationSolarSettings(user.id);

	return (
		<div className="flex flex-col gap-4">
			<SimulationToggleCard
				simulationType={SimulationType.Solar}
				enabled={data?.enabled ?? false}
				configured={data !== null}
			/>
			<Card>
				<CardHeader>
					<CardTitle>Photovoltaik</CardTitle>
					<CardDescription>Konfigurieren Sie hier Ihre Solaranlage für die Simulation.</CardDescription>
				</CardHeader>
				<CardContent>
					<SolarForm
						initialValues={{
							peakPower: data?.peakPower ?? 10,
							orientation: data?.orientation ?? SolarOrientation.South,
							inverterPower: data?.inverterPower ?? 10,
							sunHoursPerDay: data?.sunHoursPerDay ?? undefined,
						}}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
