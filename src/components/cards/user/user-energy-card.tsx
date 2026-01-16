import { ZapIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	ElectricityMeterDisplay,
	type ElectricityMeterValue,
	TariffTypeDisplay,
	type TariffTypeValue,
} from "@/lib/enums";
import { getUserDataByUserId } from "@/server/queries/user";

interface Props {
	userId: string;
}

export default async function UserEnergyCard({ userId }: Props) {
	const userData = await getUserDataByUserId(userId);

	if (!userData) {
		return (
			<Card>
				<CardHeader>
					<div className="flex flex-row items-center gap-3">
						<ZapIcon className="size-5" />
						<div className="flex min-w-0 flex-col">
							<CardTitle>Energieeinstellungen</CardTitle>
							<CardDescription>Tarif und Verbrauchslimits</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground text-sm">Keine Daten vorhanden</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex flex-row items-center gap-3">
					<ZapIcon className="size-5" />
					<div className="flex min-w-0 flex-col">
						<CardTitle>Energieeinstellungen</CardTitle>
						<CardDescription>Tarif und Verbrauchslimits</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
					<div>
						<span className="text-muted-foreground">Tarif:</span>
						<p>
							{userData.tariff
								? (TariffTypeDisplay[userData.tariff as TariffTypeValue] ?? userData.tariff)
								: "-"}
						</p>
					</div>
					<div>
						<span className="text-muted-foreground">Grundpreis:</span>
						<p>{userData.basePrice != null ? `${userData.basePrice.toFixed(2)} €/Monat` : "-"}</p>
					</div>
					<div>
						<span className="text-muted-foreground">Arbeitspreis:</span>
						<p>{userData.workingPrice != null ? `${userData.workingPrice.toFixed(2)} ct/kWh` : "-"}</p>
					</div>
					<div>
						<span className="text-muted-foreground">Abschlagszahlung:</span>
						<p>{userData.monthlyPayment != null ? `${userData.monthlyPayment.toFixed(2)} €` : "-"}</p>
					</div>
					<div>
						<span className="text-muted-foreground">Verbrauchslimit:</span>
						<p>
							{userData.consumptionGoal != null ? `${userData.consumptionGoal.toFixed(2)} kWh/Tag` : "-"}
						</p>
					</div>
					<div>
						<span className="text-muted-foreground">Zählernummer:</span>
						<p className="truncate font-mono">{userData.electricityMeterNumber ?? "-"}</p>
					</div>
					<div>
						<span className="text-muted-foreground">Zählertyp:</span>
						<p>
							{userData.electricityMeterType
								? (ElectricityMeterDisplay[userData.electricityMeterType as ElectricityMeterValue] ??
									userData.electricityMeterType)
								: "-"}
						</p>
					</div>
				</div>
				<div className="flex flex-row flex-wrap items-center gap-2">
					<Badge variant={userData.powerAtElectricityMeter ? "default" : "secondary"}>
						{userData.powerAtElectricityMeter ? "Strom am Zähler" : "Kein Strom am Zähler"}
					</Badge>
					<Badge variant={userData.wifiAtElectricityMeter ? "default" : "secondary"}>
						{userData.wifiAtElectricityMeter ? "WLAN am Zähler" : "Kein WLAN am Zähler"}
					</Badge>
				</div>
			</CardContent>
		</Card>
	);
}
