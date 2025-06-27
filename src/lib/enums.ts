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
}

export type TariffTypeKey = keyof typeof TariffType;
export type TariffTypeValue = (typeof TariffType)[keyof typeof TariffType];
export const TariffTypeDisplay: Record<TariffTypeValue, string> = {
	basic: "Kein Ökostrom",
	eco: "Ökostrom",
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
