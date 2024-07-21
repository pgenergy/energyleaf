"use client";

import { type ChartConfig, ChartContainer } from "@energyleaf/ui/chart";
import { Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO, isValid } from 'date-fns';

const chartConfig = {
    monthly: {
        label: "Monatliche Zahlung",
        color: "hsl(var(--primary))",
    },
    energyConsumption: {
        label: "Energieverbrauch",
        color: "hsl(var(--chart-4))",
    },
} satisfies ChartConfig;

export function CostChart({ energyDataRaw, userData }) {
    const today = new Date();
    const startDate = startOfMonth(today);
    const endDate = endOfMonth(today);
    
    const energyDataMap = energyDataRaw.reduce((acc, entry) => {

        const date = format(entry.timestamp, 'yyyy-MM-dd');
        if (!acc[date]) {
            acc[date] = 0;
        }
        acc[date] += entry.value;
        return acc;
    }, {});

    const user = userData[userData.length - 1];   
    const currentTime = new Date();
    const daysInMonth = new Date(currentTime.getFullYear(), currentTime.getMonth() + 1, 0).getDate();
    const dailyBasePrice = (user?.basePrice ?? 0) / daysInMonth;

    let cumulativeEnergyConsumption = 0;
    const data = eachDayOfInterval({ start: startDate, end: endDate }).map(date => {
        const dayOfMonth = date.getDate();
        const dateFormatted = format(date, 'yyyy-MM-dd');

        if (!energyDataMap[dateFormatted]) {
            energyDataMap[dateFormatted] = 0;
        }
    
        const dailyEnergyConsumption = energyDataMap[dateFormatted];

        if (date > today) {
            const daysPassed = date.getDate();
            const dailyConsumptionRate = cumulativeEnergyConsumption / daysPassed
            cumulativeEnergyConsumption += dailyConsumptionRate;
        }

        cumulativeEnergyConsumption += (dailyEnergyConsumption * user.workingPrice + dailyBasePrice)

        const dailyCost = (user.monthlyPayment / endDate.getDate()) * dayOfMonth;
        return {
            date: format(date, 'dd.MM.yyyy'),
            Abschlagszahlung: parseFloat(dailyCost.toFixed(2)),
            Energiekosten: parseFloat(cumulativeEnergyConsumption.toFixed(2)),
        };
    });

    console.log('Generated data for CostChart:', data);
    
    return (
        <ChartContainer className="min-h-52 w-full" config={chartConfig}>
            <LineChart data={data}>
                <XAxis
                    dataKey="date"
                    type="category"
                    tickLine={false}
                    interval="preserveStartEnd"
                    axisLine={false}
                />
                <YAxis
                    tickLine={false}
                    interval="preserveStartEnd"
                    type="number"
                    label={{ value: "Kosten in €", angle: -90, position: "insideLeft", offset: 20, fontSize: 14 }}
                />
                <Line type="monotone" dataKey="Abschlagszahlung" stroke="hsl(var(--primary))" dot={false}/>
                <Line type="monotone" dataKey="Energiekosten" stroke="hsl(var(--chart-4))" dot={false}/>
                <Tooltip 
                    content={({ payload, label }) => {
                        if (payload && payload.length) {
                            return (
                                <div style={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #ccc',
                                    padding: '10px',
                                    borderRadius: '4px',
                                    boxShadow: '0px 0px 6px rgba(0,0,0,0.1)'
                                }}>
                                    <p style={{ color: 'black', margin: 0 }}>
                                        {label} {/* Hier kannst du die Farbe und Formatierung des Datums anpassen */}
                                    </p>
                                    {payload.map((entry, index) => (
                                        <p key={index} style={{ margin: 0 }}>
                                            <span style={{ color: entry.stroke }}>{entry.name }:</span> 
                                            <span style={{ color: entry.stroke, marginLeft: '5px' }}>
                                                {entry.value} € {}
                                            </span>
                                        </p>
                                    ))}
                                </div>
                            );
                        }
                        return null;
                    }} 
                />
            </LineChart>
        </ChartContainer>
    );
}
