import { CpuIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SensorTypeDisplay, type SensorTypeValue } from "@/lib/enums";
import { getSensorForUser } from "@/server/queries/user";

interface Props {
	userId: string;
}

export default async function UserSensorCard({ userId }: Props) {
	const sensors = await getSensorForUser(userId);

	return (
		<Card>
			<CardHeader>
				<div className="flex flex-row items-center gap-3">
					<CpuIcon className="size-5" />
					<div className="flex min-w-0 flex-col">
						<CardTitle>Sensoren</CardTitle>
						<CardDescription>Verknüpfte Sensoren</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{sensors.length === 0 ? (
					<p className="text-muted-foreground text-sm">Keine Daten vorhanden</p>
				) : (
					<div className="flex flex-col gap-3">
						{sensors.map((sensor) => (
							<div key={sensor.id} className="flex flex-row items-center justify-between gap-2">
								<div className="flex min-w-0 flex-col gap-1">
									<Link
										href={`/admin/sensors/${encodeURIComponent(sensor.clientId)}`}
										className="truncate font-mono text-sm hover:underline"
									>
										{sensor.clientId}
									</Link>
									<p className="text-muted-foreground truncate text-xs">{sensor.id}</p>
								</div>
								<div className="flex shrink-0 flex-row items-center gap-2">
									<Badge variant="outline">
										{SensorTypeDisplay[sensor.sensorType as SensorTypeValue] ?? sensor.sensorType}
									</Badge>
									<Badge variant="secondary">v{sensor.version}</Badge>
								</div>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
