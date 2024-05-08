"use client";

import { updateBaseInformationPassword, updateBaseInformationUsername } from "@/actions/profile";
import { passwordSchema } from "@/lib/schema/profile";
import type { DefaultActionReturn } from "@energyleaf/lib";
import { PasswordsDoNotMatchError } from "@energyleaf/lib/errors/auth";
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
    FormLabel,
    FormMessage,
    Input,
    Spinner,
} from "@energyleaf/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { track } from "@vercel/analytics";
import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

interface Props {
    disabled?: boolean;
}

export default function ChangePasswordForm({ disabled }: Props) {
    const [changeIsPending, startTransition] = useTransition();
    const form = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            oldPassword: "",
            newPassword: "",
            newPasswordRepeat: "",
        },
    });

    async function updateBaseInformationPasswordCallback(data: z.infer<typeof passwordSchema>) {
        let res: DefaultActionReturn = undefined;

        try {
            res = await updateBaseInformationPassword(data);
        } catch (err) {
            throw new Error("Ein Fehler ist aufgetreten.");
        }

        if (res && !res?.success) {
            throw new Error(res?.message);
        }
    }

    function onSubmitPassword(data: z.infer<typeof passwordSchema>) {
        if (disabled) {
            return;
        }
        if (data.newPassword !== data.newPasswordRepeat) {
            toast.error("Ihr Passwort konnte nicht geändert werden", {
                description: "Das neue Passwort stimmt nicht mit der Wiederholung überein",
            });
            return;
        }

        startTransition(() => {
            track("changePassword()");
            toast.promise(updateBaseInformationPasswordCallback(data), {
                loading: "Speichere...",
                success: "Erfolgreich aktualisiert",
                error: (err: Error) => {
                    if (err instanceof PasswordsDoNotMatchError) {
                        return "Das aktuelle Passwort ist falsch";
                    }

                    return err.message;
                },
            });
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Passwort</CardTitle>
                <CardDescription>Ändern Sie Ihr Passwort</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmitPassword)}>
                        <FormField
                            control={form.control}
                            name="oldPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Aktuelles Passwort</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Aktuelles Passwort"
                                            type="password"
                                            {...field}
                                            disabled={disabled}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Neues Passwort</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Neues Passwort"
                                            type="password"
                                            {...field}
                                            disabled={disabled}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="newPasswordRepeat"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Passwort Wiederholen</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Passwort Wiederholen"
                                            type="password"
                                            {...field}
                                            disabled={disabled}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="col-span-2 flex flex-row justify-end">
                            <Button disabled={changeIsPending || disabled} type="submit" value="password">
                                {changeIsPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
                                Speichern
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
