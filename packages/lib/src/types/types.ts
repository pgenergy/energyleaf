export enum AggregationType {
    RAW = "RAW",
    HOUR = "HOUR",
    WEEKDAY = "WEEKDAY",
    DAY = "DAY",
    WEEK = "WEEK",
    CALENDAR_WEEK = "CALENDAR_WEEK",
    MONTH = "MONTH",
    YEAR = "YEAR",
}

export interface IDefaultActionReturn {
    success: boolean;
    message: string;
}

export interface IDefaultActionReturnPayload<T> extends IDefaultActionReturn {
    payload?: T;
}

export type DefaultActionReturn = IDefaultActionReturn | undefined;
export type DefaultActionReturnPayload<T> = IDefaultActionReturnPayload<T> | undefined;

export enum DismissedReasonEnum {
    WRONG_METER = 0,
    ATTENTION_CHECK = 1,
}

export const DismissedReasonEnumMap: Record<DismissedReasonEnum, string> = {
    [DismissedReasonEnum.WRONG_METER]: "Falscher Zähler",
    [DismissedReasonEnum.ATTENTION_CHECK]: "Aufmerksamkeitsprüfung",
};

export interface DeviceCategoryPower {
    averagePower: number;
    minimumPower: number;
    maximumPower: number;
    linkToSource: string;
    purchasePrice: number;
}
