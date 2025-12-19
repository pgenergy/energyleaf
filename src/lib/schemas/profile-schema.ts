import { z } from "zod";
import { ChargingSpeed, HeatPumpSource, HouseType, SolarOrientation, TariffType, TimeZoneType } from "../enums";

export const householdSchema = z.object({
	houseType: z.enum(HouseType).default(HouseType.Apartement),
	livingSpace: z.coerce
		.number({ error: "Bitte geben Sie ihre Gebäude Größe an." })
		.min(1, "Ihr Gebäude muss mindestens 1qm groß sein."),
	people: z.coerce
		.number({ error: "Bitte geben Sie an, wie viele Personen in ihrem Haushalt leben." })
		.min(1, "Es muss mindestens eine Person in Ihrem Haushalt leben."),
});

export const energyTarfiffSchema = z.object({
	tariffType: z.enum(TariffType).default(TariffType.Basic).optional(),
	basePrice: z.coerce
		.number({ error: "Bitte geben Sie den Basispreis an." })
		.min(0.01, "Der Basispreis muss mindestens 0,01 Euro betragen."),
	workingPrice: z.coerce
		.number({ error: "Bitte geben Sie den Arbeitspreis an." })
		.min(0.01, "Der Arbeitspreis muss mindestens 0,01 Euro betragen."),
	monthlyPayment: z.coerce
		.number({ error: "Bitte geben Sie die monatliche Zahlung an." })
		.min(1, "Die monatliche Zahlung muss mindestens 0,01 Euro betragen."),
});

export const accountNameSchema = z.object({
	firstname: z.string({ error: "Bitte geben Sie Ihren Vornamen an." }).min(1, "Bitte geben Sie Ihren Vornamen an."),
	lastname: z.string({ error: "Bitte geben Sie Ihren Nachnamen an." }).min(1, "Bitte geben Sie Ihren Nachnamen an."),
});

export const accountInfoSchema = z.object({
	phone: z
		.string({ error: "Bitte geben Sie Ihre Telefonnummer an." })
		.min(1, "Bitte geben Sie Ihre Telefonnummer an.")
		.optional(),
	address: z
		.string({ error: "Bitte geben Sie Ihre Adresse an." })
		.min(1, "Bitte geben Sie Ihre Adresse an.")
		.optional(),
	timezone: z.enum(TimeZoneType).default(TimeZoneType.Europe_Berlin),
});

export const energyGoalSchema = z.object({
	energy: z.coerce.number({ error: "Bitte geben Sie Ihren Energie-Zielwert an." }).optional(),
	cost: z.coerce
		.number({ error: "Bitte geben Sie Ihren Energie-Kosten-Zielwert an." })
		.min(0.01, "Der Energie-Kosten-Zielwert muss mindestens 0.01 Euro betragen."),
});

export const anomalySchema = z.object({
	active: z.boolean().default(true).optional(),
});

export const reportConfigSchema = z.object({
	active: z.boolean().default(true).optional(),
	days: z.array(z.number()).default([]),
});

export const deleteAccountSchema = z.object({
	password: z
		.string({ error: "Ihr Passwort ist notwendig um Ihren Account zu löschen." })
		.min(1, "Bitte geben Sie Ihr Passwort an."),
});

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export const chargingTimeSlotSchema = z.object({
	start: z.string().regex(timeRegex, "Ungültige Startzeit (HH:MM)"),
	end: z.string().regex(timeRegex, "Ungültige Endzeit (HH:MM)"),
});

const weekdayScheduleSchema = z.array(chargingTimeSlotSchema).nullable().optional();

export const evSettingsSchema = z.object({
	chargingSpeed: z.enum(ChargingSpeed).default(ChargingSpeed.Eleven),
	evCapacityKwh: z.coerce
		.number({ error: "Bitte geben Sie die Batteriekapazität an." })
		.min(1, "Die Batteriekapazität muss mindestens 1 kWh betragen.")
		.max(200, "Die Batteriekapazität darf maximal 200 kWh betragen."),
	dailyDrivingDistanceKm: z.coerce
		.number()
		.min(0, "Die Strecke kann nicht negativ sein.")
		.max(1000, "Die Strecke darf maximal 1000 km betragen.")
		.optional()
		.or(z.literal(""))
		.transform((val) => (val === "" ? undefined : val)),
	avgConsumptionPer100Km: z.coerce
		.number()
		.min(1, "Der Verbrauch muss mindestens 1 kWh/100km betragen.")
		.max(100, "Der Verbrauch darf maximal 100 kWh/100km betragen.")
		.optional()
		.or(z.literal(""))
		.transform((val) => (val === "" ? undefined : val)),
	defaultSchedule: z.array(chargingTimeSlotSchema).default([]),
	weekdaySchedules: z
		.object({
			monday: weekdayScheduleSchema,
			tuesday: weekdayScheduleSchema,
			wednesday: weekdayScheduleSchema,
			thursday: weekdayScheduleSchema,
			friday: weekdayScheduleSchema,
			saturday: weekdayScheduleSchema,
			sunday: weekdayScheduleSchema,
		})
		.default({}),
});

