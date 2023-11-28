"use client";

import { useState } from "react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@energyleaf/ui";
import { LineChart } from "@energyleaf/ui/components";
//import handleDayOption from '@/components/dashboard/energy-aggregation';

import EnergyConsumptionTooltip from "./energy-consumption-tooltip";

interface Props {
    data: Record<string, string | number | undefined>[];
    peaks: Record<string, string | number | undefined>[];
}


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
};


export default function EnergyConsumptionCardChart({ data, peaks }: Props) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<Record<string, string | number | undefined>>({});

    console.log(handleHourOption(data))
    console.log(handleMonthOption(data))
    console.log(handleYearOption(data))
    return (
        <>
            <Dialog onOpenChange={setOpen} open={open}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Geräteauswahl</DialogTitle>
                        <DialogDescription>Wähle ein Gerät aus, was diesen Verbrauch verursacht hat.</DialogDescription>
                    </DialogHeader>
                    <h1 className="p-8 text-center">TODO</h1>
                    <p>Verbrauch: {value.energy}</p>
                </DialogContent>
            </Dialog>
            <LineChart
                data={handleYearOption(data)}
                //data={data}
                keyName="energy"
                referencePoints={{
                    data: peaks,
                    xKeyName: "timestamp",
                    yKeyName: "energy",
                    callback: (callbackData) => {
                        setValue(callbackData);
                        setOpen(true);
                    },
                }}
                tooltip={{
                    content: EnergyConsumptionTooltip,
                }}
                xAxes={{ dataKey: "timestamp" }}
                yAxes={{ dataKey: "energy", name: "Energieverbauch in Wh" }}
            />
        </>
    );
}
