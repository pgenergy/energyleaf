"use client";

import { type SolarResultProps, calculateSolar } from "@/actions/solar";
import SubmitButton from "@/components/auth/submit-button";
import type { DefaultActionReturnPayload } from "@energyleaf/lib";
import { Alert, AlertDescription, AlertTitle } from "@energyleaf/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@energyleaf/ui/form";
import { Input } from "@energyleaf/ui/input";
import { Skeleton } from "@energyleaf/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export default function SolarCalculationForm() {
    const solarCalcSchema = z.object({
        watts: z.string().min(1, "Bitte geben Sie eine Zahl ein."),
    });
    const [pending, startTransition] = useTransition();
    const [next24hkWh, setNext24hkWh] = useState("0");
    const [next24hPrice, setNext24hPrice] = useState("0");
    const [last30dkWh, setLast30dkWh] = useState("0");
    const [last30dPrice, setLast30dPrice] = useState("0");
    const [location, setLocation] = useState("");

    const defaultValues = {
        watts: "800",
    };
    const form = useForm<z.infer<typeof solarCalcSchema>>({
        resolver: zodResolver(solarCalcSchema),
        defaultValues,
    });

    // call calculateSolarCallback once when the component is mounted
    useEffect(() => {
        startTransition(() => calculateSolarCallback(defaultValues));
    }, []);

    const calculateSolarCallback = async (data: z.infer<typeof solarCalcSchema>) => {
        let res: DefaultActionReturnPayload<SolarResultProps> = undefined;

        try {
            res = await calculateSolar(Number(data.watts));
        } catch (err) {
            throw new Error("Ein Fehler ist aufgetreten.");
        }

        if (res) {
            if (res?.payload) {
                const { next24h, last30d, location } = res.payload;

                setNext24hkWh(next24h.result.toFixed(2));
                setNext24hPrice(next24h.price?.toFixed(2) ?? "");
                setLast30dkWh(last30d.result.toFixed(2));
                setLast30dPrice(last30d.price?.toFixed(2) ?? "");
                setLocation(location);
            }

            if (!res?.success) {
                throw new Error(res?.message);
            }
        }
    };

    const onSubmit = (data: z.infer<typeof solarCalcSchema>) => {
        startTransition(() => calculateSolarCallback(data));
    };

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex flex-col gap-4">
                <Form {...form}>
                    <form className="flex flex-col gap-2" onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            control={form.control}
                            name="watts"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Leistung (in Watt)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Wattzahl" type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <SubmitButton pending={pending} text={"Berechnen"} />
                    </form>
                </Form>

                {location ? (
                    <Alert>
                        <MapPin className="h-5 w-5" />
                        <AlertTitle>Adresse</AlertTitle>
                        <AlertDescription>Für {location}</AlertDescription>
                    </Alert>
                ) : (
                    ""
                )}
            </div>

            <div className="flex flex-col">
                <h6 className="font-bold text-2xl">Produzierter Strom</h6>
                <Card>
                    {pending ? (
                        <Skeleton className="h-32 w-full" />
                    ) : (
                        <>
                            <CardHeader>
                                <CardTitle className="text-xl">Nächste 24 Stunden</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center font-bold font-mono text-primary text-xl">
                                {Number(next24hkWh).toFixed(2)} kWh
                            </CardContent>
                        </>
                    )}
                </Card>
                <Card className="mt-2">
                    {pending ? (
                        <Skeleton className="h-32 w-full" />
                    ) : (
                        <>
                            <CardHeader>
                                <CardTitle className="text-xl">Letzte 30 Tage</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center font-bold font-mono text-primary text-xl">
                                {Number(last30dkWh).toFixed(2)} kWh
                            </CardContent>
                        </>
                    )}
                </Card>
            </div>
            <div className="flex flex-col">
                <h6 className="font-bold text-2xl">Kostenersparnis</h6>
                <Card>
                    {pending ? (
                        <Skeleton className="h-32 w-full" />
                    ) : (
                        <>
                            <CardHeader>
                                <CardTitle className="text-xl">Nächste 24 Stunden</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center font-bold font-mono text-primary text-xl">
                                {Number(next24hPrice).toFixed(2)} €
                            </CardContent>
                        </>
                    )}
                </Card>
                <Card className="mt-2">
                    {pending ? (
                        <Skeleton className="h-32 w-full" />
                    ) : (
                        <>
                            <CardHeader>
                                <CardTitle className="text-xl">Letzte 30 Tage</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center font-bold font-mono text-primary text-xl">
                                {Number(last30dPrice).toFixed(2)} €
                            </CardContent>
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
}
