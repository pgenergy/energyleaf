import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { CloudSunIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";
import SolarForecastChart from "@/components/charts/energy/solar-forecast-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { env } from "@/env";
import { getCurrentSession } from "@/server/lib/auth";
import { getSimulationSolarSettings, isSolarSimulationValid } from "@/server/queries/simulations";
import { getNextDaySolarForecast } from "@/server/queries/weather";

interface Props {
	className?: string;
}

export function SolarForecastCardSkeleton({ className }: Props) {
	return (
		<Card className={className}>
			<CardHeader>
				<Skeleton className="h-5 w-48" />
				<Skeleton className="h-4 w-64 max-w-full" />
			</CardHeader>
			<CardContent className="space-y-5">
				<Skeleton className="h-16 w-56" />
				<Skeleton className="h-56 w-full" />
			</CardContent>
		</Card>
	);
}

export default async function SolarForecastCard({ className }: Props) {
	if (!env.WEATHERAPI_KEY) {
		return null;
	}

	const { user } = await getCurrentSession();
	if (!user) {
		return null;
	}

	const settings = await getSimulationSolarSettings(user.id);
	if (!isSolarSimulationValid(settings) || !settings?.location) {
		return null;
	}

	const forecast = await getNextDaySolarForecast({
		location: settings.location,
		peakPower: settings.peakPower,
		orientation: settings.orientation,
		inverterPower: settings.inverterPower,
		sunHoursPerDay: settings.sunHoursPerDay,
	});
	if (!forecast) {
		return null;
	}

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<CloudSunIcon className="size-4 text-chart-4" />
					Solarprognose für morgen
				</CardTitle>
				<CardDescription>
					{format(parseISO(forecast.date), "EEEE, PPP", { locale: de })} · {forecast.location}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-5">
				<div className="flex flex-wrap items-end justify-between gap-4">
					<div>
						<p className="font-mono font-semibold text-3xl tabular-nums">
							{forecast.totalProduction.toFixed(2)} kWh
						</p>
						<p className="text-muted-foreground text-sm">geschätzte Solarerzeugung</p>
					</div>
					<div className="text-right text-sm">
						<p className="font-medium">{forecast.condition}</p>
						<p className="text-muted-foreground">Ø {forecast.averageCloudCover} % Bewölkung</p>
					</div>
				</div>
				<SolarForecastChart data={forecast.hours} />
				<div className="flex flex-wrap items-center justify-between gap-2 text-muted-foreground text-xs">
					<p className="flex items-center gap-1">
						<SparklesIcon className="size-3" />
						{forecast.usesSolarIrradiance
							? "Berechnet aus prognostizierter Solarstrahlung und Ihren Anlagendaten."
							: "Geschätzt aus Bewölkung, Jahreszeit und Ihren Anlagendaten."}
					</p>
					<Link
						href="https://www.weatherapi.com/"
						target="_blank"
						rel="noreferrer"
						className="underline underline-offset-2"
					>
						Wetterdaten: WeatherAPI.com
					</Link>
				</div>
			</CardContent>
		</Card>
	);
}
