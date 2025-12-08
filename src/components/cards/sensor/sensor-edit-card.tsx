import { redirect } from "next/navigation";
import SensorCreationForm from "@/components/forms/sensor/create-sensor-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SensorTypeValue } from "@/lib/enums";
import { getCurrentSession } from "@/server/lib/auth";
import { getSensorByClientId } from "@/server/queries/sensor";

interface Props {
	clientId: string;
}

export default async function SensorEditCard(props: Props) {
	const { user } = await getCurrentSession();
	if (!user || !user.isAdmin) {
		redirect("/admin/sensors");
	}

	const sensor = await getSensorByClientId(props.clientId);
	if (!sensor) {
		redirect("/admin/sensors");
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>{sensor.clientId} bearbeiten</CardTitle>
				<CardDescription>Hier können Sie den Sensor bearbeiten.</CardDescription>
			</CardHeader>
			<CardContent>
				<SensorCreationForm
					initialValues={{
						clientId: sensor.clientId,
						sensorType: sensor.sensorType as SensorTypeValue,
						version: String(sensor.version) as "1" | "2",
						script: sensor.script ?? undefined,
					}}
					sensorId={sensor.clientId}
				/>
			</CardContent>
		</Card>
	);
}
