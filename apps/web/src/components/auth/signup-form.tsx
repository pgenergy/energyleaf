"use client";

import { createAccount } from "@/actions/auth";
import SubmitButton from "@/components/auth/submit-button";
import { signupSchema } from "@/lib/schema/auth";
import { userData } from "@energyleaf/db/schema";
import { userDataElectricityMeterTypeEnums } from "@energyleaf/db/types";
import type { DefaultActionReturn } from "@energyleaf/lib";
import { buttonVariants } from "@energyleaf/ui/button";
import { Checkbox } from "@energyleaf/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@energyleaf/ui/form";
import { Input } from "@energyleaf/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@energyleaf/ui/select";
import { Switch } from "@energyleaf/ui/switch";
import { Textarea } from "@energyleaf/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

export default function SignUpForm() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string>("");
    const form = useForm<z.infer<typeof signupSchema>>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            firstname: "",
            lastname: "",
            mail: "",
            address: "",
            comment: "",
            hasWifi: false,
            hasPower: false,
            password: "",
            passwordRepeat: "",
            username: "",
            file: new File([], ""),
            tos: false,
        },
    });

    async function createAccountCallback(data: z.infer<typeof signupSchema>) {
        let res: DefaultActionReturn = undefined;
        try {
            const form = new FormData();
            const keys = Object.keys(data);
            for (const key of keys) {
                const value = data[key];
                if (typeof value === "boolean") {
                    form.append(key, (value as boolean) ? "true" : "false");
                } else {
                    form.append(key, value);
                }
            }
            res = await createAccount(form);
        } catch (err) {
            throw new Error("Ein Fehler ist aufgetreten.");
        }

        if (res && !res?.success) {
            throw new Error(res.message);
        }
    }

    function onSubmit(data: z.infer<typeof signupSchema>) {
        setError("");

        startTransition(() => {
            toast.promise(createAccountCallback(data), {
                loading: "Erstelle Konto...",
                success: "Konto erfolgreich erstellt",
                error: (err: Error) => {
                    setError(err.message);
                    return err.message;
                },
            });
        });
    }

    return (
        <div className="flex flex-col gap-2">
            <p className="font-bold text-xl">Abenteuer beginnt hier!</p>
            <p className="mb-2 text-muted-foreground">Verständnis über den eigenen Energieverbrauch aufbauen.</p>
            <Form {...form}>
                <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
                    {/* Personal Info */}
                    <FormField
                        control={form.control}
                        name="firstname"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Vorname</FormLabel>
                                <FormControl>
                                    <Input placeholder="Vorname" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="lastname"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nachname</FormLabel>
                                <FormControl>
                                    <Input placeholder="Nachname" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Benutzername</FormLabel>
                                <FormControl>
                                    <Input placeholder="Benutzername" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="mail"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>E-Mail</FormLabel>
                                <FormControl>
                                    <Input placeholder="E-Mail" type="email" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Telefonnummer (optional)</FormLabel>
                                <FormControl>
                                    <Input type="tel" placeholder="Telefonnr." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Adresse</FormLabel>
                                <FormControl>
                                    <Input placeholder="Adresse" {...field} />
                                </FormControl>
                                <FormDescription>
                                    Wir benötigen Ihre Adressei, um den Sensor am Stromzähler zu installieren.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Installation Info */}
                    <div className="pb-4" />
                    <FormField
                        control={form.control}
                        name="electricityMeterType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Stromzähler</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Wählen Sie ihren Stromzähler" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {userData.electricityMeterType.enumValues.map((value) => (
                                            <SelectItem value={value} key={value}>
                                                {userDataElectricityMeterTypeEnums[value]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="file"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Foto von Ihrem Stromzähler (optional)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        capture={true}
                                        onChange={(e) => {
                                            field.onChange(e.target.files ? e.target.files[0] : null);
                                        }}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Sie haben die Möglichkeit ein Foto von Ihrem Stromzähler anzuhängen, dies
                                    erleichtert uns die Installation ihres Sensors
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="hasWifi"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex flex-row items-center justify-between">
                                    <FormLabel>WLAN vorhanden?</FormLabel>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </div>
                                <FormDescription>
                                    Ist eine stabile WLAN-Verbindung an ihrem Stromzähler vorhanden?
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="hasPower"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex flex-row items-center justify-between">
                                    <FormLabel>Steckdose vorhanden?</FormLabel>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </div>
                                <FormDescription>
                                    Befindet sich in der Nähe ihres Stromzählers eine Steckdose,? Sollte dies nicht der
                                    Fall sein, erhalten sie von uns einen Akku, um den Sensor damit zu betreiben.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="comment"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Zusätzliche Informationen (optional)</FormLabel>
                                <FormControl>
                                    <Textarea {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Password */}
                    <div className="pb-4" />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Passwort</FormLabel>
                                <FormControl>
                                    <Input placeholder="Passwort" type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="passwordRepeat"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password wiederholen</FormLabel>
                                <FormControl>
                                    <Input placeholder="Passwort wiederholen" type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="pb-b" />
                    <FormField
                        control={form.control}
                        name="tos"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center gap-2 p-4">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <div className="leading-none">
                                    <FormLabel className="text-sm">
                                        Ich habe die{" "}
                                        <Link
                                            className={buttonVariants({ variant: "link" })}
                                            href="/privacy"
                                            target="_blank"
                                        >
                                            Datenschutzrichtlinien
                                        </Link>{" "}
                                        gelesen und akzeptiere diese.
                                    </FormLabel>
                                </div>
                            </FormItem>
                        )}
                    />
                    <div className="flex flex-col items-center gap-4">
                        {error !== "" ? <p className="text-destructive text-sm">{error}</p> : null}
                        <SubmitButton pending={isPending} text="Konto erstellen" />
                        <p className="text-muted-foreground text-sm">
                            Sie haben bereits ein Konto?{" "}
                            <Link className="underline hover:no-underline" href="/">
                                Anmelden
                            </Link>
                        </p>
                    </div>
                </form>
            </Form>
        </div>
    );
}
