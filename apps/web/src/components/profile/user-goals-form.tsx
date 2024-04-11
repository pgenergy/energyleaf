"use client";

import React, { useTransition } from "react";
import { updateUserGoals } from "@/actions/profile";
import { userGoalSchema } from "@/lib/schema/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import { track } from "@vercel/analytics";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import type { UserDataSelectType } from "@energyleaf/db/types";
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Form,
    Label,
    Spinner,
} from "@energyleaf/ui";
import UserGoalsFormFields from "@/components/profile/user-goals-form-fields";

interface Props {
    userData: UserDataSelectType | undefined;
}

export default function UserGoalsForm({ userData }: Props) {
    const [isPending, startTransition] = useTransition();
    const form = useForm<z.infer<typeof userGoalSchema>>({
        resolver: zodResolver(userGoalSchema),
        defaultValues: {
            goalValue: userData?.consumptionGoal || 0,
        },
        mode: "onChange",
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
                <CardDescription>Hier können Sie Ihre Benutzerziele anpassen.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
                        <UserGoalsFormFields form={form} />
                        <div className="flex flex-row justify-end">
                            <Button disabled={isPending} type="submit">
                                {isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
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