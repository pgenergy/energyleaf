import { TimeZoneType, TimezoneTypeToTimeZone } from "@/lib/enums";
import { getCurrentSession } from "@/server/lib/auth";
import { getDevicesByPeak, getPeaksBySensor } from "@/server/queries/peaks";
import { getEnergySensorIdForUser } from "@/server/queries/sensor";
import { fromZonedTime } from "date-fns-tz";
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

	const preparedPeaks = [];
	for (let i = 0; i < peaks.length; i++) {
		const peak = peaks[i];
		const devices = await getDevicesByPeak(peak.id);
		preparedPeaks.push({
			...peak,
			start: fromZonedTime(peak.start, tz),
			end: fromZonedTime(peak.end, tz),
			eneryData: peak.energyData.map((d) => ({
				...d,
				timestamp: fromZonedTime(d.timestamp, tz),
			})),
			devices: devices,
		});
	}

	return (
		<>
			{preparedPeaks.map((peak) => (
				<PeakCard peak={peak} devices={peak.devices} key={peak.id} />
			))}
		</>
	);
}
