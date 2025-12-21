import { endOfDay, startOfDay } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import DetailEnergyChart from "@/components/charts/energy/detail-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import { TimeZoneType, TimezoneTypeToTimeZone } from "@/lib/enums";
import type { SimulationFilters } from "@/server/lib/simulation/run";
import { runSimulationsWithWarmup } from "@/server/lib/simulation/run";
import { getEnergyForSensorInRange } from "@/server/queries/energy";
import { getEnergySensorIdForUser } from "@/server/queries/sensor";
import { getEnabledSimulations } from "@/server/queries/simulations";

interface Props {
	userId: string;
	timezone: TimeZoneType | null;
	start: Date;
	filters: SimulationFilters;
}

export default async function SimulationDetailChartCard(props: Props) {
	const tz = TimezoneTypeToTimeZone[props.timezone || TimeZoneType.Europe_Berlin];
	const start = startOfDay(props.start);
	const end = endOfDay(props.start);

	const energySensorId = await getEnergySensorIdForUser(props.userId);
	if (!energySensorId) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Energieverbrauch mit Simulation</CardTitle>
					<CardDescription>
						Vergleichen Sie Ihren tatsächlichen Energieverbrauch mit simulierten Szenarien.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-center font-mono font-semibold">Derzeit ist kein Sensor bei Ihnen aktiviert.</p>
				</CardContent>
			</Card>
		);
	}

	const data = await getEnergyForSensorInRange(start.toISOString(), end.toISOString(), energySensorId);
	if (data.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Energieverbrauch mit Simulation</CardTitle>
					<CardDescription>
						Vergleichen Sie Ihren tatsächlichen Energieverbrauch mit simulierten Szenarien.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-center font-mono font-semibold">
						Für diesen Tag stehen keine Daten zur Verfügung.
					</p>
				</CardContent>
			</Card>
		);
	}

	const enabledSimulations = await getEnabledSimulations(props.userId);
	const hasActiveFilters = !!(
		(enabledSimulations.ev && props.filters.ev) ||
		(enabledSimulations.solar && props.filters.solar) ||
		(enabledSimulations.heatpump && props.filters.heatpump) ||
		(enabledSimulations.battery && props.filters.battery)
	);

	let simData: typeof data | undefined;
	if (hasActiveFilters) {
		simData = await runSimulationsWithWarmup(
			data,
			props.userId,
			{
				aggregation: "raw",
				sensorId: energySensorId,
				startDate: start,
			},
			props.filters,
		);
	}

	const chartConfig = {
		total: {
			label: "Energieübersicht (kWh)",
			color: "var(--primary)",
		},
	} satisfies ChartConfig;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Energieverbrauch mit Simulation</CardTitle>
				<CardDescription>
					Vergleichen Sie Ihren tatsächlichen Energieverbrauch mit simulierten Szenarien.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<DetailEnergyChart
					data={data.map((d) => ({
						...d,
						timestamp: fromZonedTime(d.timestamp, tz),
					}))}
					simData={simData?.map((d) => ({
						...d,
						timestamp: fromZonedTime(d.timestamp, tz),
					}))}
					config={chartConfig}
					display={["total"]}
					dataKey="total"
					dateFormat="hour"
				/>
			</CardContent>
		</Card>
	);
}
