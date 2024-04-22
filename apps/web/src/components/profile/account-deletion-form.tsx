"use client";

import { signOutAction } from "@/actions/auth";
import { deleteAccount } from "@/actions/profile";
import { deleteAccountSchema } from "@/lib/schema/profile";
import { PasswordsDoNotMatchError } from "@energyleaf/lib/errors/auth";
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
    Input,
    Spinner,
} from "@energyleaf/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

interface Props {
    disabled?: boolean;
}

export default function AccountDeletionForm({ disabled }: Props) {
    const [isPending, startTransition] = useTransition();
    const [open, setOpen] = useState(false);
    const form = useForm<z.infer<typeof deleteAccountSchema>>({
        resolver: zodResolver(deleteAccountSchema),
        defaultValues: {
            password: "",
        },
    });

    function onSubmit(data: z.infer<typeof deleteAccountSchema>) {
        startTransition(() => {
            setOpen(false);
            if (disabled) {
                return;
            }
            toast.promise(
                async () => {
                    await deleteAccount(data);
                    await signOutAction();
                },
                {
                    loading: "Lösche...",
                    success: "Ihr Account wurde erfolgreich gelöscht",
                    error: (err) => {
                        if (err instanceof PasswordsDoNotMatchError) {
                            return "Bitte geben Sie das richtige Passwort an";
                        }

                        return "Ihr Account konnte nicht gelöscht werden";
                    },
                },
            );
        });
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Account löschen</CardTitle>
                <CardDescription>Hier können Sie Ihren Account löschen.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-row justify-end">
                    <Button
                        disabled={isPending || disabled}
                        onClick={() => {
                            if (disabled) {
                                return;
                            }
                            setOpen(true);
                        }}
                        type="button"
                        variant="destructive"
                    >
                        {isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
                        Account löschen
                    </Button>
                </div>
                <Dialog onOpenChange={setOpen} open={open}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Account löschen</DialogTitle>
                            <DialogDescription>
                                Bestätigen Sie, dass Sie Ihren Account löschen möchten.
                            </DialogDescription>
                        </DialogHeader>
                        <p>
                            Geben Sie zur Bestätigung Ihr Passwort an. Das wird Sie von Ihrem Account abmelden und Sie
                            werden sich nicht mehr anmelden können. Diese Aktion kann nicht rückgängig gemacht werden!
                        </p>
                        <Form {...form}>
                            <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    placeholder="Passwort"
                                                    type="password"
                                                    {...field}
                                                    disabled={disabled}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <Button
                                        disabled={isPending}
                                        onClick={() => {
                                            setOpen(false);
                                        }}
                                        type="button"
                                        variant="outline"
                                    >
                                        {isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
                                        Abbrechen
                                    </Button>
                                    <Button disabled={isPending || disabled} type="submit" variant="destructive">
                                        {isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
                                        Löschen
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
