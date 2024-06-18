"use client";

import { Button, Spinner } from "@energyleaf/ui";
import { useTransition } from "react";
import { toast } from "sonner";

export default function UserCsvExportButton() {
    const [pending, startTransition] = useTransition();

    function onSubmit() {
        startTransition(() => {
            toast.promise(
                async () => {
                    let res: Response;
                    try {
                        res = await fetch("/api/v1/csv_experiment", {
                            credentials: "include",
                            method: "GET",
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

                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);
                    window.open(url, "_blank");
                },
                {
                    loading: "Export wird erstellt...",
                    success: "Export erstellt.",
                    error: (err: Error) => err.message,
                },
            );
        });
    }

    return (
        <Button onClick={onSubmit} disabled={pending}>
            {pending ? <Spinner /> : null}
            Exportieren
        </Button>
    );
}
