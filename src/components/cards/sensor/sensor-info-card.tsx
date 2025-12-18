import { CpuIcon, DropletIcon, FlameIcon, ZapIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SensorTypeDisplay, type SensorTypeValue } from "@/lib/enums";

interface Props {
	sensor: {
		id: string;
		clientId: string;
		version: number;
		sensorType: string;
		userId: string | null;
		needsScript: boolean;
	};
}

function SensorTypeIcon({ type }: { type: string }) {
	switch (type) {
		case "electricity":
			return <ZapIcon className="size-5" />;
		case "water":
			return <DropletIcon className="size-5" />;
		case "gas":
			return <FlameIcon className="size-5" />;
		default:
			return <CpuIcon className="size-5" />;
	}
}

export default function SensorInfoCard({ sensor }: Props) {
	return (
		<Card>
			<CardHeader>
				<div className="flex flex-row items-center gap-3">
					<SensorTypeIcon type={sensor.sensorType} />
					<div className="flex min-w-0 flex-col">
						<CardTitle className="truncate">Sensor Information</CardTitle>
						<CardDescription>Allgemeine Informationen zum Sensor</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<div className="grid grid-cols-2 gap-4 text-sm">
					<div>
						<span className="text-muted-foreground">Sensor-ID:</span>
						<p className="truncate font-mono">{sensor.id}</p>
					</div>
					<div>
						<span className="text-muted-foreground">Client-ID:</span>
						<p className="truncate font-mono">{sensor.clientId}</p>
					</div>
					<div>
						<span className="text-muted-foreground">Typ:</span>
						<p>{SensorTypeDisplay[sensor.sensorType as SensorTypeValue]}</p>
					</div>
					<div>
						<span className="text-muted-foreground">Version:</span>
						<p>Version {sensor.version}</p>
					</div>
				</div>
				<div className="flex flex-row flex-wrap items-center gap-2">
					<Badge variant={sensor.userId ? "default" : "secondary"}>
						{sensor.userId ? "Zugewiesen" : "Nicht zugewiesen"}
					</Badge>
					{sensor.needsScript && <Badge variant="outline">Script erforderlich</Badge>}
				</div>
			</CardContent>
		</Card>
	);
}
