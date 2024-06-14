"use client";

import { exportCsvUserData } from "@/actions/user";
import { Button, Spinner } from "@energyleaf/ui";
import { useTransition } from "react";

export default function UserCsvExportButton() {
    const [pending, startTransition] = useTransition();

    function onSubmit() {
        startTransition(async () => {
            try {
                const data = await exportCsvUserData();
                const blob = new Blob([data], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                window.open(url);
            } catch (err) {}
        });
    }

    return (
        <Button onClick={onSubmit} disabled={pending}>
            {pending ? <Spinner /> : null}
            Exportieren
        </Button>
    );
}
