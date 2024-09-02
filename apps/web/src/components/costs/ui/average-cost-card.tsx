import { getSession } from "@/lib/auth/auth.server";
import { getElectricitySensorIdForUser, getEnergyDataForSensor } from "@/query/energy";
import { getUserData } from "@/query/user";
import { AggregationType, convertTZDate } from "@energyleaf/lib";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { CircleSlash2Icon } from "lucide-react";

interface Props {
    agg: "day" | "week";
}

export default async function CostAverageCard(props: Props) {
    const { user } = await getSession();
    if (!user) {
        return <NoDataCard agg={props.agg} />;
    }

    const userData = await getUserData(user.id);
    if (!userData?.workingPrice) {
        return <NoDataCard agg={props.agg} />;
    }

    const sensorId = await getElectricitySensorIdForUser(user.id);
    if (!sensorId) {
        return <NoDataCard agg={props.agg} />;
    }

    const serverStartDate = new Date();
    serverStartDate.setHours(0, 0, 0, 0);
    serverStartDate.setDate(serverStartDate.getDate() - 30);
    const serverEndDate = new Date();
    serverEndDate.setDate(serverEndDate.getDate() - 1);
    serverEndDate.setHours(23, 59, 59, 999);

    const startDate = convertTZDate(serverStartDate);
    const endDate = convertTZDate(serverEndDate);

    let aggregation = AggregationType.DAY;
    if (props.agg === "week") {
        aggregation = AggregationType.WEEK;
    }
    const data = await getEnergyDataForSensor(
        startDate.toISOString(),
        endDate.toISOString(),
        sensorId,
        aggregation,
        "sum",
    );
    if (!data || data.length === 0) {
        return null;
    }

    const workingPrice = userData.workingPrice;
    let totalBaseCost = 0;
    if (props.agg === "day" && userData.basePrice) {
        totalBaseCost = userData.basePrice / 30;
    } else if (props.agg === "week" && userData.basePrice) {
        totalBaseCost = userData.basePrice / 4;
    }

    const processedData = data
        .filter((item) => item.consumption > 0.02)
        .map((item) => ({
            ...item,
            cost: item.consumption * workingPrice + totalBaseCost,
        }));
    const average = processedData.reduce((acc, cur) => acc + cur.cost, 0) / processedData.length;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex flex-row items-center">
                    <CircleSlash2Icon className="mr-2 h-5 w-5" />
                    {props.agg === "day" ? "Kosten pro Tag" : "Kosten pro Woche"}
                </CardTitle>
                <CardDescription>Kosten basierend auf den letzten 30 Tagen</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="font-bold font-mono">{average.toFixed(2)} €</p>
            </CardContent>
        </Card>
    );
}

interface NoDataProps {
    agg: "day" | "week";
}

function NoDataCard(props: NoDataProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex flex-row items-center">
                    <CircleSlash2Icon className="mr-2 h-5 w-5" />
                    {props.agg === "day" ? "Kosten pro Tag" : "Kosten pro Woche"}
                </CardTitle>
                <CardDescription>Kosten basierend auf den letzten 30 Tagen</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-row items-center justify-center">
                <p className="text-muted-foreground">Keine Sensordaten vorhanden</p>
            </CardContent>
        </Card>
    );
}
