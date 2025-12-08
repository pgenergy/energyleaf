import { redirect } from "next/navigation";
import SimulationToggleCard from "@/components/cards/settings/simulation-toggle-card";
import EvForm from "@/components/forms/settings/ev-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChargingSpeed, SimulationType } from "@/lib/enums";
import { getCurrentSession } from "@/server/lib/auth";
import { getSimulationEvSettings } from "@/server/queries/simulations";

export default async function EvSimulationPage() {
	const { user } = await getCurrentSession();
	if (!user) redirect("/");

	const data = await getSimulationEvSettings(user.id);

	return (
		<div className="flex flex-col gap-4">
			<SimulationToggleCard
				simulationType={SimulationType.EV}
				enabled={data?.enabled ?? false}
				configured={data !== null}
			/>
			<Card>
				<CardHeader>
					<CardTitle>E-Mobilität</CardTitle>
					<CardDescription>Konfigurieren Sie hier Ihr Elektroauto für die Simulation.</CardDescription>
				</CardHeader>
				<CardContent>
					<EvForm
						initialValues={{
							chargingSpeed: data?.chargingSpeed ?? ChargingSpeed.Eleven,
							evCapacityKwh: data?.evCapacityKwh ?? 40,
							dailyDrivingDistanceKm: data?.dailyDrivingDistanceKm ?? undefined,
							avgConsumptionPer100Km: data?.avgConsumptionPer100Km ?? undefined,
							defaultSchedule: data?.defaultSchedule ?? [{ start: "22:00", end: "06:00" }],
							weekdaySchedules: data?.weekdaySchedules ?? {},
						}}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