export const solarSettingsSchema = z.object({
	peakPower: z.coerce
		.number({ error: "Bitte geben Sie die Peak-Leistung an." })
		.min(0.1, "Die Leistung muss mindestens 0.1 kWp betragen.")
		.max(100, "Die Leistung darf maximal 100 kWp betragen."),
	orientation: z.enum(SolarOrientation).default(SolarOrientation.South),
	inverterPower: z.coerce
		.number({ error: "Bitte geben Sie die Wechselrichter-Leistung an." })
		.min(0.1, "Die Leistung muss mindestens 0.1 kW betragen.")
		.optional()
		.or(z.literal(0))
		.or(z.literal("")),
	sunHoursPerDay: z.coerce
		.number()
		.min(0.5, "Die Sonnenstunden müssen mindestens 0.5 h betragen.")
		.max(16, "Die Sonnenstunden dürfen maximal 16 h betragen.")
		.optional()
		.or(z.literal(""))
		.transform((val) => (val === "" ? undefined : val)),
});

export const heatingTimeSlotSchema = z.object({
	start: z.string().regex(timeRegex, "Ungültige Startzeit (HH:MM)"),
	end: z.string().regex(timeRegex, "Ungültige Endzeit (HH:MM)"),
	targetTemperature: z.coerce
		.number({ error: "Bitte geben Sie die Zieltemperatur an." })
		.min(10, "Die Temperatur muss mindestens 10°C betragen.")
		.max(30, "Die Temperatur darf maximal 30°C betragen."),
});

const heatingWeekdayScheduleSchema = z.array(heatingTimeSlotSchema).nullable().optional();

export const heatPumpSettingsSchema = z.object({
	source: z.enum(HeatPumpSource).default(HeatPumpSource.Probe),
	powerKw: z.coerce
		.number({ error: "Bitte geben Sie die Heizleistung an." })
		.min(1, "Die Leistung muss mindestens 1 kW betragen.")
		.max(100, "Die Leistung darf maximal 100 kW betragen."),
	bufferLiter: z.coerce
		.number({ error: "Bitte geben Sie das Speichervolumen an." })
		.min(0, "Das Volumen kann nicht negativ sein.")
		.max(5000, "Das Volumen darf maximal 5000 Liter betragen.")
		.optional()
		.or(z.literal(""))
		.transform((val) => (val === "" ? 0 : val)),
	defaultSchedule: z.array(heatingTimeSlotSchema).default([]),
	weekdaySchedules: z
		.object({
			monday: heatingWeekdayScheduleSchema,
			tuesday: heatingWeekdayScheduleSchema,
			wednesday: heatingWeekdayScheduleSchema,
			thursday: heatingWeekdayScheduleSchema,
			friday: heatingWeekdayScheduleSchema,
			saturday: heatingWeekdayScheduleSchema,
			sunday: heatingWeekdayScheduleSchema,
		})
		.default({}),
});

export const tariffZoneSchema = z.object({
	start: z.string().regex(timeRegex, "Ungültige Startzeit (HH:MM)"),
	end: z.string().regex(timeRegex, "Ungültige Endzeit (HH:MM)"),
	price: z.coerce.number({ error: "Bitte geben Sie den Preis an." }).min(0, "Der Preis darf nicht negativ sein."),
});

const weekdayZonesSchema = z.array(tariffZoneSchema).nullable().optional();

export const touTariffSchema = z.object({
	basePrice: z.coerce
		.number({ error: "Bitte geben Sie den Grundpreis an." })
		.min(0, "Der Grundpreis darf nicht negativ sein."),
	standardPrice: z.coerce
		.number({ error: "Bitte geben Sie den Standardpreis an." })
		.min(0, "Der Preis darf nicht negativ sein."),
	zones: z.array(tariffZoneSchema).default([]),
	weekdayZones: z
		.object({
			monday: weekdayZonesSchema,
			tuesday: weekdayZonesSchema,
			wednesday: weekdayZonesSchema,
			thursday: weekdayZonesSchema,
			friday: weekdayZonesSchema,
			saturday: weekdayZonesSchema,
			sunday: weekdayZonesSchema,
		})
		.default({}),
});

export const batterySettingsSchema = z.object({
	capacityKwh: z.coerce
		.number({ error: "Bitte geben Sie die Batteriekapazität an." })
		.min(0.1, "Die Kapazität muss mindestens 0.1 kWh betragen.")
		.max(500, "Die Kapazität darf maximal 500 kWh betragen."),
	maxPowerKw: z.coerce
		.number({ error: "Bitte geben Sie die maximale Leistung an." })
		.min(0.1, "Die Leistung muss mindestens 0.1 kW betragen.")
		.max(100, "Die Leistung darf maximal 100 kW betragen."),
});

// Admin schemas
export const adminAccountStatusSchema = z.object({
	isActive: z.boolean(),
	isAdmin: z.boolean(),
	isParticipant: z.boolean(),
	isSimulationFree: z.boolean(),
});
