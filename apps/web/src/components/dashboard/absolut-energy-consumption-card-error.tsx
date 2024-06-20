import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { TryAgainErrorHint } from "@energyleaf/ui/error";
import type { FallbackProps } from "react-error-boundary";

export default function AbsolutEnergyConsumptionError({ resetErrorBoundary }: FallbackProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Absoluter Energieverbrauch</CardTitle>
            </CardHeader>
            <CardContent>
                <TryAgainErrorHint resetErrorBoundary={resetErrorBoundary} />
            </CardContent>
        </Card>
    );
}
