import { fromZonedTime } from "date-fns-tz";
import { type DeviceCategory, TimeZoneType, TimezoneTypeToTimeZone } from "@/lib/enums";
import { getCurrentSession } from "@/server/lib/auth";
import { getDevicesByPeaks, getPeaksBySensor } from "@/server/queries/peaks";
import { getEnergySensorIdForUser } from "@/server/queries/sensor";
import PeakCard from "./peaks-card";

interface Props {
	start: Date;
	end: Date;
}

export async function PeaksOverview(props: Props) {
	const { user } = await getCurrentSession();
	if (!user) {
		return null;
	}

	const tz = TimezoneTypeToTimeZone[user.timezone || TimeZoneType.Europe_Berlin];

	const sensorId = await getEnergySensorIdForUser(user.id);
	if (!sensorId) {
		return (
			<div className="col-span-1 md:col-span-3">
				<p className="text-center font-mono font-semibold">Derzeit ist kein Sensor bei Ihnen aktiviert.</p>
			</div>
		);
	}

	const peaks = await getPeaksBySensor(sensorId, {
		start: props.start.toISOString(),
		end: props.end.toISOString(),
	});
	if (!peaks || peaks.length === 0) {
		return (
			<div className="col-span-1 md:col-span-3">
				<p className="text-center font-mono font-semibold">Bisher gibt es keine Ausschläge.</p>
			</div>
		);
	}

	const peakIds = peaks.map((peak) => peak.id);
	const devicesByPeak = await getDevicesByPeaks(peakIds);
	const devicesByPeakId = new Map<string, { id: string; name: string; category: DeviceCategory }[]>();

	for (const device of devicesByPeak) {
		const existing = devicesByPeakId.get(device.peakId) ?? [];
		existing.push({
			id: device.id,
			name: device.name,
			category: device.category,
		});
		devicesByPeakId.set(device.peakId, existing);
	}

	const preparedPeaks = peaks.map((peak) => ({
		...peak,
		start: fromZonedTime(peak.start, tz),
		end: fromZonedTime(peak.end, tz),
		energyData: peak.energyData.map((d) => ({
			...d,
			timestamp: fromZonedTime(d.timestamp, tz),
		})),
		devices: devicesByPeakId.get(peak.id) ?? [],
	}));

	return (
		<>
			{preparedPeaks.map((peak) => (
				<PeakCard peak={peak} devices={peak.devices} key={peak.id} />
			))}
		</>
	);
}
