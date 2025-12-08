import { getAllSensors } from "@/server/queries/sensor";
import SensorCard from "./sensor-card";

export async function SensorsOverview() {
	const sensors = await getAllSensors();

	if (!sensors || sensors.length === 0) {
		return (
			<div className="col-span-1 md:col-span-2">
				<p className="text-center font-mono font-semibold">Keine Sensoren vorhanden.</p>
			</div>
		);
	}

	return (
		<>
			{sensors.map((sensor) => (
				<SensorCard sensor={sensor} key={sensor.clientId} />
			))}
		</>
	);
}
