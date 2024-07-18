"use client";

import { calculateCosts } from "@/components/dashboard/energy-cost";
import type { SensorDataSelectType, UserDataSelectType } from "@energyleaf/db/types";
import { formatNumber } from "@energyleaf/lib";
import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@energyleaf/ui/chart";
import React from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

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

const chartConfig = {
    cost: {
        label: "Kosten (€)",
        color: "#8884d8",
    },
};

interface Props {
    energyData: EnergyData[];
    userData: UserData[];
}

const EnergyCostsBarChart = ({ energyData, userData }: Props) => {
    const data = calculateDailyCosts(energyData, userData);

    return (
        <ChartContainer config={chartConfig} className="max-h-96 min-h-52 w-full">
            <Card>
                <CardHeader>
                    <CardTitle>Tägliche Energiekosten der letzten Tage</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <ChartLegend content={<ChartLegendContent />} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="cost" fill={chartConfig.cost.color} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </ChartContainer>
    );
};

export default EnergyCostsBarChart;
