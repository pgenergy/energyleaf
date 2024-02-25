import { device, mail, peaks, sensor, sensorData, user, userData } from "../schema";

export enum SortOrder {
    ASC = "ASC",
    DESC = "DESC",
}

export enum AggregationType {
    RAW = "RAW",
    HOUR = "HOUR",
    DAY = "DAY",
    WEEK = "WEEK",
    MONTH = "MONTH",
    YEAR = "YEAR",
}

export type UserSelectType = typeof user.$inferSelect;

export type UserDataSelectType = typeof userData.$inferSelect;

export type DeviceSelectType = typeof device.$inferSelect;

export type PeakSelectType = typeof peaks.$inferSelect;

export type MailSelectType = typeof mail.$inferSelect;

export type UserDataType = {
    mail: MailSelectType;
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
