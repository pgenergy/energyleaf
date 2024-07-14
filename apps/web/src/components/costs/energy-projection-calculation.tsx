import type { SensorDataSelectType, UserDataSelectType } from "@energyleaf/db/types";

interface EnergyData {
    id: string;
    sensorId: string;
    value: number;
    valueOut: number | null;
    valueCurrent: number | null;
    timestamp: Date;
    isPeak: boolean;
    isAnomaly: boolean;
}

interface UserData {
    id: string;
    name: string;
    workingPrice: number;
    basePrice: number;
}

export function getCalculatedTotalConsumptionCurrentMonth(data: SensorDataSelectType[]): number {
    const currentDate = new Date();

    const currentMonthConsumptions = data.filter((entry) => {
        const entryDate = new Date(entry.timestamp);
        return entryDate.getMonth() === currentDate.getMonth() && entryDate.getFullYear() === currentDate.getFullYear();
    });
    return currentMonthConsumptions.reduce((total, entry) => total + entry.value, 0);
}

export function getCalculatedTotalConsumptionCurrentWeek(data: SensorDataSelectType[]): number {
    
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay(); // 0 (Sunday) to 6 (Saturday)
    const firstDayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const firstDayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + firstDayOffset);

    const currentWeekConsumptions = data.filter((entry) => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= firstDayOfWeek && entryDate <= currentDate;
    });
    return currentWeekConsumptions.reduce((total, entry) => total + entry.value, 0);
}

export function getCalculatedTotalConsumptionCurrentDay(data: SensorDataSelectType[]): number {
    const currentDate = new Date();
    const currentDayConsumptions = data.filter((entry) => {
        const entryDate = new Date(entry.timestamp);
        return entryDate.toDateString() === currentDate.toDateString();
    });
    return currentDayConsumptions.reduce((total, entry) => total + entry.value, 0);
}

export function getPredictedCostForMonth(energyData: EnergyData[], userData: UserData[]): number {
    if (userData.length === 0 || energyData.length === 0) {
        return 0;
    }

    const today: Date = new Date();
    const firstDayOfMonth: Date = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth: Date = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const daysPassed: number = Math.floor((today.getTime() - firstDayOfMonth.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    const daysInMonth: number = lastDayOfMonth.getDate();
    const user = userData[1];

    const totalConsumptionCurrentMonth = getCalculatedTotalConsumptionCurrentMonth(energyData);

    const monthlyUsage: number = (totalConsumptionCurrentMonth / daysPassed) * daysInMonth;

    return Number.parseFloat((monthlyUsage * user.workingPrice + user.basePrice).toFixed(2));
}

export function getPredictedCostForWeek(energyData: EnergyData[], userData: UserData[]): number {
    if (userData.length === 0 || energyData.length === 0) {
        return 0;
    }

    const today: Date = new Date();
    const daysPassed: number = today.getDay() + 1;
    const user = userData[1];

    const totalConsumptionCurrentWeek = getCalculatedTotalConsumptionCurrentWeek(energyData);
    const weeklyUsage: number = (totalConsumptionCurrentWeek / daysPassed) * 7;
    
    const weekBasePrice = user.basePrice / 4
    return Number.parseFloat((weeklyUsage * user.workingPrice + weekBasePrice).toFixed(2));
}

export function getPredictedCostForDay(energyData: EnergyData[], userData: UserData[]): number {
    if (userData.length === 0 || energyData.length === 0) {
        return 0;
    }

    const user = userData[1];
    const totalConsumptionCurrentDay = getCalculatedTotalConsumptionCurrentDay(energyData);
    const currentTime = new Date();
    const hoursPassed = currentTime.getHours() + (currentTime.getMinutes() / 60);
    const projectedDailyConsumption = (totalConsumptionCurrentDay / hoursPassed) * 24;
    const daysInMonth = new Date(currentTime.getFullYear(), currentTime.getMonth() + 1, 0).getDate();
    const dailyBasePrice = user.basePrice / daysInMonth;
    const predictedCost = Number.parseFloat((projectedDailyConsumption * user.workingPrice + dailyBasePrice).toFixed(2));
    
    return predictedCost;
}


// Vergleich zu anderem Tag/Woche/Monat

function calculateComparison(current: number, previous: number) {
    const absoluteDifference = current - previous;
    const relativeDifference = (previous !== 0) ? (absoluteDifference / previous) * 100 : 0;
    return {
        absoluteDifference: Number.parseFloat(absoluteDifference.toFixed(2)),
        relativeDifference: Number.parseFloat(relativeDifference.toFixed(2))
    };
}

function getCalculatedTotalConsumptionPreviousDay(data: SensorDataSelectType[]): number {
    const previousDate = new Date();
    previousDate.setDate(previousDate.getDate() - 1);
    const previousDayConsumptions = data.filter((entry) => {
        const entryDate = new Date(entry.timestamp);
        return entryDate.toDateString() === previousDate.toDateString();
    });
    return previousDayConsumptions.reduce((total, entry) => total + entry.value, 0);
}

function getCalculatedTotalConsumptionPreviousWeek(data: SensorDataSelectType[]): number {
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay(); // 0 (Sunday) to 6 (Saturday)
    const firstDayOffset = dayOfWeek === 0 ? -13 : -6 - dayOfWeek;
    const firstDayOfPreviousWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + firstDayOffset);
    const lastDayOfPreviousWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - dayOfWeek);

    const previousWeekConsumptions = data.filter((entry) => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= firstDayOfPreviousWeek && entryDate < lastDayOfPreviousWeek;
    });
    return previousWeekConsumptions.reduce((total, entry) => total + entry.value, 0);
}

