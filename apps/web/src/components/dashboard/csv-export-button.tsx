"use client";

import { Button } from "@energyleaf/ui/button";
import { DownloadIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
    startDate: Date;
    endDate: Date;
    userId: string;
    userHash: string;
    endpoint: string;
}

export default function CSVExportButton(props: Props) {
    const [loading, setLoading] = useState(false);

    function startDownload() {
        if (loading) return;
        setLoading(true);
        toast.promise(
            async () => {
                let res: Response;
                try {
                    res = await fetch(props.endpoint, {
                        method: "POST",
                        body: JSON.stringify({
                            userId: props.userId,
                            userHash: props.userHash,
                            start: props.startDate.toISOString(),
                            end: props.endDate.toISOString(),
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
        <Button variant="outline" onClick={() => startDownload()}>
            <DownloadIcon className="h-4 w-4" />
            <span className="ml-2 hidden md:block">Download</span>
        </Button>
    );
}
