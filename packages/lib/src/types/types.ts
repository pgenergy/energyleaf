export enum AggregationType {
    RAW = "RAW",
    HOUR = "HOUR",
    DAY = "DAY",
    WEEK = "WEEK",
    MONTH = "MONTH",
    YEAR = "YEAR",
}

export interface IDefaultActionReturn {
    success: boolean;
    message: string;
};

export type DefaultActionReturn = IDefaultActionReturn | undefined;
