import { redirect } from "next/navigation";
import SensorAssignForm from "@/components/forms/sensor/assign-sensor-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentSession } from "@/server/lib/auth";
import { getSensorByClientId } from "@/server/queries/sensor";
import { getAllUsers } from "@/server/queries/user";

interface Props {
	clientId: string;
}

export default async function SensorAssignCard(props: Props) {
	const { user } = await getCurrentSession();
	if (!user || !user.isAdmin) {
		redirect("/admin/sensors");
	}

	const sensor = await getSensorByClientId(props.clientId);
	if (!sensor) {
		redirect("/admin/sensors");
	}

	// Redirect if sensor is already assigned
	if (sensor.userId) {
		redirect("/admin/sensors");
	}

	const users = await getAllUsers();

	return (
		<Card>
			<CardHeader>
				<CardTitle>Nutzer zuweisen</CardTitle>
				<CardDescription>
					Weisen Sie dem Sensor <strong>{sensor.clientId}</strong> einen Nutzer zu.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<SensorAssignForm clientId={sensor.clientId} users={users} />
			</CardContent>
		</Card>
	);
}
