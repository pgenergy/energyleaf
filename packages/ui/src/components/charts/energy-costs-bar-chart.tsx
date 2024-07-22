"use client";

import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@energyleaf/ui/chart";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface DailyCost {
    date: string;
    cost: string;
}

interface Props {
    data: DailyCost[];
}

const chartConfig = {
    cost: {
        label: "Kosten (€)",
        color: "hsl(var(--primary))",
    },
};

function EnergyCostsBarChart({ data }: Props) {
    const maxCost = Math.max(...data.map((d) => Number.parseFloat(d.cost)));

    return (
        <ChartContainer config={chartConfig} className="max-h-96 min-h-52 w-full">
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <ChartLegend content={<ChartLegendContent />} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <XAxis dataKey="date" label={{ value: "Datum", position: "insideBottom", offset: -5 }} />
                    <YAxis label={{ value: "Kosten (€)", angle: -90, position: "insideLeft" }} domain={[0, maxCost]} />
                    <Tooltip formatter={(value: number) => `${value.toFixed(2)} €`} labelFormatter={(label) => label} />
                    <Bar dataKey="cost" fill={chartConfig.cost.color} barSize={20} />
                </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
}

export default EnergyCostsBarChart;
