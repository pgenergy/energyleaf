import { redirect } from "next/navigation";
import SolarForm from "@/components/forms/settings/solar-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SolarOrientation } from "@/lib/enums";
import { getCurrentSession } from "@/server/lib/auth";
import { getSimulationSolarSettings } from "@/server/queries/simulations";

export const metadata = {
	title: "Photovoltaik - Energyleaf",
};

export default async function SolarSettingsPage() {
	const { user } = await getCurrentSession();
	if (!user) {
		redirect("/");
	}

	const data = await getSimulationSolarSettings(user.id);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Photovoltaik</CardTitle>
				<CardDescription>
					Hinterlegen Sie die Daten Ihrer Solaranlage, um die gemessene Einspeisung anzuzeigen.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<SolarForm
					initialValues={{
						peakPower: data?.peakPower ?? 10,
						orientation: data?.orientation ?? SolarOrientation.South,
						inverterPower: data?.inverterPower ?? 10,
						sunHoursPerDay: data?.sunHoursPerDay ?? undefined,
						location: data?.location ?? undefined,
					}}
				/>
			</CardContent>
		</Card>
	);
}
