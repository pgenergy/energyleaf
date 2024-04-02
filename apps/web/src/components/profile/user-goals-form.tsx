"use client";

import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Form, FormControl, FormDescription,
    FormField,
    FormItem,
    FormLabel, FormMessage, Input, Label, Spinner
} from "@energyleaf/ui";
import {useForm} from "react-hook-form";
import type {z} from "zod";
import {userGoalSchema} from "@/lib/schema/profile";
import {zodResolver} from "@hookform/resolvers/zod";
import React, {useTransition} from "react";
import {track} from "@vercel/analytics";
import {toast} from "sonner";
import {updateUserGoals} from "@/actions/profile";
import type {UserDataSelectType} from "@energyleaf/db/types";

interface Props {
    userData: UserDataSelectType | undefined;
}

export default function UserGoalsForm({userData}: Props) {
    const [isPending, startTransition] = useTransition();
    const form = useForm<z.infer<typeof userGoalSchema>>({
        resolver: zodResolver(userGoalSchema),
        defaultValues: {
            goalValue: userData?.consumptionGoal || presetConsumptionGoal(userData),
        },
        mode: "onChange"
    });

    function onSubmit(data: z.infer<typeof userGoalSchema>) {
        startTransition(() => {
            track("updateUserGoals()");
            toast.promise(updateUserGoals(data), {
                loading: "Speichere...",
                success: "Erfolgreich aktualisiert",
                error: "Fehler beim Aktualisieren",
            });
        });
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Ziele</CardTitle>
                <CardDescription>
                    Hier können Sie Ihre Benutzerziele anpassen.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            control={form.control}
                            name="goalValue"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Zielverbrauch (in kWh)</FormLabel>
                                    <FormDescription>
                                        Hier können Sie Ihren Zielverbrauch für einen Tag festlegen.
                                    </FormDescription>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex flex-row justify-end">
                            <Button disabled={isPending} type="submit">
                                {isPending ? <Spinner className="mr-2 h-4 w-4"/> : null}
                                Speichern
                            </Button>
                        </div>
                    </form>
                </Form>
                <Label>Budget</Label>
                <p className="text-[0.8rem] text-muted-foreground">
                    Mit dem Zielverbrauch haben Sie gemäß Ihres Strompreises folgende Kosten pro Tag.
                </p>
                <h1 className="text-center text-2xl font-bold text-primary">
                    {(form.getValues().goalValue * (userData?.workingPrice || 0)).toFixed(2)} €
                </h1>
            </CardContent>
        </Card>
    );
}

function presetConsumptionGoal(userData: UserDataSelectType | undefined) {
    if (!userData?.monthlyPayment || !userData.basePrice || !userData.workingPrice) {
        return 0;
    }

    const yearlyPayment = userData.monthlyPayment * 12;
    const variableCosts = yearlyPayment - userData.basePrice;
    const monthlyVariableCosts = variableCosts / 12;
    const consumptionGoal = monthlyVariableCosts / userData.workingPrice;
    return Math.round(consumptionGoal);
}