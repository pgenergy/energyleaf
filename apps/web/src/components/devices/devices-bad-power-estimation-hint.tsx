import { AlertCircle } from "lucide-react";

export default function DevicesBadPowerEstimationHint() {
    return (
        <div className="mb-4 flex flex-row items-center gap-3 rounded-md bg-secondary p-4 text-secondary-foreground">
            <AlertCircle className="h-10 w-10" />
            <div className="flex flex-col">
                <h3 className="font-semibold text-l">Ungenaue Leistung</h3>
                <p>
                    Die Genauigkeit der Leistungsschätzung der Geräte ist gering. Bitte weisen Sie weiteren Peaks Geräte
                    zu, damit eine genauere Schätzung möglich ist.
                </p>
            </div>
        </div>
    );
}
