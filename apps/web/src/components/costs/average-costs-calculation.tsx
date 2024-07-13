interface EnergyData {
    timestamp: string;
    value: number;
}

interface UserData {
    basePrice: number;
    workingPrice: number;
}

const formatDate = (date: Date): string => date.toISOString().split("T")[0];

export function calculateAverageCostsPerDay(energyData: EnergyData[], userData: UserData[]): number {
    const dailyCosts = computeDailyCosts(energyData, userData);

    const totalDays = Object.keys(dailyCosts).length;
    const totalCosts = Object.values(dailyCosts).reduce((sum, cost) => sum + cost, 0);

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const dailyBasePrice = userData[1].basePrice / daysInMonth;
    return totalDays === 0 ? 0 : (totalCosts + dailyBasePrice * totalDays) / totalDays;
}

export function calculateAverageCostsPerWeek(energyData: EnergyData[], userData: UserData[]): number {
    if (
        !energyData ||
        energyData.length === 0 ||
        !userData ||
        userData.length < 2 ||
        typeof userData[1].basePrice !== "number" ||
        typeof userData[1].workingPrice !== "number"
    ) {
        return 0;
    }

    const weeklyCosts: Record<string, number> = {};

    for (const { timestamp, value } of energyData) {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const weekNumber = getWeekNumber(date);
        const yearWeek = `${year}-KW${weekNumber}`;

        const cost = value * userData[1].workingPrice;
        if (!weeklyCosts[yearWeek]) {
            weeklyCosts[yearWeek] = 0;
        }

        weeklyCosts[yearWeek] += cost;
    }

    const totalWeeks = Object.keys(weeklyCosts).length;
    const totalCosts = Object.values(weeklyCosts).reduce((sum, cost) => sum + cost, 0);

    const weeklyBasePrice = userData[1].basePrice / 4;
    return totalWeeks === 0 ? 0 : (totalCosts + weeklyBasePrice * totalWeeks) / totalWeeks;
}

export function calculateAverageCostsPerMonth(energyData: EnergyData[], userData: UserData[]): number {
    if (
        !energyData ||
        energyData.length === 0 ||
        !userData ||
        userData.length < 2 ||
        typeof userData[1].basePrice !== "number" ||
        typeof userData[1].workingPrice !== "number"
    ) {
        return 0;
    }

    const monthlyCosts: Record<string, number> = {};

    for (const { timestamp, value } of energyData) {
        const date = new Date(timestamp);
        const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;

        const cost = value * userData[1].workingPrice;
        if (!monthlyCosts[monthYear]) {
            monthlyCosts[monthYear] = 0;
        }

        monthlyCosts[monthYear] += cost;
    }

    const totalMonths = Object.keys(monthlyCosts).length;
    const totalCosts = Object.values(monthlyCosts).reduce((sum, cost) => sum + cost, 0);

    return totalMonths === 0 ? 0 : (totalCosts + userData[1].basePrice * totalMonths) / totalMonths;
}

function getWeekNumber(date: Date): number {
    const tempDate = new Date(date.getFullYear(), 0, 1);
    const dayOfYear = (date.getTime() - tempDate.getTime()) / (24 * 60 * 60 * 1000) + 1;
    return Math.ceil(dayOfYear / 7);
}

export function computeDailyCosts(energyData: EnergyData[], userData: UserData[]): Record<string, number> {
    if (
        !energyData ||
        energyData.length === 0 ||
        !userData ||
        typeof userData[1].basePrice !== "number" ||
        typeof userData[1].workingPrice !== "number"
    ) {
        return {};
    }

    const dailyCosts: Record<string, number> = {};

    for (const { timestamp, value } of energyData) {
        const date = new Date(timestamp);
        const day = formatDate(date);

        const cost = value * userData[1].workingPrice;
        if (!dailyCosts[day]) {
            dailyCosts[day] = 0;
        }

        dailyCosts[day] += cost;
    }

    return dailyCosts;
}
