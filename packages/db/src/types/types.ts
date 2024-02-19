import { device, mail, peaks, sensor, sensorData, userData } from "../schema";

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

export type UserSelectType = typeof userData.$inferSelect;

export type DeviceSelectType = typeof device.$inferSelect;

export type PeakSelectType = typeof peaks.$inferSelect;

export type UserDataType = {
    mail: typeof mail.$inferSelect;
    user_data: UserSelectType;
};

export type SensorSelectType = typeof sensor.$inferSelect;

export type SensorDataSelectType = typeof sensorData.$inferSelect;
