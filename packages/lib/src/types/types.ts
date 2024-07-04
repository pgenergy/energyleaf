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
}

export interface IDefaultActionReturnPayload<T> extends IDefaultActionReturn {
    payload?: T;
}

export type DefaultActionReturn = IDefaultActionReturn | undefined;
export type DefaultActionReturnPayload<T> = IDefaultActionReturnPayload<T> | undefined;

export enum DismissedReasonEnum {
    WRONG_METER = "WRONG_METER",
    ATTENTION_CHECK = "ATTENTION_CHECK",
}

export const DismissedReasonEnumMap: Record<DismissedReasonEnum, string> = {
    [DismissedReasonEnum.WRONG_METER]: "Falscher Zähler",
    [DismissedReasonEnum.ATTENTION_CHECK]: "Aufmerksamkeitsprüfung",
};
