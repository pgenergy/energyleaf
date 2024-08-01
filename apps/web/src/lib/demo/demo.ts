import type { SensorDataSelectType, UserDataType } from "@energyleaf/db/types";
import { AggregationType, convertTZDate } from "@energyleaf/lib";
import { differenceInDays, getWeekOfMonth, getWeekYear } from "date-fns";
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
            basePrice: 30,
            monthlyPayment: 120,
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

export function getDemoSensorData(start: Date, end: Date, agg?: AggregationType): SensorDataSelectType[] {
    const inputData = demoData as {
        id: string;
        sensorId: string;
        value: number;
        valueOut: number | null;
        valueCurrent: number | null;
        timestamp: string;
    }[];

    const current = new Date();
    const lastEntry = inputData[inputData.length - 1];
    const dayDiff = differenceInDays(current, new Date(lastEntry.timestamp));

    const fixedData = inputData.map((item, index) => {
        const dataDate = new Date(item.timestamp);
        dataDate.setDate(dataDate.getDate() + dayDiff + 1);

        return {
            id: item.id,
            sensorId: "demo_sensor",
            timestamp: dataDate,
            value: index === 0 ? 0 : item.value - inputData[index - 1].value,
            valueOut: item.valueOut
                ? index === 0
                    ? 0
                    : item.valueOut - (inputData[index - 1].valueOut as number)
                : null,
            valueCurrent: item.valueOut,
        };
    });

    const dataInRange = fixedData.filter(
        (item) => item.timestamp.getTime() >= start.getTime() && item.timestamp.getTime() <= end.getTime(),
    );

    const result: SensorDataSelectType[] = [];
    switch (agg) {
        case AggregationType.RAW:
            return dataInRange;
        case AggregationType.HOUR:
            for (let i = 0; i < dataInRange.length; i++) {
                const item = dataInRange[i];
                const index = result.findIndex(
                    (d) =>
                        convertTZDate(d.timestamp, "client").getHours() ===
                        convertTZDate(item.timestamp, "client").getHours(),
                );

                if (index === -1) {
                    result.push(item);
                } else {
                    result[index].value += item.value;
                }
            }
            return result;
        case AggregationType.DAY:
            for (let i = 0; i < dataInRange.length; i++) {
                const item = dataInRange[i];
                const index = result.findIndex(
                    (d) =>
                        convertTZDate(d.timestamp, "client").getDate() ===
                        convertTZDate(item.timestamp, "client").getDate(),
                );

                if (index === -1) {
                    result.push(item);
                } else {
                    result[index].value += item.value;
                }
            }
            return result;
        case AggregationType.WEEKDAY:
            for (let i = 0; i < dataInRange.length; i++) {
                const item = dataInRange[i];
                const index = result.findIndex(
                    (d) =>
                        convertTZDate(d.timestamp, "client").getDay() ===
                        convertTZDate(item.timestamp, "client").getDay(),
                );

                if (index === -1) {
                    result.push(item);
                } else {
                    result[index].value += item.value;
                }
            }
            return result;
        case AggregationType.WEEK:
            for (let i = 0; i < dataInRange.length; i++) {
                const item = dataInRange[i];
                const index = result.findIndex(
                    (d) =>
                        getWeekOfMonth(convertTZDate(d.timestamp, "client")) ===
                        getWeekOfMonth(convertTZDate(item.timestamp, "client")),
                );

                if (index === -1) {
                    result.push(item);
                } else {
                    result[index].value += item.value;
                }
            }
            return result;
        case AggregationType.CALENDAR_WEEK:
            for (let i = 0; i < dataInRange.length; i++) {
                const item = dataInRange[i];
                const index = result.findIndex(
                    (d) =>
                        getWeekYear(convertTZDate(d.timestamp, "client")) ===
                        getWeekYear(convertTZDate(item.timestamp, "client")),
                );

                if (index === -1) {
                    result.push(item);
                } else {
                    result[index].value += item.value;
                }
            }
            return result;
        case AggregationType.MONTH:
            for (let i = 0; i < dataInRange.length; i++) {
                const item = dataInRange[i];
                const index = result.findIndex(
                    (d) =>
                        convertTZDate(d.timestamp, "client").getMonth() ===
                        convertTZDate(item.timestamp, "client").getMonth(),
                );

                if (index === -1) {
                    result.push(item);
                } else {
                    result[index].value += item.value;
                }
            }
            return result;
        case AggregationType.YEAR:
            for (let i = 0; i < dataInRange.length; i++) {
                const item = dataInRange[i];
                const index = result.findIndex(
                    (d) =>
                        convertTZDate(d.timestamp, "client").getFullYear() ===
                        convertTZDate(item.timestamp, "client").getFullYear(),
                );

                if (index === -1) {
                    result.push(item);
                } else {
                    result[index].value += item.value;
                }
            }
            return result;
        default:
            return dataInRange;
    }
}

export function getLastEnergyEntry(): SensorDataSelectType {
    const inputData = demoData as {
        id: string;
        sensorId: string;
        value: number;
        valueOut: number | null;
        valueCurrent: number | null;
        timestamp: string;
    }[];

    const current = new Date();
    const lastEntry = inputData[inputData.length - 1];
    const dayDiff = differenceInDays(current, new Date(lastEntry.timestamp));

    const dataDate = new Date(lastEntry.timestamp);
    dataDate.setDate(dataDate.getDate() + dayDiff + 1);

    return {
        ...lastEntry,
        timestamp: dataDate,
        sensorId: "demo_sensor",
    };
}
