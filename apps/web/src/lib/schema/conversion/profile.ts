import type { ReportSelectType, UserDataSelectType, UserDataType } from "@energyleaf/db/types";

export function createUserDataSchemaFromUserDataType(userData: UserDataType | null) {
    return createUserDataSchemaFromUserDataSelectType(userData?.user_data ?? null);
}

export function createUserDataSchemaFromUserDataSelectType(userData: UserDataSelectType | null) {
    return {
        houseType: userData?.property || "house",
        livingSpace: userData?.livingSpace || 0,
        people: userData?.household || 0,
        hotWater: userData?.hotWater || "electric",
        tariff: userData?.tariff || "basic",
        basePrice: userData?.basePrice || 0,
        workingPrice: userData?.workingPrice || 0,
        monthlyPayment: userData?.monthlyPayment || 0,
    };
}

export function createMailSettingsSchemaFromUserDataType(userData: UserDataType | null) {
    return createMailSettingsSchemaFromReportSelectType(userData?.reports ?? null);
}

export function createMailSettingsSchemaFromReportSelectType(reports: ReportSelectType | null) {
    return {
        interval: reports?.interval || 3,
        receiveMails: reports?.receiveMails || false,
        time: reports?.time || 6,
    };
}
