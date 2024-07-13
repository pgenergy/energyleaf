import { computeDailyCosts } from "@/components/costs/average-costs-calculation";

interface EnergyData {
    timestamp: string;
    value: number;
}

interface UserData {
    basePrice: number;
    workingPrice: number;
}

export const findMostEconomicalDay = (
    energyData: EnergyData[],
    userData: UserData[],
    days: number,
): { date: string; cost: number } | null => {
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - days);

    const filteredEnergyData = energyData.filter(({ timestamp }) => {
        const date = new Date(timestamp);
        return date >= startDate && date <= now;
    });

    const dailyCosts = computeDailyCosts(filteredEnergyData, userData);

    if (Object.keys(dailyCosts).length === 0) {
        return null;
    }

    const sortedDates = Object.entries(dailyCosts).sort((a, b) => a[1] - b[1]);

    return { date: sortedDates[0][0], cost: sortedDates[0][1] };
};

export const findMostEconomicalDays = (energyData: EnergyData[], userData: UserData[], days: number) => {
    return findMostEconomicalDay(energyData, userData, days);
};
