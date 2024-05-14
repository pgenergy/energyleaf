"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
    Button,
} from "@energyleaf/ui";
import { DateRangePicker } from "@energyleaf/ui/components/utils";
import { DownloadIcon } from "lucide-react";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";

interface Props {
    userId: string;
    userHash: string;
    endpoint: string;
}

export default function CSVExportButton({ userId, userHash, endpoint }: Props) {
    const [open, setOpen] = useState(false);
    const [range, setRange] = useState<DateRange>({
        from: new Date(0),
        to: new Date(),
    });
    const [loading, setLoading] = useState(false);

    function startDownload() {
        if (loading) return;
        setLoading(true);
        toast.promise(
            async () => {
                const res = await fetch(endpoint, {
                    method: "POST",
                    body: JSON.stringify({
                        userId,
                        userHash,
                        start: range.from?.toISOString(),
                        end: range.to?.toISOString(),
                    }),
                });

                if (!res.ok) {
                    throw new Error("Unable to contact endpoint");
                }

                if (res.headers.get("Content-Type") === "application/json") {
                    throw new Error("Invalid request");
                }

                const content = await res.blob();
                const url = window.URL.createObjectURL(content);
                window.open(url, "_blank");
            },
            {
                loading: "Export wird erstellt...",
                success: () => {
                    setLoading(false);
                    setOpen(false);
                    return "Export erstellt.";
                },
                error: () => {
                    setLoading(false);
                    return "Ein Fehler ist aufgetreten";
                },
            },
        );
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="outline">
                    <DownloadIcon className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>CSV Export</AlertDialogTitle>
                    <AlertDialogDescription>
                        Sie haben die möglichkeit ihre Daten als CSV zu exportieren. Wählen Sie hierzu den gewünschten
                        Bereich aus.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex flex-row justify-center py-4">
                    <DateRangePicker startDate={range.from as Date} endDate={range.to as Date} onChange={setRange} />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setOpen(false)} disabled={loading}>
                        Abbrechen
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={startDownload} disabled={false}>
                        Herunterladen
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
