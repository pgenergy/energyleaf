export enum DeviceCategory {
	Stovetop = "stovetop",
	Oven = "oven",
	Fridge = "fridge",
	Freezer = "freezer",
	Microwave = "microwave",
	Kettle = "kettle",
	Toaster = "toaster",
	CoffeeMachine = "coffeeMachine",
	AirFryer = "airFryer",
	Blender = "blender",
	Dishwasher = "dishwasher",
	WashingMachine = "washingMachine",
	Dryer = "dryer",
	VacuumCleaner = "vacuumCleaner",
	Iron = "iron",
	TVsAndMonitors = "tvsAndMonitors",
	EntertainmentAndComputers = "entertainmentAndComputers",
	HairDryer = "hairDryer",
	BodyCare = "bodyCare",
	HeaterFan = "heaterFan",
	ElectricHeater = "electricHeater",
	AirConditioning = "airConditioning",
	HeatPump = "heatPump",
	Lighting = "lighting",
	ECar = "eCar",
	EMobility = "eMobility",
	Others = "others",
}

export type DeviceCategoryKey = keyof typeof DeviceCategory;
export type DeviceCategoryValue = (typeof DeviceCategory)[keyof typeof DeviceCategory];

export const DeviceCategoryDisplay: Record<DeviceCategoryValue, string> = {
	stovetop: "Herdplatte",
	oven: "Ofen",
	fridge: "Kühlschrank",
	freezer: "Gefrierschrank",
	microwave: "Mikrowelle",
	kettle: "Teekanne",
	toaster: "Toaster",
	coffeeMachine: "Kaffeemaschine",
	airFryer: "Heißluftfritöse",
	blender: "Mixer",
	dishwasher: "Spülmaschine",
	washingMachine: "Waschmaschine",
	dryer: "Trockner",
	vacuumCleaner: "Staubsauger",
	iron: "Bügeleisen",
	tvsAndMonitors: "Fernseher",
	entertainmentAndComputers: "Laptop",
	hairDryer: "Föhn",
	bodyCare: "Körperpflege",
	heaterFan: "Heizung",
	electricHeater: "Elektrische Heizung",
	airConditioning: "Klimaanlage",
	heatPump: "Wärmepumpe",
	lighting: "Beleuchtung",
	eCar: "E-Auto",
	eMobility: "E-Mobilität",
	others: "Sonstiges",
};

export enum ExperimentPhase {
	Registered = "registered",
	Approved = "approved",
	Dismissed = "dismissed",
	Exported = "exported",
	FirstSurvey = "first_survey",
	FirstFinished = "first_finished",
	Installation = "installation",
	SecondSurvey = "second_survey",
	SecondFinished = "second_finished",
	ThirdSurvey = "third_survey",
	ThirdFinished = "third_finished",
	Deinstallation = "deinstallation",
	Inactive = "inactive",
}
export type ExperimentPhaseKey = keyof typeof ExperimentPhase;
export type ExperimentPhaseValue = (typeof ExperimentPhase)[keyof typeof ExperimentPhase];

export enum SensorType {
	Water = "water",
	Electricity = "electricity",
	Gas = "gas",
}
export type SensorTypeKey = keyof typeof SensorType;
export type SensorTypeValue = (typeof SensorType)[keyof typeof SensorType];
export const SensorTypeDisplay: Record<SensorTypeValue, string> = {
	water: "Wasser",
	electricity: "Strom",
	gas: "Gas",
};

export enum ElectricityMeter {
	Digital = "digital",
	Analog = "analog",
}

export type ElectricityMeterKey = keyof typeof ElectricityMeter;
export type ElectricityMeterValue = (typeof ElectricityMeter)[keyof typeof ElectricityMeter];
export const ElectricityMeterDisplay: Record<ElectricityMeterValue, string> = {
	digital: "Digitaler Zähler",
	analog: "Analoger Zähler",
};

export enum HouseType {
	Apartement = "apartement",
	House = "house",
}

