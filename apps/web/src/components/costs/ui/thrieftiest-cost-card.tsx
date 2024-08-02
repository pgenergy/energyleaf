import { getSession } from "@/lib/auth/auth.server";
import { getElectricitySensorIdForUser, getEnergyDataForSensor } from "@/query/energy";
import { getUserData } from "@/query/user";
import { AggregationType, convertTZDate } from "@energyleaf/lib";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { endOfMonth, format, getWeekOfMonth, startOfMonth } from "date-fns";
import { de } from "date-fns/locale";

interface Props {
    agg: "day" | "week";
}

export default async function ThrieftiestCostCard(props: Props) {
    const { user } = await getSession();
    if (!user) {
        return null;
    }

    const userData = await getUserData(user.id);
    if (!userData?.workingPrice) {
        return <NoDataCard agg={props.agg} />;
    }

    const sensorId = await getElectricitySensorIdForUser(user.id);
    if (!sensorId) {
        return <NoDataCard agg={props.agg} />;
    }

    const serverStartDate = startOfMonth(new Date());
    serverStartDate.setHours(0, 0, 0, 0);
    const serverEndDate = endOfMonth(new Date());
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
    if (
        !data ||
        data.length <= 0 ||
        (props.agg === "day" && data.length <= 2) ||
        (props.agg === "week" && data.length <= 1)
    ) {
        return <NoDataCard agg={props.agg} />;
    }

    const workingPrice = userData.workingPrice;
    let totalBaseCost = 0;
    if (props.agg === "day" && userData.basePrice) {
        totalBaseCost = userData.basePrice / 30;
    } else if (props.agg === "week" && userData.basePrice) {
        totalBaseCost = userData.basePrice / 4;
    }

    const processedData = data.slice(0, -1).map((d) => ({
        ...d,
        cost: d.value * workingPrice + totalBaseCost,
    }));
    const cheapestValue = processedData.reduce((a, b) => (a.cost < b.cost ? a : b));

    return (
        <Card>
            <CardHeader>
                <CardTitle>{props.agg === "day" ? "Sparsamster Tag" : "Sparsamste Woche"}</CardTitle>
                <CardDescription>Basierend auf diesem Monat</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 items-center">
                <p className="font-bold font-mono">{cheapestValue.cost.toFixed(2)} €</p>
                <p className="text-muted-foreground">
                    {props.agg === "day"
                        ? format(convertTZDate(cheapestValue.timestamp, "client"), "PPP", { locale: de })
                        : `Woche ${getWeekOfMonth(convertTZDate(cheapestValue.timestamp, "client"))}`}
                </p>
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
                <CardTitle>{props.agg === "day" ? "Sparsamster Tag" : "Sparsamste Woche"}</CardTitle>
                <CardDescription>
                    Basierend auf diesem Monat. es werden keine Daten angezeigt, wenn zu wenig Zeit in diesem Monat
                    vergangen ist.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-row items-center justify-center">
                <p className="text-muted-foreground">Nicht genug Daten in diesem Monat</p>
            </CardContent>
        </Card>
    );
}
