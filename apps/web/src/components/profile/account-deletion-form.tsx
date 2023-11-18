"use client";

import { useTransition } from "react";
import { deleteAccount } from "@/actions/profile";
import { deleteAccountSchema } from "@/lib/schema/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { signOutAction } from "@/actions/auth";
import { useState } from "react";
import type { z } from "zod";

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
} from "@energyleaf/ui";
import { useToast } from "@energyleaf/ui/hooks";

interface Props {
    id: string;
}

export default function AccountDeletionForm({ id }: Props) {
    const [isPending, startTransition] = useTransition();
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const form = useForm<z.infer<typeof deleteAccountSchema>>({
        resolver: zodResolver(deleteAccountSchema),
        defaultValues: {
            password: "",
        },
    });

    function onSubmit(data: z.infer<typeof deleteAccountSchema>) {
        startTransition(async () => {
            setOpen(false);
            try {
                await deleteAccount(data, id);
                toast({
                    title: "Erfolgreich gelöscht",
                    description: "Dein Account wurde erfolgreich gelöscht",
                });
                await signOutAction();
            } catch (e) {
                if (e.message === "Passwords do not match") {
                    toast({
                        title: "Das Passwort ist falsch",
                        description: "Dein Account konnte nicht gelöscht werden",
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: "Fehler beim Löschen",
                        description: "Dein Account konnte nicht gelöscht werden",
                        variant: "destructive",
                    });
                }
            }
        });
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Account löschen</CardTitle>
                <CardDescription>
                    Hier kannst du deinen Account löschen.
                </CardDescription>
            </CardHeader>
            <CardContent>

                <div className="flex flex-row justify-end">
                    <Button disabled={isPending} type="button" variant="destructive" onClick={() => { setOpen(true); }}>
                        {isPending ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Account löschen
                    </Button>
                </div>
                <Dialog onOpenChange={setOpen} open={open}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Account löschen</DialogTitle>
                            <DialogDescription>Bestätige, dass du deinen Account löschen möchtest.</DialogDescription>
                        </DialogHeader>
                        <p>Gib zur Bestätigung dein Passwort an. Das wird dich von deinem Account abmelden und du wirst dich nicht mehr anmelden können. Diese Aktion kann nicht rückgängig gemacht werden!</p>
                        <Form {...form}>
                            <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input placeholder="Passwort" type="password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <Button disabled={isPending} type="button" variant="outline" onClick={() => { setOpen(false); }}>
                                        {isPending ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Abbrechen
                                    </Button>
                                    <Button disabled={isPending} type="submit" variant="destructive">
                                        {isPending ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
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
