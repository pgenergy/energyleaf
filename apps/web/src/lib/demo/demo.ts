import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

import type { DeviceSelectType, PeakSelectType, SensorDataSelectType, UserDataType } from "@energyleaf/db/util";

import { getSession } from "../auth/auth";

export async function isDemoUser() {
    const session = await getSession();

    if (!session || session.user.id !== "-1" || session.user.email !== "demo@energyleaf.de") {
        return false;
    }

    return true;
}

export function addDeviceCookieStore(cookies: ReadonlyRequestCookies, name: string) {
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
                    userId: -1,
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
        userId: -1,
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

export function updateDeviceCookieStore(cookies: ReadonlyRequestCookies, id: string | number, name: string) {
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
    cookies.set("demo_devices", JSON.stringify(parsedDevices));
}

export function addOrUpdatePeakCookieStore(
    cookies: ReadonlyRequestCookies,
    timestamp: string,
    deviceId: string | number,
) {
    const peaks = cookies.get("demo_peaks");
    if (!peaks) {
        cookies.set(
            "demo_peaks",
            JSON.stringify([
                {
                    id: 1,
                    sensorId: "demo_sensor",
                    deviceId,
                    timestamp: new Date(timestamp),
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
        timestamp: new Date(timestamp),
    });
    cookies.set("demo_peaks", JSON.stringify(parsedPeaks));
}

export function getPeaksCookieStore(cookies: ReadonlyRequestCookies) {
    const peaks = cookies.get("demo_peaks");
    if (!peaks) {
        return [];
    }

    const data = JSON.parse(peaks.value) as PeakSelectType[];

    return data.map((d) => ({
        ...d,
        timestamp: d.timestamp ? new Date(d.timestamp) : null,
    }));
}

export function getDemoUserData() {
    const data: UserDataType = {
        mail: {
            id: 1,
            userId: -1,
            mailDaily: true,
            mailWeekly: false,
        },
        user_data: {
            id: 1,
            userId: -1,
            property: "house",
            livingSpace: 100,
            household: 2,
            hotWater: "electric",
            budget: 120,
            tariff: "basic",
            basePrice: 0.4,
            monthlyPayment: 2,
            workingPrice: 0.4,
            limitEnergy: 800,
            timestamp: new Date(),
        },
    };

    return data;
}

export function getDemoSensorData(start: Date, end: Date): SensorDataSelectType[] {
    const data: SensorDataSelectType[] = [];
    let currentDate = new Date(start);
    let idx = 1;
    const max = 100;
    const min = 70;
    while (currentDate < end) {
        const value = Math.sin((currentDate.getTime() / 150_000_00)) * (max - min) / 2 + (max + min) / 2;
        data.push({
            id: idx,
            sensorId: "demo_sensor",
            value,
            timestamp: currentDate,
        });
        currentDate = new Date(currentDate.getTime() + 60000);
        idx++;
    }

    data[Math.floor(data.length / 5)].value = 130;
    data[Math.floor(data.length / 2)].value = 120;

    return data;
}