function getCalculatedTotalConsumptionPreviousMonth(data: SensorDataSelectType[]): number {
    const currentDate = new Date();
    const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const firstDayOfPreviousMonth = new Date(previousMonth.getFullYear(), previousMonth.getMonth(), 1);
    const lastDayOfPreviousMonth = new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1, 0);

    const previousMonthConsumptions = data.filter((entry) => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= firstDayOfPreviousMonth && entryDate <= lastDayOfPreviousMonth;
    });
    return previousMonthConsumptions.reduce((total, entry) => total + entry.value, 0);
}

export function getDayComparison(energyData: EnergyData[], userData: UserData[]) {
    const predictedCostToday = getPredictedCostForDay(energyData, userData);
    const totalConsumptionPreviousDay = getCalculatedTotalConsumptionPreviousDay(energyData);
    const user = userData[1];
    const previousDayCost = Number.parseFloat((totalConsumptionPreviousDay * user.workingPrice + (user.basePrice / new Date().getDate())).toFixed(2));

    return calculateComparison(predictedCostToday, previousDayCost);
}

export function getWeekComparison(energyData: EnergyData[], userData: UserData[]) {
    const predictedCostThisWeek = getPredictedCostForWeek(energyData, userData);
    const totalConsumptionPreviousWeek = getCalculatedTotalConsumptionPreviousWeek(energyData);
    const user = userData[1];
    const previousWeekCost = Number.parseFloat((totalConsumptionPreviousWeek * user.workingPrice + (user.basePrice / 4)).toFixed(2));

    return calculateComparison(predictedCostThisWeek, previousWeekCost);
}

export function getMonthComparison(energyData: EnergyData[], userData: UserData[]) {
    const predictedCostThisMonth = getPredictedCostForMonth(energyData, userData);
    const totalConsumptionPreviousMonth = getCalculatedTotalConsumptionPreviousMonth(energyData);
    const user = userData[1];
    const previousMonthCost = Number.parseFloat((totalConsumptionPreviousMonth * user.workingPrice + user.basePrice).toFixed(2));

    return calculateComparison(predictedCostThisMonth, previousMonthCost);
}
