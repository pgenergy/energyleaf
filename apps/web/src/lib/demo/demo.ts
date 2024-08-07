import type { SensorDataSelectType, UserDataType } from "@energyleaf/db/types";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { cookies } from "next/headers";
import { getActionSession } from "../auth/auth.action";
import demoData from "./demo.json";

export async function isDemoUser() {
    const { session, user } = await getActionSession();

    if (!session || user.id !== "demo" || user.email !== "demo@energyleaf.de") {
        return false;
    }

    return true;
}

export function getDemoUserData() {
    const data = cookies().get("demo_data")?.value;
    if (!data) {
        return getUserDataCookieStoreDefaults();
    }

    const userData = JSON.parse(data) as UserDataType;
    userData.user_data.timestamp = new Date(userData.user_data.timestamp);
    return userData;
}

export function getUserDataCookieStoreDefaults() {
    const data: UserDataType = {
        user_data: {
            id: 1,
            userId: "demo",
            property: "house",
            livingSpace: 100,
            household: 2,
            hotWater: "electric",
            tariff: "basic",
            basePrice: 20,
            monthlyPayment: 35,
            workingPrice: 0.38,
            timestamp: new Date(2021, 1, 1),
            consumptionGoal: 20,
            electricityMeterNumber: "demo_number",
            electricityMeterType: "digital",
            electricityMeterImgUrl: null,
            wifiAtElectricityMeter: true,
            powerAtElectricityMeter: true,
            installationComment: null,
            devicePowerEstimationRSquared: null,
        },
        mail_config: {
            report_config: {
                id: 1,
                userId: "demo",
                receiveMails: false,
                interval: 3,
                time: 8,
                timestampLast: new Date(),
                createdTimestamp: new Date(),
            },
            anomaly_config: {
                receiveMails: false,
            },
        },
    };

    return data;
}

export function updateUserDataCookieStore(cookies: ReadonlyRequestCookies, data: Partial<UserDataType>) {
    const userData = cookies.get("demo_data");
    if (!userData) {
        return;
    }

    const parsedData = JSON.parse(userData.value) as UserDataType;
    const newData: UserDataType = {
        user_data: {
            ...parsedData.user_data,
            ...data.user_data,
        },
        mail_config: {
            anomaly_config: {
                ...parsedData.mail_config.anomaly_config,
                ...data.mail_config?.anomaly_config,
            },
            report_config: {
                ...parsedData.mail_config.report_config,
                ...data.mail_config?.report_config,
            },
        },
    };

    cookies.set("demo_data", JSON.stringify(newData));
}

export function getDemoSensorData(start: Date, end: Date): SensorDataSelectType[] {
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth();
    const inputData = demoData as {
        id: string;
        sensorId: string;
        value: number;
        timestamp: string;
    }[];

    const fixedData = inputData.map((item, index) => {
        const dataDate = new Date(item.timestamp);
        dataDate.setDate(day);
        dataDate.setMonth(month);
        dataDate.setHours(dataDate.getHours(), dataDate.getMinutes(), dataDate.getSeconds(), 0);

        return {
            id: item.id,
            sensorId: "demo_sensor",
            timestamp: dataDate,
            value: index === 0 ? 0 : item.value - inputData[index - 1].value,
            valueOut: null,
            valueCurrent: null,
        };
    });

    return fixedData.filter(
        (item) => item.timestamp.getTime() >= start.getTime() && item.timestamp.getTime() <= end.getTime(),
    );
}
