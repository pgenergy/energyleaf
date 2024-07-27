import CostPageRangeSelector from "@/components/costs/ui/cost-range-selector";
import CostDiscountView from "@/components/costs/views/discount-view";
import CostMoreDataView from "@/components/costs/views/more-data-view";
import { getSession } from "@/lib/auth/auth.server";
import { getElectricitySensorIdForUser } from "@/query/energy";
import { getUserData } from "@/query/user";
import { Alert, AlertDescription, AlertTitle } from "@energyleaf/ui/alert";
import { Skeleton } from "@energyleaf/ui/skeleton";
import { AlertCircleIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const metadata = {
    title: "Kosten | Energyleaf",
};
export const maxDuration = 120;

interface Props {
    children: React.ReactNode;
}

export default async function (props: Props) {
    const { user } = await getSession();
    if (!user) {
        redirect("/");
    }

    const userData = await getUserData(user.id);
    if (!userData?.workingPrice) {
        return (
            <Alert>
                <AlertCircleIcon className="mr-2 h-4 w-4" />
                <AlertTitle>Fehlende Daten</AlertTitle>
                <AlertDescription>
                    Damit wir Ihnen Kosten für Ihren Sensor berechnen können, benötigen wir Informationen über Ihren
                    Tarif. Diese können Sie in den{" "}
                    <Link href="/settings" className="text-primary underline hover:no-underline">
                        Einstellungen
                    </Link>{" "}
                    festlegen.
                </AlertDescription>
            </Alert>
        );
    }

    const sensorId = await getElectricitySensorIdForUser(user.id);
    if (!sensorId) {
        return (
            <Alert>
                <AlertCircleIcon className="mr-2 h-4 w-4" />
                <AlertTitle>Keine Sensordaten vorhanden</AlertTitle>
                <AlertDescription>
                    Zu dieser Zeit liegen keien Daten von Ihrem Sensor vor. Der Grund hierfür ist vermutlich, dass bei
                    Ihnen noch kein Sensor installiert wurde. Sollte es sich hierbei jedoch um einen Fehler handeln,
                    kontaktieren Sie uns bitte.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <h2 className="col-span-1 font-bold text-xl md:col-span-3">Kosten im Zeitraum</h2>
            <CostPageRangeSelector />
            {props.children}
            <CostMoreDataView />
            <Suspense fallback={<Skeleton className="col-span-1 h-[40rem] w-full md:col-span-3" />}>
                <CostDiscountView />
            </Suspense>
        </div>
    );
}
