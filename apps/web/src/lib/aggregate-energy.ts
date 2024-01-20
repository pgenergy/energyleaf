import { AggregationType } from "@/types/aggregation/aggregation-type";

interface AggregateData {
    sensorId: string;
    energy: number;
    timestamp: string;
}

export function getAggregatedEnergy(data: AggregateData[], aggregationType: string | undefined = AggregationType.RAW) {
    switch (aggregationType) {
        case AggregationType.HOUR:
            return handleHourOption(data);
        case AggregationType.DAY:
            return handleDayOption(data);
        case AggregationType.MONTH:
            return handleMonthOption(data);
        case AggregationType.YEAR:
            return handleYearOption(data);
        default:
            return data;
    }
}

const handleHourOption = (data: AggregateData[]) => {
    const energyConsumptionPerHour: Map<string, AggregateData> = new Map<string, AggregateData>();

    for (const value of data) {
        const timestampParts = value.timestamp.split(" ");
        const date = `${timestampParts[1]} ${timestampParts[2]} ${timestampParts[3]}`;
        const hour = timestampParts[4].split(":")[0];

        const hourKey = `${date} ${hour}`;

        if (energyConsumptionPerHour.has(hourKey)) {
            const prevEnergy = energyConsumptionPerHour.get(hourKey)?.energy || 0;
            energyConsumptionPerHour.set(hourKey, {
                sensorId: value.sensorId,
                energy: prevEnergy + value.energy,
                timestamp: value.timestamp,
            });
        } else {
            energyConsumptionPerHour.set(hourKey, {
                sensorId: value.sensorId,
                energy: value.energy,
                timestamp: value.timestamp,
            });
        }
    }

    return Array.from(energyConsumptionPerHour.values());
};

const handleDayOption = (data: AggregateData[]) => {
    const energyConsumptionPerDay: Map<string, AggregateData> = new Map<string, AggregateData>();

    for (const value of data) {
        const timestampParts = value.timestamp.split(" ");
        const date = `${timestampParts[1]} ${timestampParts[2]} ${timestampParts[3]}`;

        if (energyConsumptionPerDay.has(date)) {
            const prevEnergy = energyConsumptionPerDay.get(date)?.energy || 0;
            energyConsumptionPerDay.set(date, {
                sensorId: value.sensorId,
                energy: prevEnergy + value.energy,
                timestamp: value.timestamp,
            });
        } else {
            energyConsumptionPerDay.set(date, {
                sensorId: value.sensorId,
                energy: value.energy,
                timestamp: value.timestamp,
            });
        }
    }

    return Array.from(energyConsumptionPerDay.values());
};

const handleMonthOption = (data: AggregateData[]) => {
    const energyConsumptionPerMonth: Map<string, AggregateData> = new Map<string, AggregateData>();

    for (const value of data) {
        const timestamp = new Date(value.timestamp);
        const year = timestamp.getFullYear();
        const month = timestamp.getMonth() + 1; // Month from 0 bis 11

        const dateKey = `${year}-${month}`;

        if (energyConsumptionPerMonth.has(dateKey)) {
            const prevEnergy = energyConsumptionPerMonth.get(dateKey)?.energy || 0;
            energyConsumptionPerMonth.set(dateKey, {
                sensorId: value.sensorId,
                energy: prevEnergy + value.energy,
                timestamp: value.timestamp,
            });
        } else {
            energyConsumptionPerMonth.set(dateKey, {
                sensorId: value.sensorId,
                energy: value.energy,
                timestamp: value.timestamp,
            });
        }
    }

    return Array.from(energyConsumptionPerMonth.values());
};

const handleYearOption = (data: AggregateData[]) => {
    const energyConsumptionPerYear: Map<number, AggregateData> = new Map<number, AggregateData>();

    for (const value of data) {
        const timestamp = new Date(value.timestamp);
        const year = timestamp.getFullYear();

        if (energyConsumptionPerYear.has(year)) {
            const prevEnergy = energyConsumptionPerYear.get(year)?.energy || 0;
            energyConsumptionPerYear.set(year, {
                sensorId: value.sensorId,
                energy: prevEnergy + value.energy,
                timestamp: value.timestamp,
            });
        } else {
            energyConsumptionPerYear.set(year, {
                sensorId: value.sensorId,
                energy: value.energy,
                timestamp: value.timestamp,
            });
        }
    }

    return Array.from(energyConsumptionPerYear.values());
};
