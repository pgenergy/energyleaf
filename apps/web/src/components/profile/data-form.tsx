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
    FormLabel, FormMessage,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Spinner,
} from "@energyleaf/ui";

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
                        <FormField
                            control={form.control}
                            name="houseType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Hausart</FormLabel>
                                    <FormControl>
                                        <Select
                                            defaultValue={field.value}
                                            disabled={disabled}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Hausart wählen" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {userData.property.enumValues.map((value) => (
                                                    <SelectItem key={value} value={value}>
                                                        {userDataPropertyEnums[value]}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="hotWater"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Warmwasser</FormLabel>
                                    <FormControl>
                                        <Select
                                            defaultValue={field.value}
                                            disabled={disabled}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Warmwasser wählen" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {userData.hotWater.enumValues.map((value) => (
                                                    <SelectItem key={value} value={value}>
                                                        {userDataHotWaterEnums[value]}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="tariff"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tarif</FormLabel>
                                    <FormControl>
                                        <Select
                                            defaultValue={field.value}
                                            disabled={disabled}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Tarif wählen" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {userData.tariff.enumValues.map((value) => (
                                                    <SelectItem key={value} value={value}>
                                                        {userDataTariffEnums[value]}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="budget"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Budget (in €)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} disabled={disabled} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="basePrice"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Strompreis (in €)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} disabled={disabled} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="livingSpace"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Wohnfläche (in m²)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} disabled={disabled} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="people"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Personen im Haushalt</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} disabled={disabled} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="monthlyPayment"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Monatlicher Abschlag (in €)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} disabled={disabled} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
