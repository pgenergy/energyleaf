import { getSession } from "@/lib/auth/auth.server";
import { getDevicesByPeak } from "@/query/device";
import { getEnergyDataForSensor } from "@/query/energy";
import type { SensorDataSequenceType } from "@energyleaf/db/types";
import { AggregationType } from "@energyleaf/lib";
import { Badge } from "@energyleaf/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import MiniChart from "@energyleaf/ui/charts/mini-chart";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { PeakAssignmentDialog } from "./peak-assign-button";

interface Props {
    sequence: SensorDataSequenceType;
}

export default async function PeakCard(props: Props) {
    const { user } = await getSession();
    if (!user) {
        return null;
    }

    const startDate = new Date(props.sequence.start);
    startDate.setMinutes(startDate.getMinutes() - 1);
    const endDate = new Date(props.sequence.end);
    endDate.setMinutes(endDate.getMinutes() + 1);

    const data = await getEnergyDataForSensor(startDate, endDate, props.sequence.sensorId, AggregationType.RAW);
    if (!data || data.length === 0) {
        return null;
    }
    const devices = await getDevicesByPeak(props.sequence.id);
    const isSameDay = startDate.getDate() === endDate.getDate();

    return (
        <Card className="col-span-1">
            <CardHeader>
                <div className="flex flex-row items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <CardTitle>
                            {format(props.sequence.start, "HH:mm")} - {format(props.sequence.end, "HH:mm")}
                        </CardTitle>
                        <CardDescription>
                            {isSameDay
                                ? format(props.sequence.start, "PPP", { locale: de })
                                : `${format(props.sequence.start, "dd.MM PPP", { locale: de })} - ${format(props.sequence.end, "dd.MM PPP", { locale: de })}`}
                        </CardDescription>
                    </div>
                    <div className="w-1/3">
                        <MiniChart data={data} display="value" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex flex-row items-center justify-between">
                <div className="flex flex-col items-start justify-start">
                    <p className="font-bold font-mono">{props.sequence.averagePeakPower.toFixed(2)}</p>
                    <p className="text-muted-foreground text-sm">Leistung in W</p>
                </div>
                <div className="flex flex-row flex-wrap items-center justify-center gap-2">
                    {devices.length > 0 ? (
                        devices.map((device) => (
                            <Badge variant="secondary" key={device.id}>
                                {device.name}
                            </Badge>
                        ))
                    ) : (
                        <PeakAssignmentDialog value={props.sequence} userId={user.id} />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
