import DeviceCreationForm from "@/components/forms/device/create-device-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentSession } from "@/server/lib/auth";
import { getDeviceById } from "@/server/queries/devices";
import { redirect } from "next/navigation";

interface Props {
	id: string;
}

export default async function DeviceEditCard(props: Props) {
	const { user } = await getCurrentSession();
	if (!user) {
		return null;
	}

	const device = await getDeviceById(user.id, props.id);
	if (!device || device.userId !== user.id) {
		redirect("/devices");
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>{device.name} bearbeiten</CardTitle>
				<CardDescription>Hier können Sie das Gerät bearbeiten.</CardDescription>
			</CardHeader>
			<CardContent>
				<DeviceCreationForm
					initialValues={{
						name: device.name,
						power: device.power ?? undefined,
						category: device.category,
					}}
					deviceId={device.id}
				/>
			</CardContent>
		</Card>
	);
}
