import type { SensorDataSelectType, UserDataType } from "@energyleaf/db/types";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { getActionSession } from "../auth/auth.action";

export async function isDemoUser() {
    const { session, user } = await getActionSession();

    if (!session || user.id !== "demo" || user.email !== "demo@energyleaf.de") {
        return false;
    }

    return true;
}

export function getUserDataCookieStore() {
    const data: UserDataType = {
        reports: {
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
            ...parsedData.reports,
            ...data.reports,
        },
        user_data: {
            ...parsedData.user_data,
            ...data.user_data,
        },
    };

    cookies.set("demo_data", JSON.stringify(newData));
}

export function getDemoSensorData(start: Date, end: Date): SensorDataSelectType[] {
    const fixedData = [
        { timestamp: "00:00:00", value: 0.37 },
        { timestamp: "01:00:00", value: 0.39 },
        { timestamp: "02:00:00", value: 0.41 },
        { timestamp: "03:00:00", value: 0.43 },
        { timestamp: "04:00:00", value: 0.48 },
        { timestamp: "05:00:00", value: 0.47 },
        { timestamp: "06:00:00", value: 0.47 },
        { timestamp: "07:00:00", value: 0.87 },
        { timestamp: "08:00:00", value: 2.05 },
        { timestamp: "09:00:00", value: 0.77 },
        { timestamp: "10:00:00", value: 0.43 },
        { timestamp: "11:00:00", value: 0.4 },
        { timestamp: "12:00:00", value: 0.5 },
        { timestamp: "13:00:00", value: 0.4 },
        { timestamp: "14:00:00", value: 1.58 },
        { timestamp: "15:00:00", value: 0.53 },
        { timestamp: "16:00:00", value: 0.8 },
        { timestamp: "17:00:00", value: 0.62 },
        { timestamp: "18:00:00", value: 0.71 },
        { timestamp: "19:00:00", value: 0.69 },
        { timestamp: "20:00:00", value: 0.75 },
        { timestamp: "21:00:00", value: 0.76 },
        { timestamp: "22:00:00", value: 0.48 },
        { timestamp: "23:00:00", value: 0.35 },
    ];

    return fixedData
        .map((item, index) => {
            const date = new Date();
            const [hours, minutes, seconds] = item.timestamp.split(":").map(Number);
            date.setHours(hours, minutes, seconds, 0);

            if (date.getTime() >= start.getTime() && date.getTime() <= end.getTime()) {
                return {
                    id: index.toString(),
                    sensorId: "demo_sensor",
                    value: item.value,
                    timestamp: date,
                };
            }
            return null;
        })
        .filter((item) => item) as SensorDataSelectType[];
}
