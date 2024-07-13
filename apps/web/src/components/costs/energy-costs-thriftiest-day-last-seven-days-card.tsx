import { findMostEconomicalDays } from "@/components/costs/thriftiest-costs-calculation";
import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";

export default function EnergyCostsThriftiestDayLastSevenDays({ userData, energyData }) {
    const mostEconomicalDay = findMostEconomicalDays(energyData, userData, 7);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Sparsamster Tag in den letzten 7 Tagen</CardTitle>
            </CardHeader>
            <CardContent>
                {mostEconomicalDay ? (
                    <p>
                        {mostEconomicalDay.date}
                        <br />
                        {mostEconomicalDay.cost.toFixed(2)} €
                    </p>
                ) : (
                    <p>Keine Daten verfügbar.</p>
                )}
            </CardContent>
        </Card>
    );
}