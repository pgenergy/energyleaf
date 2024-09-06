"use client";

import { updateUserOnboardingData } from "@/actions/user";
import { userOnboardingFormSchema } from "@/lib/schema/user";
import type { DefaultActionReturn } from "@energyleaf/lib";
import { userDataTable } from "@energyleaf/postgres/schema/user";
import { userDataElectricityMeterTypeEnums } from "@energyleaf/postgres/types";
import { Button, buttonVariants } from "@energyleaf/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@energyleaf/ui/form";
import { Input } from "@energyleaf/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@energyleaf/ui/select";
import { Spinner } from "@energyleaf/ui/spinner";
import { Switch } from "@energyleaf/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleXIcon, Edit2Icon } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

interface Props {
    initialValues: z.infer<typeof userOnboardingFormSchema>;
    id: string;
    fileUrl?: string;
}

export default function UserOnboardingForm(props: Props) {
    const [editFile, setEditFile] = useState(!props.fileUrl);
    const [isPending, startTransition] = useTransition();
    const form = useForm<z.infer<typeof userOnboardingFormSchema>>({
        resolver: zodResolver(userOnboardingFormSchema),
        defaultValues: props.initialValues,
    });

    async function updateUserOnboardingDataCallback(data: z.infer<typeof userOnboardingFormSchema>, id: string) {
        let res: DefaultActionReturn = undefined;
        try {
            const formData = new FormData();
            const file = data.file;
            if (file) {
                formData.append("file", file);
            }
            res = await updateUserOnboardingData(data, id, formData);
        } catch (err) {
            throw new Error("Ein Fehler ist aufgetreten.");
        }

        if (res && !res?.success) {
            throw new Error(res?.message);
        }
    }

    function onSubmit(data: z.infer<typeof userOnboardingFormSchema>) {
        startTransition(() => {
            toast.promise(updateUserOnboardingDataCallback(data, props.id), {
                loading: "Aktualisiere Benutzer...",
                success: "Benutzer erfolgreich aktualisiert.",
                error: (err: Error) => err.message,
            });
        });
    }

    return (
        <Form {...form}>
            <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="meterNumber"
                    render={({ field }) => (
                        <FormItem className="flex flex-col gap-2">
                            <FormLabel>Zählernummer</FormLabel>
                            <FormDescription>Bitte geben Sie die Zählernummer an.</FormDescription>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="hasWifi"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded border border-border p-4">
                            <div className="flex flex-col gap-2">
                                <FormLabel>WLAN vorhanden?</FormLabel>
                                <FormDescription>
                                    Gibt an, ob WLAN in der Nähe des Zählers vorhanden ist.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch aria-readonly checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="hasPower"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded border border-border p-4">
                            <div className="flex flex-col gap-2">
                                <FormLabel>Steckdose vorhanden?</FormLabel>
                                <FormDescription>
                                    Gibt an, ob eine Steckdose in der Nähe des Zählers vorhanden ist.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch aria-readonly checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="file"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Foto vom Zähler (optional)</FormLabel>
                            {props.fileUrl ? (
                                <FormDescription>
                                    Es gibt bereits ein Foto, dieses kann Überschrieben werden
                                </FormDescription>
                            ) : null}
                            <FormControl className="flex flex-row items-center gap-4">
                                {editFile ? (
                                    <>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                field.onChange(e.target.files ? e.target.files[0] : null);
                                            }}
                                        />
                                        {props.fileUrl ? (
                                            <Button variant="destructive" onClick={() => setEditFile(false)}>
                                                <CircleXIcon className="h-4 w-4" />
                                            </Button>
                                        ) : null}
                                    </>
                                ) : (
                                    <>
                                        <a
                                            className={buttonVariants({ variant: "outline" })}
                                            href={props.fileUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            Anzeigen
                                        </a>
                                        <Button variant="outline" onClick={() => setEditFile(true)}>
                                            <Edit2Icon className="h-4 w-4" />
                                        </Button>
                                    </>
                                )}
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="meterType"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Stromzähler</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Wählen Sie ihren Stromzähler" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {userDataTable.electricityMeterType.enumValues.map((value) => (
                                        <SelectItem value={value} key={value}>
                                            {userDataElectricityMeterTypeEnums[value]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex flex-row justify-end">
                    <Button disabled={isPending} type="submit">
                        {isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
                        Speichern
                    </Button>
                </div>
            </form>
        </Form>
    );
}
