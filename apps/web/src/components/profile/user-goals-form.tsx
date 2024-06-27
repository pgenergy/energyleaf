"use client";

import { updateUserGoals } from "@/actions/profile";
import UserGoalsFormFields from "@/components/profile/user-goals-form-fields";
import { userGoalSchema } from "@/lib/schema/profile";
import type { UserDataSelectType } from "@energyleaf/db/types";
import type { DefaultActionReturn } from "@energyleaf/lib";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { track } from "@vercel/analytics";
import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

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

    async function updateUserGoalsCallback(data: z.infer<typeof userGoalSchema>) {
        let res: DefaultActionReturn = undefined;

        try {
            res = await updateUserGoals(data);
        } catch (err) {
            throw new Error("Ein Fehler ist aufgetreten.");
        }

        if (res && !res?.success) {
            throw new Error(res?.message);
        }
    }

    function onSubmit(data: z.infer<typeof userGoalSchema>) {
        startTransition(() => {
            track("updateUserGoals()");
            toast.promise(updateUserGoalsCallback(data), {
                loading: "Speichere...",
                success: "Erfolgreich aktualisiert",
                error: (err: Error) => err.message,
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
                <h1 className="text-center font-bold text-2xl text-primary">
                    {(form.getValues().goalValue * (userData?.workingPrice || 0)).toFixed(2)} €
                </h1>
            </CardContent>
        </Card>
    );
}
