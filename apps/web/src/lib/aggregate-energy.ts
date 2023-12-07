export function getAggregatedEnergy(data: Record<string, string | number | undefined>[], aggregationType: string | undefined) {

    if(aggregationType == null) {
        aggregationType = "hour"
    }

    switch (aggregationType) {
        case 'hour':
            return handleHourOption(data);
        case 'day':
            return handleDayOption(data);
        case 'month':
            return handleMonthOption(data);
        case 'year':
            return handleYearOption(data);
    }
    return data
};

const handleHourOption = (data) => {
    const energyConsumptionPerHour = [];

    for (const value in data) {
        const timestampParts = data[value].timestamp.split(' ');
        const date = timestampParts[1] + ' ' + timestampParts[2] + ' ' + timestampParts[3];
        const hour = timestampParts[4].split(':')[0];

        const hourKey = date + ' ' + hour;

        if (energyConsumptionPerHour[hourKey]) {
            energyConsumptionPerHour[hourKey].energy += data[value].energy;
        } else {
            energyConsumptionPerHour[hourKey] = {
                energy: data[value].energy,
                timestamp: data[value].timestamp
            };
        }
    }

    return Object.values(energyConsumptionPerHour);
}


const handleDayOption = (data) => {
    const energyConsumptionPerDay = [];

    for (const value in data) {
        const date = 
            data[value].timestamp.split(' ')[1] + ' ' + 
            data[value].timestamp.split(' ')[2] + ' ' + 
            data[value].timestamp.split(' ')[3];

        if (energyConsumptionPerDay[date]) {
            energyConsumptionPerDay[date].energy += data[value].energy;
        } else {
            energyConsumptionPerDay[date] = {
            energy: data[value].energy,
            timestamp: data[value].timestamp
            };
        }
    }
    return Object.values(energyConsumptionPerDay)
}


const handleMonthOption = (data) => {
    
    const energyConsumptionPerMonth = [];

    for (const value in data) {
        const timestamp = new Date(data[value].timestamp);
        const year = timestamp.getFullYear();
        const month = timestamp.getMonth() + 1; // Month from 0 bis 11

        const dateKey = `${year}-${month}`;

        if (energyConsumptionPerMonth[dateKey]) {
            energyConsumptionPerMonth[dateKey].energy += data[value].energy;
        } else {
            energyConsumptionPerMonth[dateKey] = {
                energy: data[value].energy,
                timestamp: data[value].timestamp
            };
        }
    }
    
    return Object.values(energyConsumptionPerMonth);
};


const handleYearOption = (data) => {
    const energyConsumptionPerYear: { [key: number]: { energy: number, timestamp: string } } = {};

    for (const value in data) {
        const timestamp = new Date(data[value].timestamp);
        const year = timestamp.getFullYear();

        if (energyConsumptionPerYear[year]) {
            energyConsumptionPerYear[year].energy += data[value].energy;
        } else {
            energyConsumptionPerYear[year] = {
                energy: data[value].energy,
                timestamp: data[value].timestamp
            };
        }
    }

    return Object.values(energyConsumptionPerYear);
}