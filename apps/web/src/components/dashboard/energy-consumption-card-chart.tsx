"use client";

import type { Peak, PeakAssignment } from "@/types/consumption/peak";
import { formatISO } from "date-fns";

import type { DeviceSelectType } from "@energyleaf/db/types";
import type { AggregationType } from "@energyleaf/lib";
import { EnergyConsumptionChart, type EnergyData } from "@energyleaf/ui/components/charts";

import { EnergyPeakDeviceAssignmentDialog } from "./peaks/energy-peak-device-assignment-dialog";

interface Props {
    data: EnergyData[];
    devices: DeviceSelectType[] | null;
    peaks?: PeakAssignment[];
    aggregation?: AggregationType;
}

export default function EnergyConsumptionCardChart({ data, peaks, devices, aggregation }: Props) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<Peak | null>(null);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const clickCallback = useCallback(
        (callbackData: {
            sensorId: string;
            energy: number;
            timestamp: string | number | undefined;
            device?: number;
        }) => {
            setValue({
                sensorId: callbackData.sensorId,
                energy: Number(callbackData.energy),
                timestamp: callbackData.timestamp?.toString() || "",
                device: callbackData.device ? Number(callbackData.device) : undefined,
            });
            setOpen(true);
        },
        [],
    );

    const onClick = devices && devices.length > 0 ? clickCallback : undefined;

    const convertDateFormat = useCallback((dateStr: string) => {
        const cleanedDateStr = dateStr.replace(/\(.+\)$/, "").trim();
        const parsedDate = new Date(cleanedDateStr);
        if (!Number.isNaN(parsedDate.getTime())) {
            return formatISO(parsedDate);
        }
        return dateStr;
    }, []);

    const convertToAxesValue = useCallback(
        (peak: Peak): Record<string, string | number | undefined> => {
            const sensorData = data.find((x) => x.sensorId === peak.sensorId && x.timestamp === peak.timestamp);

            return {
                sensorId: sensorData?.sensorId ?? "",
                timestamp: sensorData?.timestamp ? convertDateFormat(sensorData.timestamp) : "",
                energy: sensorData?.energy ?? 0,
                device: peak.device,
            };
        },
        [data, convertDateFormat],
    );

    function handleZoom(left: Date, right: Date) {
        const search = new URLSearchParams();
        searchParams.forEach((v, key) => {
            search.set(key, v);
        });
        search.set("start", left.toISOString());
        search.set("end", right.toISOString());
        search.set("zoomed", "true");
        router.push(`${pathname}?${search.toString()}`, {
            scroll: false,
        });
    }

    return (
        <>
            {value && devices ? (
                <EnergyPeakDeviceAssignmentDialog devices={devices} open={open} setOpen={setOpen} value={value} />
            ) : null}
            <EnergyConsumptionChart
                aggregation={aggregation}
                data={data.map((d) => ({
                    ...d,
                    timestamp: d.timestamp ? convertDateFormat(d.timestamp) : "",
                }))}
                referencePoints={
                    peaks
                        ? {
                              data: peaks.map(convertToAxesValue),
                              xKeyName: "timestamp",
                              yKeyName: "energy",
                              callback: onClick,
                          }
                        : undefined
                }
                zoomCallback={handleZoom}
            />
        </>
    );
}
