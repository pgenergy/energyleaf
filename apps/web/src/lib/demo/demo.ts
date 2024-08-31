import { findPeaks } from "@energyleaf/db/query";
import { getEnergyForSensorInRange, getEnergyLastEntry } from "@energyleaf/db/query";
import {
    DeviceCategory,
    type DeviceSelectType,
    type SensorDataSelectType,
    type SensorDataSequenceType,
    type SensorDeviceSequenceSelectType,
    type UserDataType,
} from "@energyleaf/db/types";
import { AggregationType, type ReportProps } from "@energyleaf/lib";
import { differenceInDays } from "date-fns";
import { type MathNumericType, type Matrix, all, create } from "mathjs";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { cookies } from "next/headers";
import { getActionSession } from "../auth/auth.action";
import "server-only";

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
            basePrice: 30,
            monthlyPayment: 120,
            workingPrice: 0.38,
            timestamp: new Date(2021, 1, 1),
            consumptionGoal: 45,
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

export function getDemoDevicesCookieStore(cookies: ReadonlyRequestCookies): DeviceSelectType[] {
    const devices = cookies.get("demo_devices");
    if (!devices) {
        return [];
    }

    const parsedDevices = (JSON.parse(devices.value) as DeviceSelectType[]).map((d) => ({
        ...d,
        created: d.created ? new Date(d.created) : null,
        timestamp: new Date(d.timestamp),
    }));
    return parsedDevices;
}

export function addOrUpdateDemoDeviceToCookieStore(cookies: ReadonlyRequestCookies, device: DeviceSelectType) {
    const devices = getDemoDevicesCookieStore(cookies);
    if (devices.some((d) => d.id === device.id)) {
        const newDevices = devices.map((d) => {
            if (d.id === device.id) {
                return device;
            }

            return d;
        });
        cookies.set("demo_devices", JSON.stringify(newDevices));
        return;
    }
    const newDevices = [...devices, device];
    cookies.set("demo_devices", JSON.stringify(newDevices));
}

export function deleteDemoDeviceFromCookieStore(cookies: ReadonlyRequestCookies, deviceId: number) {
    const devices = getDemoDevicesCookieStore(cookies);
    const newDevices = devices.filter((d) => d.id !== deviceId);
    cookies.set("demo_devices", JSON.stringify(newDevices));
}

export function getDemoDeviceCategories(cookies: ReadonlyRequestCookies): DeviceCategory[] {
    const devices = getDemoDevicesCookieStore(cookies);
    return devices.map((device) => DeviceCategory[device.category as keyof typeof DeviceCategory]);
}

export function getDemoDevicePeaksCookieStore(
    cookies: ReadonlyRequestCookies,
    sequenceId: string,
): SensorDeviceSequenceSelectType[] {
    const peaks = cookies.get("demo_peaks");
    if (!peaks) {
        return [];
    }

    const parsedPeaks = JSON.parse(peaks.value) as SensorDeviceSequenceSelectType[];
    return parsedPeaks.filter((peak) => peak.sensorDataSequenceId === sequenceId);
}

export function getDemoDevicesFromPeaksCookieStore(
    cookies: ReadonlyRequestCookies,
    sequenceId: string,
): { id: number; name: string; category: DeviceCategory }[] {
    const deviceToPeaks = getDemoDevicePeaksCookieStore(cookies, sequenceId);
    const devices = getDemoDevicesCookieStore(cookies);

    if (deviceToPeaks.length === 0) {
        return [];
    }

    const deviceIds = deviceToPeaks.map((peak) => peak.deviceId);
    return devices
        .filter((device) => deviceIds.includes(device.id))
        .map((d) => ({
            id: d.id,
            name: d.name,
            category: d.category as DeviceCategory,
        }));
}

export function assignDemoDevicesToPeaks(cookies: ReadonlyRequestCookies, sequenceId: string, devices: number[]) {
    const peaks = cookies.get("demo_peaks");
    if (!peaks) {
        const newPeaks: SensorDeviceSequenceSelectType[] = [];
        for (let i = 0; i < devices.length; i++) {
            newPeaks.push({
                deviceId: devices[i],
                sensorDataSequenceId: sequenceId,
            });
        }
        cookies.set("demo_peaks", JSON.stringify(newPeaks));
        return;
    }

    const deviceToPeaks = JSON.parse(peaks.value) as SensorDeviceSequenceSelectType[];
    const filteredDeviceToPeaks = deviceToPeaks.filter((peak) => peak.sensorDataSequenceId !== sequenceId);
    for (let i = 0; i < devices.length; i++) {
        filteredDeviceToPeaks.push({
            deviceId: devices[i],
            sensorDataSequenceId: sequenceId,
        });
    }

    cookies.set("demo_peaks", JSON.stringify(filteredDeviceToPeaks));
}

