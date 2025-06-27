import AddDeviceToPeakForm from "@/components/forms/peaks/add-device-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentSession } from "@/server/lib/auth";
import { getDevicesByUser } from "@/server/queries/devices";
import { getDevicesByPeak, getPeakById } from "@/server/queries/peaks";
import { getEnergySensorIdForUser } from "@/server/queries/sensor";
import { format, isSameDay } from "date-fns";
import { de } from "date-fns/locale";
import Link from "next/link";
import { redirect } from "next/navigation";

interface Props {
	id: string;
}

export default async function PeaksEditCard(props: Props) {
	const { user } = await getCurrentSession();
	if (!user) {
		return null;
	}

	const sensorId = await getEnergySensorIdForUser(user.id);
	if (!sensorId) {
		redirect("/peaks");
	}
	const peak = await getPeakById(props.id);
	if (!peak || peak.sensorId !== sensorId) {
		redirect("/peaks");
	}

	const devices = await getDevicesByUser(user.id);
	if (!devices || devices.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>
						Ausschlag: {format(peak.start, "HH:mm")} - {format(peak.end, "HH:mm")}
					</CardTitle>
					<CardDescription>
						{isSameDay(peak.end, peak.start)
							? format(peak.start, "PPP", { locale: de })
							: `${format(peak.start, "dd.MM PPP", { locale: de })} - ${format(peak.end, "dd.MM PPP", { locale: de })}`}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-center font-mono font-semibold">
						Sie müssen zu erst{" "}
						<Link href="/devices/create" className="underline hover:no-underline">
							Geräte erstellen.
						</Link>
					</p>
				</CardContent>
			</Card>
		);
	}

	const initialDevices = await getDevicesByPeak(peak.id);

	return (
		<Card>
			<CardHeader>
				<CardTitle>
					Ausschlag: {format(peak.start, "HH:mm")} - {format(peak.end, "HH:mm")}
				</CardTitle>
				<CardDescription>
					{isSameDay(peak.end, peak.start)
						? format(peak.start, "PPP", { locale: de })
						: `${format(peak.start, "dd.MM PPP", { locale: de })} - ${format(peak.end, "dd.MM PPP", { locale: de })}`}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<AddDeviceToPeakForm devices={devices} peakId={peak.id} initalDevices={initialDevices} />
			</CardContent>
		</Card>
	);
}