export type HouseTypeKey = keyof typeof HouseType;
export type HouseTypeValue = (typeof HouseType)[keyof typeof HouseType];
export const HouseTypeDisplay: Record<HouseTypeValue, string> = {
	apartement: "Apartement",
	house: "Haus",
};

export enum TariffType {
	Basic = "basic",
	Eco = "eco",
	TimeOfUse = "time_of_use",
}

export type TariffTypeKey = keyof typeof TariffType;
export type TariffTypeValue = (typeof TariffType)[keyof typeof TariffType];
export const TariffTypeDisplay: Record<TariffTypeValue, string> = {
	basic: "Kein Ökostrom",
	eco: "Ökostrom",
	time_of_use: "Zeitvariabel (TOU)",
};

export enum WaterType {
	Electric = "electric",
	NotElectric = "not_electric",
}
export type WaterTypeKey = keyof typeof WaterType;
export type WaterTypeValue = (typeof WaterType)[keyof typeof WaterType];
export const WaterTypeDisplay: Record<WaterTypeValue, string> = {
	electric: "Elektrisch",
	not_electric: "Nicht elektrisch",
};

export enum TimeZoneType {
	Europe_Berlin = "europe_berlin",
}

export type TimezoneTypeKey = keyof typeof TimeZoneType;
export type TimezoneTypeValue = (typeof TimeZoneType)[keyof typeof TimeZoneType];
export const TimeZoneTypeDisplay: Record<TimezoneTypeValue, string> = {
	europe_berlin: "Berlin",
};

export const TimezoneTypeToTimeZone: Record<TimezoneTypeValue, string> = {
	europe_berlin: "Europe/Berlin",
};

export enum ChargingSpeed {
	Seven = "7kwh",
	Eleven = "11kwh",
}

export type ChargingSpeedKey = keyof typeof ChargingSpeed;
export type ChargingSpeedValue = (typeof ChargingSpeed)[keyof typeof ChargingSpeed];

export const ChargingSpeedDisplay: Record<ChargingSpeedValue, string> = {
	"7kwh": "7 kW",
	"11kwh": "11 kW",
};

export enum SolarOrientation {
	South = "south",
	East = "east",
	West = "west",
	EastWest = "east_west",
}

export type SolarOrientationKey = keyof typeof SolarOrientation;
export type SolarOrientationValue = (typeof SolarOrientation)[keyof typeof SolarOrientation];

export const SolarOrientationDisplay: Record<SolarOrientationValue, string> = {
	south: "Süd",
	east: "Ost",
	west: "West",
	east_west: "Ost-West",
};

export enum HeatPumpSource {
	Probe = "probe",
	Collector = "collector",
}

export type HeatPumpSourceKey = keyof typeof HeatPumpSource;
export type HeatPumpSourceValue = (typeof HeatPumpSource)[keyof typeof HeatPumpSource];

export const HeatPumpSourceDisplay: Record<HeatPumpSourceValue, string> = {
	probe: "Erdsonde (Bohrung)",
	collector: "Erdkollektor (Fläche)",
};

export enum SimulationType {
	EV = "ev",
	Solar = "solar",
	HeatPump = "heatpump",
	Battery = "battery",
	TOU = "tou",
}

export type SimulationTypeKey = keyof typeof SimulationType;
export type SimulationTypeValue = (typeof SimulationType)[keyof typeof SimulationType];

export const SimulationTypeDisplay: Record<SimulationTypeValue, string> = {
	ev: "E-Auto",
	solar: "Photovoltaik",
	heatpump: "Wärmepumpe",
	battery: "Batteriespeicher",
	tou: "Zeitvariable Tarife",
};

export enum HintStageType {
	Simple = "simple",
	Intermediate = "intermediate",
	Expert = "expert",
}

export type HintStageTypeKey = keyof typeof HintStageType;
export type HintStageTypeValue = (typeof HintStageType)[keyof typeof HintStageType];

export const HintStageTypeDisplay: Record<HintStageTypeValue, string> = {
	simple: "Einfach",
	intermediate: "Mittel",
	expert: "Experte",
};
