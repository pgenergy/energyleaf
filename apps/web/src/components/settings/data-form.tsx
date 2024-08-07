"use client";

import { updateUserDataInformation } from "@/actions/profile";
import DataFormFields from "@/components/settings/data-form-fields";
import { userDataSchema } from "@/lib/schema/profile";
import type { DefaultActionReturn } from "@energyleaf/lib";
import { Button } from "@energyleaf/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { Form } from "@energyleaf/ui/form";
import { Spinner } from "@energyleaf/ui/spinner";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

interface Props {
    initialData: z.infer<typeof userDataSchema>;
    disabled?: boolean;
}

export default function UserDataForm({ initialData, disabled }: Props) {
    const [isPending, startTransition] = useTransition();
    const form = useForm<z.infer<typeof userDataSchema>>({
        resolver: zodResolver(userDataSchema),
        defaultValues: {
            ...initialData,
        },
    });

    async function updateUserDataInformationCallback(data: z.infer<typeof userDataSchema>) {
        let res: DefaultActionReturn = undefined;

        try {
            res = await updateUserDataInformation(data);
        } catch (err) {
            throw new Error("Ein Fehler ist aufgetreten.");
        }

        if (res && !res?.success) {
            throw new Error(res?.message);
        }
    }

    function onSubmit(data: z.infer<typeof userDataSchema>) {
        if (disabled) return;
        startTransition(() => {
            toast.promise(updateUserDataInformationCallback(data), {
                loading: "Speichere...",
                success: "Erfolgreich aktualisiert",
                error: "Fehler beim Aktualisieren",
            });
        });
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Benutzerdaten</CardTitle>
                <CardDescription>Ändern Sie Ihre Benutzerdaten</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form className="grid grid-cols-2 gap-4" onSubmit={form.handleSubmit(onSubmit)}>
                        <DataFormFields form={form} disabled={disabled} />
                        <div className="col-span-2 flex justify-end">
                            <Button disabled={isPending || disabled} type="submit">
                                {isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
                                Speichern
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