export async function updateDemoPowerEstimationForDevices(cookies: ReadonlyRequestCookies) {
    const start = new Date(0);
    const end = new Date();
    end.setDate(end.getDate() + 1);
    const data = await getDemoPeaks(start, end);

    const deviceToPeaksRaw = cookies.get("demo_peaks");
    if (!deviceToPeaksRaw) {
        return;
    }

    const rawDevices = getDemoDevicesCookieStore(cookies);
    if (rawDevices.length === 0) {
        return;
    }
    const deviceToPeaks = JSON.parse(deviceToPeaksRaw.value) as SensorDeviceSequenceSelectType[];
    const devicesWithPeaks = deviceToPeaks.map((d) => {
        const peak = data.find((p) => p.id === d.sensorDataSequenceId);
        const device = rawDevices.find((di) => di.id === d.deviceId);

        return {
            device: {
                ...device,
            },
            device_to_peak: {
                ...d,
            },
            sensor_data_sequence: {
                ...peak,
            },
        };
    });

    const devices = Array.from(new Set(devicesWithPeaks.map((device) => device.device.id))) as number[];
    const flattenPeak = devicesWithPeaks
        .filter((x) => x.device_to_peak && x.sensor_data_sequence)
        .map((device) => ({
            sequenceId: device.sensor_data_sequence?.id ?? "",
            power: device.sensor_data_sequence?.averagePeakPower ?? 0,
            device: device.device_to_peak?.deviceId ?? 0,
        }));

    const peaks = Object.values(
        flattenPeak.reduce(
            (acc, obj) => {
                if (!acc[obj.sequenceId]) {
                    acc[obj.sequenceId] = { sequence: obj.sequenceId, devices: [], power: obj.power };
                }
                acc[obj.sequenceId].devices.push(obj.device);
                return acc;
            },
            {} as { [key: string]: { sequence: string; devices: number[]; power: number } },
        ),
    );

    const math = create(all, {});

    // Extract matrices. A is a matrix of 0s and 1s, where each row corresponds to a peak and each column to a device. b is a matrix of power values for each peak.
    const A = math.matrix(
        peaks.map((dp) => {
            const row = devices.map((device) => (dp.devices.includes(device) ? 1 : 0));
            return row;
        }),
    );
    const b = math.matrix(peaks.map((dp) => [dp.power]));

    // Solve the least squares problem: (A^T A) x = A^T b
    const At = math.transpose(A);
    const AtA = math.multiply(At, A);
    const Atb = math.multiply(At, b);
    const solution = math.lusolve(AtA, Atb);

    // Extract the solution values and save them to the database
    const result = solution.toArray().map((value: MathNumericType[] | MathNumericType, index: number) => ({
        [devices[index]]: (value as MathNumericType[])[0],
    }));
    for (const deviceId of devices) {
        const device = rawDevices.find((d) => d.id === deviceId) as DeviceSelectType;
        const powerEstimationRaw = result.find((r) => r[deviceId])?.[deviceId];
        const powerEstimation = powerEstimationRaw ? Number(powerEstimationRaw) : null;
        const correctedPowerEstimation = powerEstimation && powerEstimation >= 0 ? powerEstimation : null; // power needs to be greater than 0.
        addOrUpdateDemoDeviceToCookieStore(cookies, {
            ...device,
            powerEstimation: correctedPowerEstimation,
        });
    }

    // Calculate R^2
    const residuals = math.subtract(b, math.multiply(A, solution));
    const subtraction = math.subtract(b, math.mean(b)) as Matrix;
    const SST = math.sum(math.map(subtraction, math.square));
    const SSR = math.sum(math.map(residuals, math.square));
    let rSquared: number;
    if (SST === 0) {
        rSquared = SSR === 0 ? 1 : 0;
    } else {
        rSquared = math.subtract(1, math.divide(SSR, SST)) as number;
    }

    const userData = cookies.get("demo_data");
    if (!userData) {
        return;
    }

    const parsedData = JSON.parse(userData.value) as UserDataType;
    updateUserDataCookieStore(cookies, {
        user_data: {
            ...parsedData.user_data,
            devicePowerEstimationRSquared: rSquared,
        },
    });

    return;
}

function processDemoDataDate(data: SensorDataSelectType[]): SensorDataSelectType[] {
    const current = new Date();
    const lastEntry = data[data.length - 1];
    const dayDiff = differenceInDays(current, lastEntry.timestamp);

    const processedData = data.map((item) => {
        const dataDate = new Date(item.timestamp);
        dataDate.setDate(dataDate.getDate() + dayDiff + 1);

        return {
            ...item,
            timestamp: dataDate,
        };
    });

    return processedData;
}

