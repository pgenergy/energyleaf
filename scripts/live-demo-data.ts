import { Versions } from "@energyleaf/lib/versioning";
import { db, genId } from "@energyleaf/postgres";
import { createDevices, saveDeviceSuggestionsToPeakDb } from "@energyleaf/postgres/query/device";
import { findAndMark, getSequencesBySensor } from "@energyleaf/postgres/query/peaks";
import {
    createUser,
    getUserById,
    getUserByMail,
    getUserDataByUserId,
    setUserActive,
    updateUser,
    updateUserData,
} from "@energyleaf/postgres/query/user";
import { sensorDataDayTable, sensorDataTable, sensorTable } from "@energyleaf/postgres/schema/sensor";
import { DeviceCategory, DeviceCategoryTitles, SensorType, UserDataSelectType } from "@energyleaf/postgres/types";
import { eq, max, min, sql } from "drizzle-orm";
import { Argon2id } from "oslo/password";
import { insertEnergyData } from "./insert-energy-data";
import { getLastReportForUser, saveReport } from "@energyleaf/postgres/query/report";
import {
    convertTZDate,
    DailyConsumption,
    DailyGoalProgress,
    DailyGoalStatistic,
    formatDate,
    formatNumber,
    ReportProps,
} from "@energyleaf/lib";
import { getElectricitySensorIdForUser } from "@energyleaf/postgres/query/sensor";
import { getDayEnergyForSensorInRange, getEnergySumForSensorInRange } from "@energyleaf/postgres/query/energy-get";
import type { ChartConfiguration, ChartOptions } from "chart.js";
import { renderChart } from "@energyleaf/lib/utils/chart-to-png";
import ChartDataLabels from "chartjs-plugin-datalabels";

