"use client";

import {Button, Form, FormControl, FormDescription, FormField, FormItem, FormLabel, Switch} from "@energyleaf/ui";
import {Loader2Icon} from "lucide-react";
import {useForm} from "react-hook-form";
import type {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {userStateSchema} from "@/lib/schema/user";
import {useTransition} from "react";
import {toast} from "sonner";
import {updateUserState} from "@/actions/user";

interface Props {
    isAdmin: boolean;
    active: boolean;
    id: number;
}

export default function UserStateForm({ isAdmin, active, id }: Props) {
    const [isPending, startTransition] = useTransition();
    const form = useForm<z.infer<typeof userStateSchema>>({
        resolver: zodResolver(userStateSchema),
        defaultValues: {
            isAdmin,
            active,
        },
    });

    function onSubmit(data: z.infer<typeof userStateSchema>) {
        startTransition(() => {
            toast.promise(updateUserState(data, id), {
                loading: "Aktualisiere Benutzer...",
                success: "Benutzer erfolgreich aktualisiert.",
                error: "Der Benutzer konnte nicht aktualisiert werden.",
            });
        });
    }

    return (
        <Form {...form}>
            <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded border border-border p-4">
                            <div className="flex flex-col gap-2">
                                <FormLabel>Aktiv</FormLabel>
                                <FormDescription>
                                    Gibt an, ob der Benutzer aktiv ist und sich einloggen kann.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch aria-readonly checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="isAdmin"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded border border-border p-4">
                            <div className="flex flex-col gap-2">
                                <FormLabel>Admin</FormLabel>
                                <FormDescription>
                                    Gibt an, ob der Benutzer ein Administrator ist.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch aria-readonly checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <div className="flex flex-row justify-end">
                    <Button disabled={isPending} type="submit">
                        {isPending ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Speichern
                    </Button>
                </div>
            </form>
        </Form>
    );
}