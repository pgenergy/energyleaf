"use client";
import { type SolarResultProps, calculateSolar } from "@/actions/solar";
import SubmitButton from "@/components/auth/submit-button";
import type { DefaultActionReturnPayload } from "@energyleaf/lib";
import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@energyleaf/ui/form";
import { Input } from "@energyleaf/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type Props = {
    userId: string;
};

export default async function SolarCalculationForm(props: Props) {
    const solarCalcSchema = z.object({
        watts: z.string(),
    });
    const [pending, startTransition] = useTransition();
    const [next24hkWh, setNext24hkWh] = useState("0");
    const [next24hPrice, setNext24hPrice] = useState("0");
    const [last30dkWh, setLast30dkWh] = useState("0");
    const [last30dPrice, setLast30dPrice] = useState("0");
    const [location, setLocation] = useState("");

    const form = useForm<z.infer<typeof solarCalcSchema>>({
        resolver: zodResolver(solarCalcSchema),
        defaultValues: {
            watts: "",
        },
    });

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

    const onSubmit = (data: z.infer<typeof solarCalcSchema>, event) => {
        startTransition(() => {
            toast.promise(calculateSolarCallback(data), {
                loading: "Berechnung wird durchgeführt...",
                error: (err: Error) => err.message,
            });
        });
    };

    return (
        <>
            <Form {...form}>
                <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                        control={form.control}
                        name="watts"
                        render={({ field }) => (
                            <FormItem>
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

            {location ? <p className="p-4">Für {location}</p> : ""}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>In den nächsten 24 Stunden</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center font-bold text-2xl text-primary">
                        {Number(next24hkWh).toFixed(2)} kWh
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>In den nächsten 24 Stunden</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center font-bold text-2xl text-primary">
                        {Number(next24hPrice).toFixed(2)} €
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>In den letzten 30 Tagen</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center font-bold text-2xl text-primary">
                        {Number(last30dkWh).toFixed(2)} kWh
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>In den letzten 30 Tagen</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center font-bold text-2xl text-primary">
                        {Number(last30dPrice).toFixed(2)} €
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
