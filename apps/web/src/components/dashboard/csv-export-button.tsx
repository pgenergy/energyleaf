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
} from "@energyleaf/ui/alert-dialog";
import { Button } from "@energyleaf/ui/button";
import { DateRangePicker } from "@energyleaf/ui/utils/date-range-picker";
import { DownloadIcon } from "lucide-react";
import { useState } from "react";
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
                let res: Response;
                try {
                    res = await fetch(endpoint, {
                        method: "POST",
                        body: JSON.stringify({
                            userId,
                            userHash,
                            start: range.from?.toISOString(),
                            end: range.to?.toISOString(),
                        }),
                    });
                } catch (err) {
                    throw new Error("Ein Fehler ist aufgetreten.");
                }

                if (!res.ok) {
                    throw new Error("Ein Fehler ist aufgetreten.");
                }

                if (res.headers.get("Content-Type") !== "text/csv") {
                    if (res.headers.get("Content-Type") === "application/json") {
                        const body = (await res.json()) as { error: string };
                        throw new Error(body.error);
                    }

                    throw new Error("Ein Fehler ist aufgetreten.");
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
                error: (err: Error) => {
                    setLoading(false);
                    return err.message;
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
                        Sie haben die Möglichkeit, Ihre Daten als CSV zu exportieren. Wählen Sie hierzu den gewünschten
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
