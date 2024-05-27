import type { device, peaks, reports, sensor, sensorData, user, userData } from "../schema";

export enum SortOrder {
    ASC = "ASC",
    DESC = "DESC",
}

export type UserSelectType = typeof user.$inferSelect;

export type UserDataSelectType = typeof userData.$inferSelect;

export type DeviceSelectType = typeof device.$inferSelect;

export type PeakSelectType = typeof peaks.$inferSelect;

export type ReportSelectType = typeof reports.$inferSelect;

export type UserDataType = {
    reports: ReportSelectType;
    user_data: UserDataSelectType;
};

export type SensorSelectType = typeof sensor.$inferSelect;

export type SensorInsertType = typeof sensor.$inferInsert;

export type SensorDataSelectType = typeof sensorData.$inferSelect;

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
    CoolingAndFreezing = "Kühl- und Gefriergeräte",
    CookingAndBaking = "Koch- und Backgeräte",
    CleaningAndLaundry = "Reinigungs- und Wäschegeräte",
    EntertainmentAndComputers = "Unterhaltungselektronik und Computer",
    SmallKitchenAppliances = "Kleingeräte Küche",
    ClimateAndHeating = "Klima- und Heizgeräte",
    Lighting = "Beleuchtung",
    Care = "Pflege",
}
