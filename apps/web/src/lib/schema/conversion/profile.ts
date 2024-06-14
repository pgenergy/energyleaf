import type { MailConfig, UserDataSelectType } from "@energyleaf/db/types";
import type { z } from "zod";
import type { mailSettingsSchema } from "../profile";

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

export function createMailSettingsSchema(mailConfig: MailConfig | null): z.infer<typeof mailSettingsSchema> {
    return {
        interval: mailConfig?.report_config.interval || 3,
        receiveReportMails: mailConfig?.report_config.receiveMails || false,
        time: mailConfig?.report_config.time || 6,
        receiveAnomalyMails: mailConfig?.anomaly_config.receiveMails || false,
    };
}
