"use client";

import { CheckIcon, CopyIcon, KeyIcon, Loader2Icon, RefreshCwIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { regenerateSensorTokenAction } from "@/server/actions/sensor";

interface Props {
	sensor: {
		clientId: string;
		version: number;
	};
	token: {
		code: string;
		timestamp: Date | null;
	} | null;
}

export default function SensorTokenCard({ sensor, token }: Props) {
	const router = useRouter();
	const [copied, setCopied] = useState(false);
	const [isRegenerating, setIsRegenerating] = useState(false);

	if (sensor.version !== 2) {
		return null;
	}

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
					<KeyIcon className="size-5" />
					<div className="flex min-w-0 flex-col">
						<CardTitle>API-Token</CardTitle>
						<CardDescription>Token für Sensor-Authentifizierung</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				{token ? (
					<>
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
					</>
				) : (
					<p className="text-muted-foreground text-sm">Kein Token vorhanden</p>
				)}
			</CardContent>
		</Card>
	);
}
