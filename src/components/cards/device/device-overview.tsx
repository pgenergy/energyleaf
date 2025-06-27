import { getCurrentSession } from "@/server/lib/auth";
import { getDevicesByUser } from "@/server/queries/devices";
import DeviceCard from "./device-card";

export async function DeviceOverview() {
	const { user } = await getCurrentSession();
	if (!user) {
		return null;
	}

	const devices = await getDevicesByUser(user.id);
	if (!devices || devices.length === 0) {
		return (
			<div className="col-span-1 md:col-span-3">
				<p className="text-center font-mono font-semibold">Bisher wurden keine Geräte angelegt.</p>
			</div>
		);
	}

	return (
		<>
			{devices.map((device) => (
				<DeviceCard key={device.id} device={device} />
			))}
		</>
	);
}
