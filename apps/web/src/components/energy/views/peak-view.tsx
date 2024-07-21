import { getSession } from "@/lib/auth/auth.server";
import { getDevicesByUser } from "@/query/device";
import { getElectricitySensorIdForUser, getSensorDataSequences } from "@/query/energy";
import { Alert, AlertDescription, AlertTitle } from "@energyleaf/ui/alert";
import { Skeleton } from "@energyleaf/ui/skeleton";
import { InfoIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import PeakCard from "../ui/peak-card";

interface Props {
    startDate: Date;
    endDate: Date;
}

export default async function PeaksView(props: Props) {
    const { user } = await getSession();
    if (!user) {
        return null;
    }

    const sensorId = await getElectricitySensorIdForUser(user.id);
    if (!sensorId) {
        return null;
    }

    const devices = await getDevicesByUser(user.id);
    const sequences = await getSensorDataSequences(sensorId, {
        start: props.startDate,
        end: props.endDate,
    });
    if (!sequences || sequences.length === 0) {
        return null;
    }

    return (
        <>
            <h2 className="col-span-1 font-bold text-xl md:col-span-3">Verbrauchsauschläge</h2>
            {devices.length <= 0 ? (
                <Alert className="col-span-1 md:col-span-3">
                    <InfoIcon className="mr-2 h-4 w-4" />
                    <AlertTitle>Keine Geräte angelegt</AlertTitle>
                    <AlertDescription>
                        Sie haben bisher keine Geräte angelegt die Sie zuweisen könnten. Möchten Sie
                        Verbrauchsausschläge zuweisen, legen Sie vorher ein Gerät auf der{" "}
                        <Link href="/devices" className="text-primary underline hover:no-underline">
                            Geräte Seite
                        </Link>{" "}
                        an.
                    </AlertDescription>
                </Alert>
            ) : null}
            {sequences.map((peak) => (
                <Suspense key={peak.id} fallback={<Skeleton className="h-52 w-full" />}>
                    <PeakCard sequence={peak} />
                </Suspense>
            ))}
        </>
    );
}
