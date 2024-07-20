import { getSession } from "@/lib/auth/auth.server";
import { getElectricitySensorIdForUser, getSensorDataSequences } from "@/query/energy";
import { Skeleton } from "@energyleaf/ui/skeleton";
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
            {sequences.map((peak) => (
                <Suspense key={peak.id} fallback={<Skeleton className="h-52 w-full" />}>
                    <PeakCard sequence={peak} />
                </Suspense>
            ))}
        </>
    );
}
