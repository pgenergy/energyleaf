import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";

export default function EnergyCostsChangeLastSevenDaysNationalAverage({ userData, energyData }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    Energieverbrauch: Letzte 7 Tage vs. Deutscher Durchschnitt
                </CardTitle>
            </CardHeader>
        </Card>
    );
}
