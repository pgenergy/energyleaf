"use client";

import { useTransition } from "react";
import { updateBaseInformationPassword } from "@/actions/profile";
import { passwordSchema } from "@/lib/schema/profile";
import { PasswordsDoNotMatchError } from "@/types/errors/passwords-do-not-match-error";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import {
    Button,
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
} from "@energyleaf/ui";
import { useToast } from "@energyleaf/ui/hooks";

interface Props {
    id: string;
}

export default function ChangePasswordForm({ id }: Props) {
    const [changeIsPending, startTransition] = useTransition();
    const { toast } = useToast();
    const form = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            oldPassword: "",
            newPassword: "",
            newPasswordRepeat: "",
        },
    });

    function onSubmitPassword(data: z.infer<typeof passwordSchema>) {
        if (data.newPassword !== data.newPasswordRepeat) {
            toast({
                title: "Das neue Passwort stimmt nicht mit der Wiederholung überein",
                description: "Dein Passwort konnte nicht geändert werden",
                variant: "destructive",
            });
            return;
        }

        startTransition(async () => {
            try {
                await updateBaseInformationPassword(data, id);
                toast({
                    title: "Erfolgreich Passwort aktualisiert",
                    description: "Dein Passwort wurde erfolgreich geändert",
                });
            } catch (e) {
                if (e instanceof PasswordsDoNotMatchError) {
                    toast({
                        title: "Das aktuelle Passwort ist falsch",
                        description: "Dein Passwort konnte nicht geändert werden",
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: "Fehler beim Aktualisieren des Passworts",
                        description: "Dein Passwort konnte nicht geändert werden",
                        variant: "destructive",
                    });
                }
            }
        });
    }

    return (
        <div>
            <CardHeader>
                <CardTitle>Passwort</CardTitle>
                <CardDescription>Ändere dein Passwort</CardDescription>
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
                                        <Input placeholder="Aktuelles Passwort" type="password" {...field} />
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
                                        <Input placeholder="Neues Passwort" type="password" {...field} />
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
                                        <Input placeholder="Passwort Wiederholen" type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="col-span-2 flex flex-row justify-end">
                            <Button disabled={changeIsPending} type="submit" value="password">
                                {changeIsPending ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Speichern
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </div>
    );
}
