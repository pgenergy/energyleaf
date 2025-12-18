import { CodeIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
	sensor: {
		needsScript: boolean;
		script: string | null;
	};
}

export default function SensorScriptCard({ sensor }: Props) {
	if (!sensor.needsScript || !sensor.script) {
		return null;
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex flex-row items-center gap-3">
					<CodeIcon className="size-5" />
					<div className="flex min-w-0 flex-col">
						<CardTitle>Script</CardTitle>
						<CardDescription>Sensor-Verarbeitungsscript</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<pre className="bg-muted max-h-40 overflow-auto rounded-md p-3 font-mono text-xs">{sensor.script}</pre>
			</CardContent>
		</Card>
	);
}
