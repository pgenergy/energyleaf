import { redirect } from "next/navigation";
import SimulationToggleCard from "@/components/cards/settings/simulation-toggle-card";
import HeatPumpForm from "@/components/forms/settings/heat-pump-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HeatPumpSource, SimulationType } from "@/lib/enums";
import { getCurrentSession } from "@/server/lib/auth";
import { getSimulationHeatPumpSettings } from "@/server/queries/simulations";

export default async function HeatPumpSimulationPage() {
	const { user } = await getCurrentSession();
	if (!user) redirect("/");

	const data = await getSimulationHeatPumpSettings(user.id);

	return (
		<div className="flex flex-col gap-4">
			<SimulationToggleCard
				simulationType={SimulationType.HeatPump}
				enabled={data?.enabled ?? false}
				configured={data !== null}
			/>
			<Card>
				<CardHeader>
					<CardTitle>Wärmepumpe</CardTitle>
					<CardDescription>Konfigurieren Sie hier Ihre Wärmepumpe für die Simulation.</CardDescription>
				</CardHeader>
				<CardContent>
					<HeatPumpForm
						initialValues={{
							source: data?.source ?? HeatPumpSource.Probe,
							powerKw: data?.powerKw ?? 10,
							bufferLiter: data?.bufferLiter ?? 0,
							defaultSchedule: data?.defaultSchedule ?? [
								{ start: "06:00", end: "22:00", targetTemperature: 21 },
							],
							weekdaySchedules: data?.weekdaySchedules ?? {},
						}}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
