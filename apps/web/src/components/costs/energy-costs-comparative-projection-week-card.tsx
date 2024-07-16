"use client"
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { getWeekComparison } from "@/components/costs/energy-projection-calculation";
import InfoDialog from "@/components/costs/InfoDialogComponent";

export default function EnergyCostsComparativeProjectionWeek({ userData, energyData }) {
    const predictedCost = getWeekComparison(energyData, userData);
    const color = predictedCost.absoluteDifference <= 0 ? "text-red-500" : "text-green-500";

    return (
        <Card style={{ position: 'relative' }}>
            <CardHeader>
                <CardTitle>Unterschied zu letzter Woche</CardTitle>
                <div 
                    style={{ position: 'absolute', top: '10px', right: '10px' }}
                >
                    <InfoDialog
                        description="Die Berechnung erfolgt basierend auf dem Stromverbrauch der aktuellen und letzten Woche in Euro und Prozent, wobei die Kosten für den Basispreis und den Arbeitspreis pro kWh berücksichtigt werden."
                    />
                </div>
            </CardHeader>
            <CardContent>
                {predictedCost ? (
                    <p className={`text-center font-bold text-2xl ${color}`}>
                        {predictedCost.absoluteDifference} €
                        <br />
                        {predictedCost.relativeDifference} %
                    </p>
                ) : (
                    <p>Keine Daten verfügbar.</p>
                )}
            </CardContent>
        </Card>
    );
}
