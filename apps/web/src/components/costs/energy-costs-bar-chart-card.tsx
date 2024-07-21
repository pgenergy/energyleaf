import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";
import EnergyCostsBarChart from "@energyleaf/ui/charts/energy-costs-bar-chart";
import { calculateCosts } from "@/components/dashboard/energy-cost";
import type { SensorDataSelectType, UserDataSelectType } from "@energyleaf/db/types";

interface EnergyData extends SensorDataSelectType {}
interface UserData extends UserDataSelectType {}

interface DailyCost {
    date: string;
    cost: string;
}

const calculateDailyCosts = (energyData: EnergyData[], userData: UserData[]): DailyCost[] => {
    const dailyDataMap = new Map<string, EnergyData[]>();

    for (const data of energyData) {
        const date = new Date(data.timestamp).toLocaleDateString();
        if (!dailyDataMap.has(date)) {
            dailyDataMap.set(date, []);
        }
        dailyDataMap.get(date)?.push(data);
    }

    const dailyCosts = Array.from(dailyDataMap.entries()).map(([date, data]) => {
        const dailyCost = calculateCosts(userData, data);
        return {
            date,
            cost: dailyCost.toFixed(2),
        };
    });

    return dailyCosts;
};

interface Props {
    energyData: EnergyData[];
    userData: UserData[];
}

const EnergyCostsBarChartCard = ({ energyData, userData }: Props) => {
    const data = calculateDailyCosts(energyData, userData);

    if (data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Tägliche Energiekosten der letzten Tage</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center font-bold text-primary text-xl">Es sind keine Daten vorhanden</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Tägliche Energiekosten der letzten Tage</CardTitle>
            </CardHeader>
            <CardContent>
                <EnergyCostsBarChart data={data} />
            </CardContent>
        </Card>
    );
};

export default EnergyCostsBarChartCard;
