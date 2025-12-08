import { redirect } from "next/navigation";
import Link from "next/link";
import { BatteryIcon, CarIcon, ClockIcon, SunIcon, ThermometerIcon } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SimulationType } from "@/lib/enums";
import { getCurrentSession } from "@/server/lib/auth";
import { getSimulationStatuses } from "@/server/queries/simulations";

function SimulationStatusBadge({ enabled, configured }: { enabled: boolean; configured: boolean }) {
	if (!configured) {
		return <span className="text-xs text-muted-foreground">Nicht konfiguriert</span>;
	}
	if (enabled) {
		return <span className="text-xs text-green-600 dark:text-green-500">Aktiviert</span>;
	}
	return <span className="text-xs text-muted-foreground">Deaktiviert</span>;
}

export default async function SimulationSettingsPage() {
	const { user } = await getCurrentSession();
	if (!user) redirect("/");

	const statuses = await getSimulationStatuses(user.id);

	const getStatus = (type: (typeof SimulationType)[keyof typeof SimulationType]) => {
		return statuses.find((s) => s.type === type) ?? { enabled: false, configured: false, valid: false };
	};

	const evStatus = getStatus(SimulationType.EV);
	const solarStatus = getStatus(SimulationType.Solar);
	const batteryStatus = getStatus(SimulationType.Battery);
	const heatPumpStatus = getStatus(SimulationType.HeatPump);
	const touStatus = getStatus(SimulationType.TOU);

	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
			<Link href="/settings/simulation/ev">
				<Card className="h-full transition-colors hover:bg-muted/50">
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="flex items-center gap-2">
								<CarIcon className="size-5" />
								E-Mobilität
							</CardTitle>
							<SimulationStatusBadge enabled={evStatus.enabled} configured={evStatus.configured} />
						</div>
						<CardDescription>Einstellungen für Ihr Elektroauto und Ladeverhalten</CardDescription>
					</CardHeader>
				</Card>
			</Link>
			<Link href="/settings/simulation/solar">
				<Card className="h-full transition-colors hover:bg-muted/50">
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="flex items-center gap-2">
								<SunIcon className="size-5" />
								Photovoltaik
							</CardTitle>
							<SimulationStatusBadge enabled={solarStatus.enabled} configured={solarStatus.configured} />
						</div>
						<CardDescription>Einstellungen für Ihre Solaranlage und Wechselrichter</CardDescription>
					</CardHeader>
				</Card>
			</Link>
			<Link href="/settings/simulation/battery">
				<Card className="h-full transition-colors hover:bg-muted/50">
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="flex items-center gap-2">
								<BatteryIcon className="size-5" />
								Batteriespeicher
							</CardTitle>
							<SimulationStatusBadge
								enabled={batteryStatus.enabled}
								configured={batteryStatus.configured}
							/>
						</div>
						<CardDescription>Einstellungen für Ihren Heimspeicher</CardDescription>
					</CardHeader>
				</Card>
			</Link>
			<Link href="/settings/simulation/heat-pump">
				<Card className="h-full transition-colors hover:bg-muted/50">
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="flex items-center gap-2">
								<ThermometerIcon className="size-5" />
								Wärmepumpe
							</CardTitle>
							<SimulationStatusBadge
								enabled={heatPumpStatus.enabled}
								configured={heatPumpStatus.configured}
							/>
						</div>
						<CardDescription>Einstellungen für Ihre Wärmepumpe und Speicher</CardDescription>
					</CardHeader>
				</Card>
			</Link>
			<Link href="/settings/simulation/tou-tariff">
				<Card className="h-full transition-colors hover:bg-muted/50">
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="flex items-center gap-2">
								<ClockIcon className="size-5" />
								Dynamischer Stromtarif
							</CardTitle>
							<SimulationStatusBadge enabled={touStatus.enabled} configured={touStatus.configured} />
						</div>
						<CardDescription>Einstellungen für zeitvariable Stromtarife (TOU)</CardDescription>
					</CardHeader>
				</Card>
			</Link>
		</div>
	);
}
