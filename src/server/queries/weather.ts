import "server-only";

import { cache } from "react";
import { z } from "zod";
import { env } from "@/env";
import type { SolarOrientationValue } from "@/lib/enums";
import { estimateHourlySolarProduction } from "@/server/lib/simulation/modules/solar";

const weatherApiResponseSchema = z.object({
	location: z.object({
		name: z.string(),
		region: z.string(),
		country: z.string(),
	}),
	forecast: z.object({
		forecastday: z.array(
			z.object({
				date: z.string(),
				day: z.object({
					condition: z.object({ text: z.string() }),
				}),
				hour: z.array(
					z.object({
						time: z.string(),
						is_day: z.number(),
						cloud: z.number(),
						short_rad: z.number().nullish(),
					}),
				),
			}),
		),
	}),
});

export interface SolarForecastHour {
	hour: number;
	production: number;
}

export interface SolarForecast {
	date: string;
	condition: string;
	location: string;
	averageCloudCover: number;
	totalProduction: number;
	usesSolarIrradiance: boolean;
	hours: SolarForecastHour[];
}

interface SolarForecastConfig {
	location: string;
	peakPower: number;
	orientation: SolarOrientationValue;
	inverterPower?: number | null;
	sunHoursPerDay?: number | null;
}

export const getNextDaySolarForecast = cache(async (config: SolarForecastConfig): Promise<SolarForecast | null> => {
	if (!env.WEATHERAPI_KEY || !config.location.trim()) {
		return null;
	}

	const url = new URL("https://api.weatherapi.com/v1/forecast.json");
	url.searchParams.set("key", env.WEATHERAPI_KEY);
	url.searchParams.set("q", config.location.trim());
	url.searchParams.set("days", "2");
	url.searchParams.set("aqi", "no");
	url.searchParams.set("alerts", "no");
	url.searchParams.set("lang", "de");

	try {
		const response = await fetch(url, {
			next: { revalidate: 60 * 60 * 6 },
			signal: AbortSignal.timeout(6000),
		});
		if (!response.ok) {
			return null;
		}

		const parsed = weatherApiResponseSchema.safeParse(await response.json());
		if (!parsed.success || parsed.data.forecast.forecastday.length < 2) {
			return null;
		}

		const tomorrow = parsed.data.forecast.forecastday[1];
		if (tomorrow.hour.length === 0) {
			return null;
		}
		const usesSolarIrradiance = tomorrow.hour.some((hour) => typeof hour.short_rad === "number");
		const hours = tomorrow.hour.map((weatherHour) => {
			const timestamp = new Date(`${weatherHour.time.replace(" ", "T")}:00Z`);
			const production = estimateHourlySolarProduction(
				timestamp,
				{
					peakPower: config.peakPower,
					orientation: config.orientation,
					inverterPower: config.inverterPower,
					sunHoursPerDay: config.sunHoursPerDay,
					aggregation: "hour",
				},
				{
					cloudCover: weatherHour.cloud,
					isDay: weatherHour.is_day === 1,
					shortwaveRadiation: weatherHour.short_rad ?? undefined,
				},
			);

			return {
				hour: timestamp.getUTCHours(),
				production: Number(production.toFixed(3)),
			};
		});
		const totalCloudCover = tomorrow.hour.reduce((sum, hour) => sum + hour.cloud, 0);
		const region = parsed.data.location.region.trim();
		const location = region
			? `${parsed.data.location.name}, ${region}`
			: `${parsed.data.location.name}, ${parsed.data.location.country}`;

		return {
			date: tomorrow.date,
			condition: tomorrow.day.condition.text,
			location,
			averageCloudCover: Math.round(totalCloudCover / tomorrow.hour.length),
			totalProduction: Number(hours.reduce((sum, hour) => sum + hour.production, 0).toFixed(2)),
			usesSolarIrradiance,
			hours,
		};
	} catch {
		return null;
	}
});
