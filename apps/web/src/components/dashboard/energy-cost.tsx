import {UserDataSelectType} from "@energyleaf/db/util";

interface EnergyEntry {
    id: number;
    sensorId: string | null;
    value: number;
    timestamp: Date;
}

interface EnergyEntryWithUserData {
    energyData: EnergyEntry;
    userData: UserDataSelectType | undefined;
}

export function energyDataJoinUserData(energyData: EnergyEntry[], userData: UserDataSelectType[]): EnergyEntryWithUserData[] {
    const sortedUserDataHistory = [...userData].sort((a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0));
    const sortedSensorData = [...energyData].sort((a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0));

    // Map over userDataHistory and find corresponding sensorData
    return sortedSensorData.map(sensorData => {
        const userDataEntry = sortedUserDataHistory.findLast(userData => userData.timestamp?.getTime() <= sensorData.timestamp?.getTime());
        return {
            userData: userDataEntry,
            energyData: sensorData
        };
    });
}

export function getCalculatedPayment(
    monthlyPayment: number | null | undefined,
    startDate: Date,
    endDate: Date,
): string | null {
    if (monthlyPayment) {
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
                const paymentPerDay = monthlyPayment / daysOfMonth;
                const pastDaysInMonth = lastDayOfMonth - firstDayOfMonth + 1;
                const paymentPerMonth = paymentPerDay * pastDaysInMonth;
                totalAmount += paymentPerMonth;
            }
        }
        return totalAmount.toFixed(2);
    }
    return null;
}

export function getCalculatedTotalConsumptionCurrentMonth(data: EnergyEntry[]): number {
    const currentDate = new Date();
    const currentMonthConsumptions = data.filter((entry: EnergyEntry) => {
        const entryDate = entry.timestamp ? new Date(entry.timestamp) : null;
        return (
            entryDate &&
            entryDate.getMonth() === currentDate.getMonth() &&
            entryDate.getFullYear() === currentDate.getFullYear()
        );
    });
    const totalConsumption = currentMonthConsumptions.reduce((total, entry) => total + entry.value, 0);

    return totalConsumption;
}

export function getPredictedCost(price: number | null | undefined, energyData: EnergyEntry[]): number {
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
