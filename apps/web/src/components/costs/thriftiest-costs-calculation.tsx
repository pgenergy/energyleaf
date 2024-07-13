interface EnergyData {
    timestamp: string; 
    value: number;    
}

interface UserData {
    basePrice: number;
    workingPrice: number;
}

const formatDate = (date: Date): string => date.toISOString().split('T')[0];

const calculateDailyCosts = (energyData: EnergyData[], userData: UserData[]): Record<string, number> => {
    if (!energyData || energyData.length === 0 || !userData || userData.length < 2 || typeof userData[1].basePrice !== 'number' || typeof userData[1].workingPrice !== 'number') {
        return {};
    }

    const dailyCosts: Record<string, number> = {};

    energyData.forEach(({ timestamp, value }) => {
        if (typeof value !== 'number' || isNaN(value)) {
            return;
        }

        const date = new Date(timestamp);
        const day = formatDate(date);

        const cost = value * userData[1].workingPrice;
        if (!dailyCosts[day]) {
            dailyCosts[day] = 0;
        }

        dailyCosts[day] += cost;
    });

    return dailyCosts;
};

export const findMostEconomicalDay = (energyData: EnergyData[], userData: UserData[], days: number): { date: string; cost: number } | null => {
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - days);

    const filteredEnergyData = energyData.filter(({ timestamp }) => {
        const date = new Date(timestamp);
        return date >= startDate && date <= now;
    });

    const dailyCosts = calculateDailyCosts(filteredEnergyData, userData);

    if (Object.keys(dailyCosts).length === 0) {
        return null;
    }

    const sortedDates = Object.entries(dailyCosts).sort((a, b) => a[1] - b[1]);

    return { date: sortedDates[0][0], cost: sortedDates[0][1] };
};


export const findMostEconomicalDays = (energyData: EnergyData[], userData: UserData[], days: number) => {
    return findMostEconomicalDay(energyData, userData, days);
};

