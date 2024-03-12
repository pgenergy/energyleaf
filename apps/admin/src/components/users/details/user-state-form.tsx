"use client";

import { useTransition } from "react";
import { updateUserState } from "@/actions/user";
import { userStateSchema } from "@/lib/schema/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import {
    Button,
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    Spinner,
    Switch,
} from "@energyleaf/ui";

interface Props {
    isAdmin: boolean;
    active: boolean;
    id: string;
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
                                <FormDescription>Gibt an, ob der Benutzer ein Administrator ist.</FormDescription>
                            </div>
                            <FormControl>
                                <Switch aria-readonly checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
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
