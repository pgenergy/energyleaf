"use client";

import {
	CheckIcon,
	CopyIcon,
	CpuIcon,
	DropletIcon,
	FlameIcon,
	Loader2Icon,
	RefreshCwIcon,
	ZapIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SensorTypeDisplay, type SensorTypeValue } from "@/lib/enums";
import { regenerateSensorTokenAction } from "@/server/actions/sensor";

interface Props {
	sensor: {
		id: string;
		clientId: string;
		version: number;
		sensorType: string;
		userId: string | null;
		needsScript: boolean;
		script: string | null;
	};
	user: {
		id: string;
		username: string | null;
		email: string;
	} | null;
	token: {
		code: string;
		timestamp: Date | null;
	} | null;
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

export default function SensorOverviewCard({ sensor, user, token }: Props) {
	const router = useRouter();
	const [copied, setCopied] = useState(false);
	const [isRegenerating, setIsRegenerating] = useState(false);

	const copyToken = async () => {
		if (!token) return;

		try {
			await navigator.clipboard.writeText(token.code);
			setCopied(true);
			toast.success("Token kopiert");
			setTimeout(() => setCopied(false), 2000);
		} catch {
			toast.error("Kopieren fehlgeschlagen");
		}
	};

	const handleRegenerateToken = async () => {
		setIsRegenerating(true);
		const toastId = toast.loading("Token wird neu generiert...", { duration: Infinity });

		const res = await regenerateSensorTokenAction(sensor.clientId);

		if (res.success) {
			toast.success(res.message, { id: toastId, duration: 4000 });
			router.refresh();
		} else {
			toast.error(res.message, { id: toastId, duration: 4000 });
		}

		setIsRegenerating(false);
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex flex-row items-center gap-3">
					<SensorTypeIcon type={sensor.sensorType} />
					<div className="flex min-w-0 flex-col">
						<CardTitle className="truncate">{sensor.clientId}</CardTitle>
						<CardDescription>Sensorübersicht</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent className="flex flex-col gap-6">
				{/* Basic Info */}
				<div className="flex flex-col gap-3">
					<h3 className="text-sm font-medium">Allgemeine Informationen</h3>
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
				</div>

				{/* Badges */}
				<div className="flex flex-row flex-wrap items-center gap-2">
					<Badge variant={user ? "default" : "secondary"}>{user ? "Zugewiesen" : "Nicht zugewiesen"}</Badge>
					{sensor.needsScript && <Badge variant="outline">Script erforderlich</Badge>}
				</div>

				{/* User Info */}
				<div className="flex flex-col gap-3">
					<h3 className="text-sm font-medium">Zugewiesener Nutzer</h3>
					{user ? (
						<div className="text-sm">
							<p>
								<span className="text-muted-foreground">Benutzername:</span> {user.username || "-"}
							</p>
							<p>
								<span className="text-muted-foreground">E-Mail:</span> {user.email}
							</p>
						</div>
					) : (
						<p className="text-muted-foreground text-sm">Kein Nutzer zugewiesen</p>
					)}
				</div>

				{/* Token Section (only for v2 sensors) */}
				{sensor.version === 2 && (
					<div className="flex flex-col gap-3">
						<h3 className="text-sm font-medium">API-Token</h3>
						{token ? (
							<div className="flex flex-col gap-2">
								<div className="flex flex-row items-center gap-2">
									<Input readOnly value={token.code} className="font-mono text-sm" />
									<Button
										variant="outline"
										size="icon"
										onClick={copyToken}
										className="shrink-0 cursor-pointer"
									>
										{copied ? (
											<CheckIcon className="size-4 text-green-500" />
										) : (
											<CopyIcon className="size-4" />
										)}
									</Button>
								</div>
								{token.timestamp && (
									<p className="text-muted-foreground text-xs">
										Erstellt am: {token.timestamp.toLocaleString("de-DE")}
									</p>
								)}
								<Button
									variant="secondary"
									onClick={handleRegenerateToken}
									disabled={isRegenerating}
									className="w-fit cursor-pointer"
								>
									{isRegenerating ? (
										<Loader2Icon className="mr-2 size-4 animate-spin" />
									) : (
										<RefreshCwIcon className="mr-2 size-4" />
									)}
									Token neu generieren
								</Button>
							</div>
						) : (
							<p className="text-muted-foreground text-sm">Kein Token vorhanden</p>
						)}
					</div>
				)}

				{/* Script Section */}
				{sensor.needsScript && sensor.script && (
					<div className="flex flex-col gap-3">
						<h3 className="text-sm font-medium">Script</h3>
						<pre className="bg-muted max-h-40 overflow-auto rounded-md p-3 font-mono text-xs">
							{sensor.script}
						</pre>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
