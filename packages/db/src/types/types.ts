import type {
    device,
    reportConfig,
    reports,
    sensor,
    sensorData,
    sensorDataSequence,
    user,
    userData,
    userExperimentData,
} from "../schema";

export enum SortOrder {
    ASC = "ASC",
    DESC = "DESC",
}

export type UserSelectType = typeof user.$inferSelect;

export type UserDataSelectType = typeof userData.$inferSelect;

export type UserExperimentDataSelectType = typeof userExperimentData.$inferSelect;

export type DeviceSelectType = typeof device.$inferSelect;

export type ReportConfigSelectType = typeof reportConfig.$inferSelect;

export type ReportSelectType = typeof reports.$inferSelect;

export type AnomalyConfig = {
    receiveMails: boolean;
};

export type MailConfig = {
    report_config: ReportConfigSelectType;
    anomaly_config: AnomalyConfig;
};

export type UserDataType = {
    user_data: UserDataSelectType;
    mail_config: MailConfig;
};

export type SensorSelectType = typeof sensor.$inferSelect;

export type SensorInsertType = typeof sensor.$inferInsert;

export type SensorDataSelectType = typeof sensorData.$inferSelect;

export type SensorDataSequenceType = typeof sensorDataSequence.$inferSelect;

export type SensorSelectTypeWithUser = {
    sensor: SensorSelectType;
    user: UserSelectType | null;
};

export enum SensorType {
    Electricity = "electricity",
    Gas = "gas",
}

export const SensorTypeMap: Record<SensorType, string> = {
    [SensorType.Electricity]: "Strom",
    [SensorType.Gas]: "Gas",
};

export const userDataExperimentStatusEnum: Record<
    (typeof userExperimentData.experimentStatus.enumValues)[number],
    string
> = {
    registered: "Registriert",
    approved: "Genehmigt",
    dismissed: "Abgelehnt",
    exported: "Exportiert",
    first_survey: "Erste Umfrage",
    first_finished: "Erste Umfrage abgeschlossen",
    installation: "Installations Datum",
    second_survey: "Zweite Umfrage",
    second_finished: "Zweite Umfrage abgeschlossen",
    third_survey: "Dritte Umfrage",
    third_finished: "Dritte Umfrage abgeschlossen",
    deinstallation: "Deinstallation Datum",
    inactive: "Inaktiv",
};

export const userDataTariffEnums: Record<(typeof userData.tariff.enumValues)[number], string> = {
    basic: "Basis Strom",
    eco: "Öko Strom",
};

export const userDataPropertyEnums: Record<(typeof userData.property.enumValues)[number], string> = {
    house: "Haus",
    apartment: "Wohnung",
};

export const userDataHotWaterEnums: Record<(typeof userData.hotWater.enumValues)[number], string> = {
    electric: "Elektrisch",
    not_electric: "Nicht elektrisch",
};

export const userDataElectricityMeterTypeEnums: Record<
    (typeof userData.electricityMeterType.enumValues)[number],
    string
> = {
    digital: "Digital",
    analog: "Analog",
};

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

export const DeviceCategoryTitles: Record<DeviceCategory, string> = {
    [DeviceCategory.Stovetop]: "Herd",
    [DeviceCategory.Oven]: "Backofen",
    [DeviceCategory.Fridge]: "Kühlschrank",
    [DeviceCategory.Freezer]: "Gefrierschrank",
    [DeviceCategory.Microwave]: "Mikrowelle",
    [DeviceCategory.Kettle]: "Wasserkocher",
    [DeviceCategory.Toaster]: "Toaster",
    [DeviceCategory.CoffeeMachine]: "Kaffeemaschine",
    [DeviceCategory.AirFryer]: "Heißluftfritteuse",
    [DeviceCategory.Blender]: "Mixer",
    [DeviceCategory.Dishwasher]: "Geschirrspüler",
    [DeviceCategory.WashingMachine]: "Waschmaschine",
    [DeviceCategory.Dryer]: "Wäschetrockner",
    [DeviceCategory.VacuumCleaner]: "Staubsauger",
    [DeviceCategory.Iron]: "Bügeleisen",
    [DeviceCategory.TVsAndMonitors]: "Fernseher und Monitore",
    [DeviceCategory.EntertainmentAndComputers]: "Unterhaltungselektronik und Computer",
    [DeviceCategory.HairDryer]: "Föhn",
    [DeviceCategory.BodyCare]: "Körperpflege",
    [DeviceCategory.HeaterFan]: "Heizlüfter",
    [DeviceCategory.ElectricHeater]: "Elektroheizung",
    [DeviceCategory.AirConditioning]: "Klimaanlage",
    [DeviceCategory.HeatPump]: "Wärmepumpe",
    [DeviceCategory.Lighting]: "Beleuchtung",
    [DeviceCategory.ECar]: "Elektroauto",
    [DeviceCategory.EMobility]: "Weitere Elektromobilität (z. B. E-Bike)",
    [DeviceCategory.Others]: "Sonstige Geräte",
};

export enum DeviceCategoryPowerState {
    VERY_FRUGAL = "Sehr sparsam",
    FRUGAL = "Sparsam",
    MEDIUM = "Durchschnittlich",
    ABOVE_AVERAGE = "Überdurchschnittlich",
    HIGH = "Hoch",
}

export enum ExperimentNumberEnum {
    FIRST = 0,
    SECOND = 1,
}

export const ExperimentNumberEnumMap: Record<ExperimentNumberEnum, string> = {
    [ExperimentNumberEnum.FIRST]: "Erster Durchlauf",
    [ExperimentNumberEnum.SECOND]: "Zweiter Durchlauf",
};