export async function getDemoSensorData(
    start: Date,
    end: Date,
    agg?: AggregationType,
    type: "sum" | "average" = "average",
): Promise<SensorDataSelectType[]> {
    const lastEntry = await getDemoLastEnergyEntry();
    if (!lastEntry) {
        return [];
    }
    const dayDiff = differenceInDays(new Date(), lastEntry.timestamp) + 1;
    const queryStart = new Date(start);
    queryStart.setDate(queryStart.getDate() - dayDiff);
    const queryEnd = new Date(end);
    queryEnd.setDate(queryEnd.getDate() - dayDiff);

    const data = await getEnergyForSensorInRange(queryStart, queryEnd, "demo_sensor", agg, type);
    return processDemoDataDate(data);
}

export async function getDemoPeaks(start: Date, end: Date): Promise<SensorDataSequenceType[]> {
    const data = await getDemoSensorData(start, end, AggregationType.RAW);

    const peaks = findPeaks(data, data);
    const dataWithoutPeaks = data.filter(
        (item) => !peaks.some((peak) => item.timestamp >= peak.start && item.timestamp <= peak.end),
    );
    const averageBaseLoad = dataWithoutPeaks.reduce((acc, curr) => acc + curr.value, 0) / dataWithoutPeaks.length;

    return peaks
        .filter((peak) => {
            // start is before start date and end is between start and end date
            if (
                peak.start.getTime() < start.getTime() &&
                peak.end.getTime() > start.getTime() &&
                peak.end.getTime() <= end.getTime()
            ) {
                return true;
            }

            // start is between start and end date and end is after end date
            if (
                peak.start.getTime() >= start.getTime() &&
                peak.start.getTime() <= end.getTime() &&
                peak.end.getTime() > end.getTime()
            ) {
                return true;
            }

            // start and end are between start and end date
            if (peak.start.getTime() >= start.getTime() && peak.end.getTime() <= end.getTime()) {
                return true;
            }

            // start is before and end is after
            if (peak.start.getTime() < start.getTime() && peak.end.getTime() > end.getTime()) {
                return true;
            }

            return false;
        })
        .map((peak) => ({
            id: Buffer.from(peak.start.getTime().toString()).toString("base64"),
            sensorId: "demo_sensor",
            start: peak.start,
            end: peak.end,
            averagePeakPower: peak.averagePowerIncludingBaseLoad - averageBaseLoad,
            type: "peak",
        }));
}

export async function getDemoLastEnergyEntry() {
    const inputData = await getEnergyLastEntry("demo_sensor");
    return inputData;
}

export function getDemoReportIds() {
    return ["report_1"];
}

export function getDemoMetaDataOfReports() {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - 3);
    dateFrom.setHours(0, 0, 0);
    const dateTo = new Date();
    dateTo.setDate(dateTo.getDate() - 1);
    dateTo.setHours(23, 59, 59);
    return [
        {
            id: "report_1",
            dateFrom: new Date(dateFrom),
            dateTo: new Date(dateTo),
        },
    ];
}

export async function getDemoReport(): Promise<ReportProps> {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - 4);
    dateFrom.setHours(0, 0, 0);
    const dateTo = new Date();
    dateTo.setDate(dateTo.getDate() - 1);
    dateTo.setHours(23, 59, 59);

    const userData = getDemoUserData();

    const data = await getDemoSensorData(dateFrom, dateTo, AggregationType.DAY);
    const totalEnergyConsumption = data.reduce((acc, curr) => acc + curr.value, 0);
    const avgEnergyConsumptionPerDay = totalEnergyConsumption / data.length;
    let totalEnergyCost: number | undefined = undefined;
    const worstDay = data.reduce(
        (acc, curr) => {
            if (!acc || curr.value < acc.value) {
                return curr;
            }

            return acc;
        },
        null as SensorDataSelectType | null,
    ) as SensorDataSelectType;
    const bestDay = data.reduce(
        (acc, curr) => {
            if (!acc || curr.value > acc.value) {
                return curr;
            }
            return acc;
        },
        null as SensorDataSelectType | null,
    ) as SensorDataSelectType;
    if (userData.user_data.workingPrice) {
        totalEnergyCost = totalEnergyConsumption * userData.user_data.workingPrice;
    }

    return {
        userName: "demo",
        dateFrom: new Date(dateFrom),
        dateTo: new Date(dateTo),
        totalEnergyConsumption,
        totalEnergyCost,
        avgEnergyConsumptionPerDay,
        bestDay: {
            day: bestDay.timestamp,
            consumption: bestDay.value,
        },
        worstDay: {
            day: worstDay.timestamp,
            consumption: worstDay.value,
        },
    };
}