export async function addLiveDemoData() {
    const userMail = "team@energyleaf.de";

    const existingUser = await getUserByMail(userMail);
    if (existingUser) {
        console.log("User already exists. Skipping initialization.");
        return;
    }

    const hash = await new Argon2id().hash("energyleaf");
    const userId = await createUser({
        email: userMail,
        address: "Ammerländer Heerstraße 114-118, Oldenburg",
        electricityMeterNumber: "1234567890",
        electricityMeterType: "digital",
        firstname: "Max",
        lastname: "Mustermann",
        hasPower: true,
        password: hash,
        hasWifi: true,
        participation: true,
        username: "Energyleaf-Live-Demo",
    });

    await setUserActive(userId, true, new Date());
    await updateUser(
        {
            appVersion: Versions.support,
            onboardingCompleted: true,
        },
        userId,
    );

    await updateUserData(
        {
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
        userId,
    );

    const sensorId = genId(35);
    await db.insert(sensorTable).values({
        userId,
        sensorType: SensorType.Electricity,
        clientId: "00-80-41-ae-fd-7e",
        id: sensorId,
    });

    await insertEnergyData([sensorId]);

    const { minDate, maxDate } = (
        await db
            .select({ minDate: min(sensorDataTable.timestamp), maxDate: max(sensorDataTable.timestamp) })
            .from(sensorDataTable)
            .where(eq(sensorDataTable.sensorId, sensorId))
    )[0];
    minDate?.setDate(minDate.getDate() + 2);
    const intervals = splitInto30MinIntervals(minDate || new Date(2000, 0, 1), maxDate || new Date());
    for (const interval of intervals) {
        await findAndMark({
            start: interval[0],
            end: interval[1],
            sensorId,
            type: "peak",
        });
    }

    const deviceCategories = [
        DeviceCategory.Fridge,
        DeviceCategory.Freezer,
        DeviceCategory.Microwave,
        DeviceCategory.ECar,
        DeviceCategory.CoffeeMachine,
    ];
    const devices = deviceCategories.map((category) => ({
        name: DeviceCategoryTitles[category],
        userId,
        category,
    }));
    devices.push({
        name: "E-Auto 2",
        category: DeviceCategory.ECar,
        userId,
    });
    await createDevices(devices);

    const mlCreatedDevices = [DeviceCategory.Dishwasher, DeviceCategory.WashingMachine];
    const mlSupportDevices = [
        DeviceCategory.Fridge,
        DeviceCategory.Freezer,
        DeviceCategory.Microwave,
        DeviceCategory.Dishwasher,
        DeviceCategory.WashingMachine,
    ];
    const sequences = await getSequencesBySensor(sensorId);
    const lastSequence = sequences[sequences.length - 1];
    await saveDeviceSuggestionsToPeakDb(lastSequence.id, [mlCreatedDevices[0], DeviceCategory.Fridge]);
    const secondLastSequence = sequences[sequences.length - 2];
    await saveDeviceSuggestionsToPeakDb(secondLastSequence.id, [mlCreatedDevices[1], DeviceCategory.Freezer]);
    for (let i = 0; i < sequences.length - 2; i++) {
        const randomMlSupportedDevices = mlSupportDevices
            .sort(() => Math.random() - 0.5)
            .filter(() => Math.random() > 0.5);
        if (randomMlSupportedDevices.length > 0) {
            await saveDeviceSuggestionsToPeakDb(sequences[i].id, randomMlSupportedDevices);
        }
    }

    await db.execute(sql`CALL refresh_continuous_aggregate('sensor_data_hour', NULL, NULL);`);
    await db.execute(sql`CALL refresh_continuous_aggregate('sensor_data_day', NULL, NULL);`);
    await db.execute(sql`CALL refresh_continuous_aggregate('sensor_data_week', NULL, NULL);`);
    await db.execute(sql`CALL refresh_continuous_aggregate('sensor_data_month', NULL, NULL);`);

    await addReports(userId);

    console.log("Live demo data successfully added.");
}

function splitInto30MinIntervals(startDate: Date, endDate: Date): [Date, Date][] {
    const intervals: [Date, Date][] = [];
    const currentDate = new Date(startDate);

    while (currentDate < endDate) {
        const intervalStart = new Date(currentDate);
        currentDate.setMinutes(currentDate.getMinutes() + 30);
        const intervalEnd = new Date(currentDate);

        // Ensure the interval end does not exceed the final end date
        if (intervalEnd > endDate) {
            intervals.push([intervalStart, new Date(endDate)]);
        } else {
            intervals.push([intervalStart, intervalEnd]);
        }
    }

    return intervals;
}

async function addReports(userId: string) {
    const user = await getUserById(userId);
    if (!user) {
        return;
    }

    let serverDateFrom = new Date();
    serverDateFrom.setDate(serverDateFrom.getDate() - 6);
    serverDateFrom.setHours(0, 0, 0, 0);
    let dateFrom = convertTZDate(serverDateFrom);
    let serverDateTo = new Date();
    serverDateTo.setDate(serverDateTo.getDate() - 4);
    serverDateTo.setHours(23, 59, 59, 999);
    let dateTo = convertTZDate(serverDateTo);

    let reportData = await createReportData(
        {
            appVersion: user.appVersion,
            interval: 3,
            userId: user.id,
            userName: user.username,
            email: user.email,
            receiveMails: true,
        },
        dateFrom,
        dateTo,
    );
    await saveReport(reportData, userId);

    serverDateFrom = new Date();
    serverDateFrom.setDate(serverDateFrom.getDate() - 3);
    serverDateFrom.setHours(0, 0, 0, 0);
    dateFrom = convertTZDate(serverDateFrom);
    serverDateTo = new Date();
    serverDateTo.setDate(serverDateTo.getDate() - 1);
    serverDateTo.setHours(23, 59, 59, 999);
    dateTo = convertTZDate(serverDateTo);

    reportData = await createReportData(
        {
            appVersion: user.appVersion,
            interval: 3,
            userId: user.id,
            userName: user.username,
            email: user.email,
            receiveMails: true,
        },
        dateFrom,
        dateTo,
    );
    await saveReport(reportData, userId);
}

interface UserReportData {
    userId: string;
    userName: string;
    appVersion: Versions;
    email: string;
    receiveMails: boolean;
    interval: number;
}

export async function createReportData(user: UserReportData, dateFrom: Date, dateTo: Date): Promise<ReportProps> {
    const sensor = await getElectricitySensorIdForUser(user.userId);
    if (!sensor) {
        throw new Error("No electricity sensor found for User");
    }

    const userData = await getUserDataByUserId(user.userId);
    if (!userData) {
        throw new Error("No user data found for User");
    }

    const totalEnergyConsumption = await getEnergySumForSensorInRange(dateFrom, dateTo, sensor);

    const avgEnergyConsumption = totalEnergyConsumption / user.interval;
    const workingPrice = userData.workingPrice;
    const totalEnergyCost = workingPrice ? totalEnergyConsumption * workingPrice : undefined;
    const avgEnergyCost = workingPrice ? avgEnergyConsumption * workingPrice : undefined;

    const dailyConsumption: DailyConsumption[] = await getDailyConsumption(sensor, dateFrom, user.interval);
    const bestDay = dailyConsumption.reduce((prev, current) =>
        prev.consumption < current.consumption ? prev : current,
    );
    const worstDay = dailyConsumption.reduce((prev, current) =>
        prev.consumption > current.consumption ? prev : current,
    );

    const dayStatistics: DailyGoalStatistic[] | undefined = await getDailyGoalStatistic(dailyConsumption, userData);

    const dailyConsumptionGraph: string = await renderDailyConsumptionChart(dailyConsumption);

    const lastReport = await getLastReportForUser(user.userId);

    return {
        userName: user.userName,
        dateFrom: dateFrom,
        dateTo: dateTo,
        dayEnergyStatistics: dayStatistics,
        totalEnergyConsumption: totalEnergyConsumption,
        avgEnergyConsumptionPerDay: avgEnergyConsumption,
        totalEnergyCost: totalEnergyCost,
        avgEnergyCost: avgEnergyCost,
        bestDay: bestDay,
        worstDay: worstDay,
        lastReport: lastReport ?? undefined,
        dailyTotalConsumptionGraph: dailyConsumptionGraph,
    };
}

async function getDailyConsumption(sensor: string, dateFrom: Date, interval: number): Promise<DailyConsumption[]> {
    const dates = new Array(interval).fill(null).map((_, index) => {
        const date = new Date(dateFrom);
        date.setDate(date.getDate() + index);
        return date;
    });

    const tasks: Promise<DailyConsumption>[] = dates.map(async (date) => {
        const dailyEnergy = await getDayEnergyForSensorInRange(date, date, sensor, "sum");
        const sumOfDay = dailyEnergy.length > 0 ? (dailyEnergy[0]?.consumption ?? 0) : 0;

        return {
            day: date,
            consumption: sumOfDay,
        };
    });

    return await Promise.all(tasks);
}

async function getDailyGoalStatistic(
    dailyConsumption: DailyConsumption[],
    userData: UserDataSelectType,
): Promise<DailyGoalStatistic[]> {
    const dailyGoalProgresses = await getDailyGoalProgress(dailyConsumption, userData);
    const promises = dailyGoalProgresses.map(async (day) => {
        return {
            ...day,
            image: await renderDailyStatistic(day),
        };
    });
    return await Promise.all(promises);
}

async function getDailyGoalProgress(
    dailyConsumption: DailyConsumption[],
    userData: UserDataSelectType,
): Promise<DailyGoalProgress[]> {
    return dailyConsumption.map((day) => {
        return {
            day: day.day,
            dailyConsumption: day.consumption,
            dailyGoal: userData.consumptionGoal ?? undefined,
            exceeded: userData.consumptionGoal ? day.consumption > userData.consumptionGoal : undefined,
            progress: userData.consumptionGoal ? (day.consumption / userData.consumptionGoal) * 100 : undefined,
        };
    });
}

const primaryColor = "#439869";
const onPrimaryColor = "#FFFFFF";

function renderDailyConsumptionChart(dayStatistics: DailyConsumption[]) {
    return renderChart(
        {
            type: "bar",
            data: {
                labels: dayStatistics.map((x) => formatDate(convertTZDate(x.day, "client"))),
                datasets: [
                    {
                        label: "Täglicher Verbrauch in kWh",
                        data: dayStatistics.map((x) => x.consumption),
                        fill: false,
                        backgroundColor: primaryColor,
                        tension: 0.1,
                        datalabels: {
                            color: onPrimaryColor,
                            formatter: (value) => formatNumber(value),
                        },
                    },
                ],
            },
            plugins: [ChartDataLabels],
        },
        600,
        300,
    );
}

export function renderDailyStatistic({ progress, exceeded }: DailyGoalProgress) {
    const prog = progress ?? 0;
    const remaining = prog < 100 ? 100 - prog : 0;

    const barColor = exceeded ? "#EF4444" : primaryColor;

    const cutout = 80;

    const chartOptions: ChartOptions<"doughnut"> = {
        responsive: true,
        cutout: `${cutout}%`,
        circumference: 360,
        plugins: {
            tooltip: { enabled: false },
            legend: { display: false },
        },
    };

    const chartConfiguration: ChartConfiguration<"doughnut"> = {
        type: "doughnut",
        data: {
            datasets: [
                {
                    data: [prog, remaining],
                    backgroundColor: [barColor, onPrimaryColor],
                    borderWidth: 0,
                },
            ],
        },
        options: chartOptions,
        plugins: [
            {
                id: "whiteCenter",
                beforeDatasetDraw(chart) {
                    const { ctx } = chart;
                    ctx.save();

                    const xCenter = chart.getDatasetMeta(0).data[0].x;
                    const yCenter = chart.getDatasetMeta(0).data[0].y;

                    const startAngle = 0;
                    const endAngle = 2 * Math.PI;
                    const radius = 0.6 * cutout; // a bit more than half to prevent a small gap

                    ctx.beginPath();
                    ctx.arc(xCenter, yCenter, radius, startAngle, endAngle);
                    ctx.fillStyle = "#f4f4f5";
                    ctx.fill();

                    ctx.restore();
                },
                afterDatasetsDraw(chart) {
                    const { ctx, data } = chart;
                    ctx.save();

                    const xCenter = chart.getDatasetMeta(0).data[0].x;
                    const yCenter = chart.getDatasetMeta(0).data[0].y;

                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.font = "24px Arial";
                    ctx.fillStyle = "#000";

                    // Get the percentage from the data
                    const percentage = Math.round(data.datasets[0].data[0] as number);

                    // Draw the percentage text
                    ctx.fillText(`${percentage}%`, xCenter, yCenter);

                    ctx.restore();
                },
            },
        ],
    };

    return renderChart(chartConfiguration as ChartConfiguration, 100, 100);
}
