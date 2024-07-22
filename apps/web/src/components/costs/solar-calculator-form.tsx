"use client";
import SubmitButton from "@/components/auth/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@energyleaf/ui/form";
import { Input } from "@energyleaf/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface Props {
    userId: string;
    userHash: string;
    endpoint: string;
}

export default async function SolarCalculatorForm(props: Props) {
    const solarCalcSchema = z.object({
        watts: z.string(),
    });
    const [pending, startTransition] = useTransition();
    const [next24hkWh, setNext24hkWh] = useState("0");
    const [next24hPrice, setNext24hPrice] = useState("0");
    const [last30dkWh, setLast30dkWh] = useState("0");
    const [last30dPrice, setLast30dPrice] = useState("0");

    const form = useForm<z.infer<typeof solarCalcSchema>>({
        resolver: zodResolver(solarCalcSchema),
        defaultValues: {
            watts: "",
        },
    });

    const onSubmit = (data: z.infer<typeof solarCalcSchema>, event) => {
        startTransition(() => {
            fetch(props.endpoint, {
                method: "POST",
                body: JSON.stringify({
                    userId: props.userId,
                    userHash: props.userHash,
                    watts: data.watts,
                }),
            })
                .then((x) => x.json())
                .then((x) => {
                    setNext24hkWh(x.next24h.result);
                    setNext24hPrice(x.next24h.price);
                    setLast30dkWh(x.last30d.result);
                    setLast30dPrice(x.last30d.price);
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
