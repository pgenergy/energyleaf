import type { SensorDataSelectType, UserDataType } from "@energyleaf/db/types";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { getActionSession } from "../auth/auth.action";
import demoData from "./demo.json";

export async function isDemoUser() {
    const { session, user } = await getActionSession();

    if (!session || user.id !== "demo" || user.email !== "demo@energyleaf.de") {
        return false;
    }

    return true;
}

export function getUserDataCookieStore() {
    const data: UserDataType = {
        report_config: {
            id: 1,
            userId: "demo",
            receiveMails: false,
            interval: 3,
            time: 8,
            timestampLast: new Date(),
            createdTimestamp: new Date(),
        },
        user_data: {
            id: 1,
            userId: "demo",
            property: "house",
            livingSpace: 100,
            household: 2,
            hotWater: "electric",
            tariff: "basic",
            basePrice: 20,
            monthlyPayment: 2,
            workingPrice: 0.2,
            timestamp: new Date(2021, 1, 1),
            consumptionGoal: 20,
            electricityMeterNumber: "demo_number",
            electricityMeterType: "digital",
            electricityMeterImgUrl: null,
            wifiAtElectricityMeter: true,
            powerAtElectricityMeter: true,
            installationComment: null,
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
    const newData = {
        reports: {
            ...parsedData.report_config,
            ...data.report_config,
        },
        user_data: {
            ...parsedData.user_data,
            ...data.user_data,
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
        }[]

    const fixedData = inputData.map((item, index) => {
        const dataDate = new Date(item.timestamp);
        dataDate.setDate(day);
        dataDate.setMonth(month);

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
