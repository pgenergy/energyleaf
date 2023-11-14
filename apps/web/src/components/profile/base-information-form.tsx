"use client";

import { useTransition } from "react";
import { updateBaseInformationUsername } from "@/actions/profile";
import { updateBaseInformationPassword } from "@/actions/profile";
import { baseInfromationSchema } from "@/lib/schema/profile";
import { passwordSchema } from "@/lib/schema/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

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
} from "@energyleaf/ui";
import { useToast } from "@energyleaf/ui/hooks";

interface Props {
    username: string;
    email: string;
    id: string;
}

export default function BaseInformationForm({ username, email, id }: Props) {
    const [changeUsernameIsPending, startTransitionUsername] = useTransition();
    const [changePasswordIsPending, startTransitionPassword] = useTransition();
    const { toast } = useToast();
    const formUsername = useForm<z.infer<typeof baseInfromationSchema>>({
        resolver: zodResolver(baseInfromationSchema),
        defaultValues: {
            username,
            email,
        },
    });
    const formPassword = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            oldPassword: "",
            newPassword: "",
            newPasswordRepeat: "",
        },
    });

    function onSubmitUsername(data: z.infer<typeof baseInfromationSchema>) {
        startTransitionUsername(async () => {
            if (data.email !== email) {
                return;
            }
            try {
                await updateBaseInformationUsername(data, id);
                toast({
                    title: "Erfolgreich aktualisiert",
                    description: "Deine Daten wurden erfolgreich aktualisiert",
                });
            } catch (e) {
                toast({
                    title: "Fehler beim Aktualisieren",
                    description: "Deine Daten konnten nicht aktualisiert werden",
                    variant: "destructive",
                });
            }
        });
    }

    function onSubmitPassword(data: z.infer<typeof passwordSchema>) {
        if (data.newPassword !== data.newPasswordRepeat) {
            toast({
                title: "Das neue Passwort stimmt nicht mit der Wiederholung überein",
                description: "Dein Passwort konnte nicht geändert werden",
                variant: "destructive",
            });
            return;
        }

        startTransitionPassword(async () => {
            try {
                await updateBaseInformationPassword(data, id);
                toast({
                    title: "Erfolgreich Passwort aktualisiert",
                    description: "Dein Passwort wurde erfolgreich geändert",
                });
            } catch (e) {
                if (e.message === "Passwords do not match") {
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
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Meine Daten</CardTitle>
                <CardDescription>Deine persönlichen Daten</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...formUsername}>
                    <form className="grid grid-cols-2 gap-4" onSubmit={formUsername.handleSubmit(onSubmitUsername)}>
                        <FormField
                            control={formUsername.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Benutzername</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={formUsername.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>E-Mail</FormLabel>
                                    <FormControl>
                                        <Input disabled type="email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="col-span-2 flex flex-row justify-end">
                            <Button disabled={changeUsernameIsPending} type="submit" value="username">
                                {changeUsernameIsPending ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Speichern
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
            <CardHeader>
                <CardTitle>Passwort</CardTitle>
                <CardDescription>Ändere dein Passwort</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...formPassword}>
                    <form className="flex flex-col gap-4" onSubmit={formPassword.handleSubmit(onSubmitPassword)}>
                        <FormField
                            control={formPassword.control}
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
                            control={formPassword.control}
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
                            control={formPassword.control}
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
                            <Button disabled={changePasswordIsPending} type="submit" value="password">
                                {changePasswordIsPending ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Speichern
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
