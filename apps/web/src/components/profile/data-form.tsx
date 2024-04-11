"use client";

import React, { useTransition } from "react";
import { updateUserDataInformation } from "@/actions/profile";
import { userDataSchema } from "@/lib/schema/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import { track } from "@vercel/analytics";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { userData } from "@energyleaf/db/schema";
import { userDataHotWaterEnums, userDataPropertyEnums, userDataTariffEnums } from "@energyleaf/db/types";
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Spinner,
} from "@energyleaf/ui";
import DataFormFields from "@/components/profile/data-form-fields";

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

    function onSubmit(data: z.infer<typeof userDataSchema>) {
        if (disabled) return;
        startTransition(() => {
            track("updateUserData()");
            toast.promise(updateUserDataInformation(data), {
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
