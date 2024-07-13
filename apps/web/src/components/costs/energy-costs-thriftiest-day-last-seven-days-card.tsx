import { findMostEconomicalDay } from "@/components/costs/thriftiest-costs-calculation";
import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { formatNumber } from "@energyleaf/lib";

export default function EnergyCostsThriftiestDayLastSevenDays({ userData, energyData }) {
    const mostEconomicalDay = findMostEconomicalDay(energyData, userData, 7);
    const formattedCost = formatNumber(mostEconomicalDay?.cost ?? 0);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('de-DE', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Sparsamster Tag in den letzten 7 Tagen</CardTitle>
            </CardHeader>
            <CardContent>
                {mostEconomicalDay ? (
                    <p className="text-center font-bold text-2xl text-primary">
                        {formatDate(mostEconomicalDay.date)} <br />
                        {formattedCost} €
                    </p>
                ) : (
                    <p>Keine Daten verfügbar.</p>
                )}
            </CardContent>
        </Card>
    );    
}
