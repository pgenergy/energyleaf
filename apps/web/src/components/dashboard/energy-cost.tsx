import type { SensorDataSelectType, UserDataSelectType } from "@energyleaf/db/types";

interface EnergyEntry {
    id: string;
    sensorId: string | null;
    value: number;
    timestamp: Date;
}

interface EnergyEntryWithUserData {
    energyData: EnergyEntry;
    userData: UserDataSelectType | undefined;
}

export function energyDataJoinUserData(
    energyData: EnergyEntry[],
    userData: UserDataSelectType[],
): EnergyEntryWithUserData[] {
    // Map over userDataHistory and find corresponding sensorData
    return energyData.map((sensorData) => {
        const userDataEntry = userData.findLast((x) => x.timestamp.getTime() <= sensorData.timestamp.getTime());
        return {
            userData: userDataEntry,
            energyData: sensorData,
        };
    });
}

export function calculateCosts(userData: UserDataSelectType[], sensorData: SensorDataSelectType[]): number {
    const joinedData = energyDataJoinUserData(sensorData, userData);
    return joinedData.reduce((acc, cur) => {
        const consumptionInKWh = cur.energyData.value / 1000;
        return acc + consumptionInKWh * (cur.userData?.basePrice ?? 0);
    }, 0);
}

export function getCalculatedPayment(
    userDataHistory: UserDataSelectType[],
    startDate: Date,
    endDate: Date,
): string | null {
    if (userDataHistory.length === 0) {
        return null;
    }

    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();
    const startMonth = startDate.getMonth();
    const endMonth = endDate.getMonth();

    let totalAmount = 0;

    for (let year = startYear; year <= endYear; year++) {
        const monthStart = year === startYear ? startMonth : 0;
        const monthEnd = year === endYear ? endMonth : 11;

        for (let month = monthStart; month <= monthEnd; month++) {
            const firstDayOfMonth = year === startYear && month === startMonth ? startDate.getDate() : 1;
            const lastDayOfMonth =
                year === endYear && month === endMonth ? endDate.getDate() : new Date(year, month + 1, 0).getDate();
            const daysOfMonth = new Date(year, month + 1, 0).getDate();

            const monthlyPayment = getMonthlyPaymentForMonth(userDataHistory, month, year);
            const paymentPerDay = monthlyPayment / daysOfMonth;
            const pastDaysInMonth = lastDayOfMonth - firstDayOfMonth + 1;
            const paymentPerMonth = paymentPerDay * pastDaysInMonth;
            totalAmount += paymentPerMonth;
        }
    }
    return totalAmount.toFixed(2);
}

/**
 * Gets the monthly payment for a given month and year.
 * It will get the monthly payment for the last user data entry that is valid for the given month and year.
 */
function getMonthlyPaymentForMonth(userDataHistory: UserDataSelectType[], month: number, year: number): number {
    const entry = [...userDataHistory]
        .reverse()
        .find(
            (x) =>
                x.timestamp.getFullYear() < year ||
                (x.timestamp.getFullYear() === year && x.timestamp.getMonth() <= month),
        );
    return entry?.monthlyPayment ?? 0;
}

export function getCalculatedTotalConsumptionCurrentMonth(data: SensorDataSelectType[]): number {
    const currentDate = new Date();
    const currentMonthConsumptions = data.filter((entry) => {
        const entryDate = new Date(entry.timestamp);
        return entryDate.getMonth() === currentDate.getMonth() && entryDate.getFullYear() === currentDate.getFullYear();
    });
    return currentMonthConsumptions.reduce((total, entry) => total + entry.value, 0);
}

export function getPredictedCost(userData: UserDataSelectType[], energyData: SensorDataSelectType[]): number {
    if (userData.length === 0 || energyData.length === 0) {
        return 0;
    }

    const price = getLatestUserData(userData).basePrice;

    const today: Date = new Date();
    const firstDayOfMonth: Date = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth: Date = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const daysPassed: number = Math.floor((today.getTime() - firstDayOfMonth.getTime()) / (24 * 60 * 60 * 1000)) + 1;

    const totalConsumptionCurrentMonth = getCalculatedTotalConsumptionCurrentMonth(energyData);
    const monthlyUsage: number = (totalConsumptionCurrentMonth / daysPassed) * lastDayOfMonth.getDate();

    const predictedConsumption: number = monthlyUsage - totalConsumptionCurrentMonth;
    const predictedCost: number | null = price ? parseFloat((predictedConsumption * (price / 1000)).toFixed(2)) : null;

    return predictedCost ?? 0;
}

function getLatestUserData(userData: UserDataSelectType[]): UserDataSelectType {
    return userData[userData.length - 1];
}
