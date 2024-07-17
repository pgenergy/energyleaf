"use client";

import { calculateCosts } from "@/components/dashboard/energy-cost";
import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";
import React from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface DailyCost {
    date: string;
    Kosten: string;
}

const calculateDailyCosts = (energyData: any[], userData: any): DailyCost[] => {
    const dailyDataMap = new Map<string, any[]>();

    energyData.forEach((data) => {
        const date = new Date(data.timestamp).toLocaleDateString();
        if (!dailyDataMap.has(date)) {
            dailyDataMap.set(date, []);
        }
        dailyDataMap.get(date)?.push(data);
    });

    const dailyCosts = Array.from(dailyDataMap.entries()).map(([date, data]) => {
        const dailyCost = calculateCosts(userData, data);
        return {
            date,
            Kosten: dailyCost.toFixed(2),
        };
    });

    return dailyCosts;
};

const EnergyCostsBarChart = ({ energyData, userData }: { energyData: any[]; userData: any }) => {
    const data = calculateDailyCosts(energyData, userData);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Tägliche Energiekosten der letzten 30 Tage in Euro</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="Kosten" fill="#8884d8" barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default EnergyCostsBarChart;
