import { Suspense } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@energyleaf/ui";
import EnergyConsumptionCard from "@/components/dashboard/energy-consumption-card";
import {Skeleton} from "@energyleaf/ui/src/ui";

export default function ConsumptionPage({searchParams,}: {
    searchParams: { start?: string; end?: string; aggregation?: string };
}) {
    const startDateString = searchParams.start;
    const endDateString = searchParams.end;
    const aggregationType = searchParams.aggregation;
    const startDate = startDateString ? new Date(startDateString) : new Date();
    const endDate = endDateString ? new Date(endDateString) : new Date();

    return (
        <Card className="w-full">
            <Suspense fallback={<Skeleton className="h-[57rem] w-full"/>}>
                <EnergyConsumptionCard aggregationType={aggregationType} endDate={endDate} startDate={startDate}/>
            </Suspense>
        </Card>
    );
}
