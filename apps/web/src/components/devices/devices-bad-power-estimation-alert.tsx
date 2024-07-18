import { Alert, AlertDescription, AlertTitle } from "@energyleaf/ui/alert";
import { AlertCircleIcon } from "lucide-react";

export default function DevicesBadPowerEstimationAlert(props: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <Alert {...props}>
            <AlertCircleIcon />
            <AlertTitle>Ungenaue Leistung</AlertTitle>
            <AlertDescription>
                Die Genauigkeit der Leistungsschätzung der Geräte ist gering. Bitte weisen Sie weiteren Peaks Geräte zu,
                damit eine genauere Schätzung möglich ist.
            </AlertDescription>
        </Alert>
    );
}
