import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";

export default function EnergyCostsChangeLastThirtyDaysNationalAverage({ userData, energyData }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    Energieverbrauch: Letzte 30 Tage vs. Deutscher Durchschnitt
                </CardTitle>
            </CardHeader>
        </Card>
    );
}
