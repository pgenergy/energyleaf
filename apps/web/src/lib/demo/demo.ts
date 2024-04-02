import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

import type { DeviceSelectType, PeakSelectType, SensorDataSelectType, UserDataType } from "@energyleaf/db/types";

import { getActionSession } from "../auth/auth.action";

export async function isDemoUser() {
    const { session, user } = await getActionSession();

    if (!session || user.id !== "demo" || user.email !== "demo@energyleaf.de") {
        return false;
    }

    return true;
}

export function addDeviceCookieStore(cookies: ReadonlyRequestCookies, name: string, category?: string) {
    const devices = cookies.get("demo_devices");
    if (!devices) {
        cookies.set(
            "demo_devices",
            JSON.stringify([
                {
                    id: 1,
                    name,
                    created: new Date(),
                    timestamp: new Date(),
                    userId: "demo",
                    category: category || null,
                } as DeviceSelectType,
            ]),
        );
        return;
    }

    const parsedDevices = JSON.parse(devices.value) as DeviceSelectType[];
    parsedDevices.push({
        id: parsedDevices.length + 1,
        name,
        created: new Date(),
        timestamp: new Date(),
        userId: "demo",
        category: category || "demo",
    });
    cookies.set("demo_devices", JSON.stringify(parsedDevices));
}

export function removeDeviceCookieStore(cookies: ReadonlyRequestCookies, id: string | number) {
    const devices = cookies.get("demo_devices");
    if (!devices) {
        return;
    }

    const parsedDevices = JSON.parse(devices.value) as DeviceSelectType[];
    const newDevices = parsedDevices.filter((device) => device.id !== id);
    cookies.set("demo_devices", JSON.stringify(newDevices));
}

export function getDevicesCookieStore(cookies: ReadonlyRequestCookies) {
    const devices = cookies.get("demo_devices");
    if (!devices) {
        return [];
    }

    const data = JSON.parse(devices.value) as DeviceSelectType[];

    return data.map((d) => ({
        ...d,
        timestamp: new Date(d.timestamp),
        created: d.created ? new Date(d.created) : null,
    }));
}

export function updateDeviceCookieStore(
    cookies: ReadonlyRequestCookies,
    id: string | number,
    name: string,
    category?: string,
) {
    const devices = cookies.get("demo_devices");
    if (!devices) {
        return;
    }

    const parsedDevices = JSON.parse(devices.value) as DeviceSelectType[];
    const device = parsedDevices.find((d) => d.id === id);
    if (!device) {
        return;
    }

    device.name = name;
    device.timestamp = new Date();
    device.category = category || "";
    cookies.set("demo_devices", JSON.stringify(parsedDevices));
}

export function addOrUpdatePeakCookieStore(
    cookies: ReadonlyRequestCookies,
    timestamp: string,
    deviceId: string | number,
) {
    const peaks = cookies.get("demo_peaks");
    const date = new Date(timestamp);
    if (!peaks) {
        cookies.set(
            "demo_peaks",
            JSON.stringify([
                {
                    id: 1,
                    sensorId: "demo_sensor",
                    deviceId,
                    timestamp: date,
                } as PeakSelectType,
            ]),
        );
        return;
    }

    const parsedPeaks = JSON.parse(peaks.value) as PeakSelectType[];
    parsedPeaks.push({
        id: parsedPeaks.length + 1,
        sensorId: "demo_sensor",
        deviceId: Number(deviceId),
        timestamp: date,
    });
    cookies.set("demo_peaks", JSON.stringify(parsedPeaks));
}

export function getPeaksCookieStore(cookies: ReadonlyRequestCookies) {
    const peaks = cookies.get("demo_peaks");
    if (!peaks) {
        return [];
    }

    const data = JSON.parse(peaks.value) as PeakSelectType[];

    return data.map((d) => {
        const date = d.timestamp ? new Date(d.timestamp) : new Date();
        return {
            ...d,
            timestamp: date,
        };
    });
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
            basePrice: 0.4,
            monthlyPayment: 2,
            workingPrice: 0.4,
            timestamp: new Date(2021, 1, 1),
            consumptionGoal: 1000
        },
    };

    return data;
}

export function updateUserDataCookieStore(cookies: ReadonlyRequestCookies, data: Partial<UserDataType>) {
    const userData = cookies.get("demo_data");
    if (!userData) {
        return;
    }

    const newData = {
        ...(JSON.parse(userData.value) as UserDataType),
        ...data,
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

            if (date >= start && date <= end) {
                return {
                    id: index.toString(),
                    sensorId: "demo_sensor",
                    value: item.value,
                    timestamp: date,
                };
            }
            return null;
        })
        .filter((item) => item !== null) as SensorDataSelectType[];
}
