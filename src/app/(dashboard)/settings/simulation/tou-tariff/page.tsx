import { redirect } from "next/navigation";
import SimulationToggleCard from "@/components/cards/settings/simulation-toggle-card";
import TouTariffForm from "@/components/forms/settings/tou-tariff-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SimulationType } from "@/lib/enums";
import { getCurrentSession } from "@/server/lib/auth";
import { getSimulationTouTariffSettings } from "@/server/queries/simulations";

export default async function TouTariffSimulationPage() {
	const { user } = await getCurrentSession();
	if (!user) redirect("/");

	const data = await getSimulationTouTariffSettings(user.id);

	return (
		<div className="flex flex-col gap-4">
			<SimulationToggleCard
				simulationType={SimulationType.TOU}
				enabled={data?.enabled ?? false}
				configured={data !== null}
			/>
			<Card>
				<CardHeader>
					<CardTitle>Dynamischer Stromtarif</CardTitle>
					<CardDescription>
						Konfigurieren Sie hier Ihren dynamischen Stromtarif (Time of Use).
					</CardDescription>
				</CardHeader>
				<CardContent>
					<TouTariffForm
						initialValues={{
							basePrice: data?.basePrice ?? 10,
							standardPrice: data?.standardPrice ?? 30,
							zones: data?.zones ?? [],
							weekdayZones: data?.weekdayZones ?? {},
						}}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
