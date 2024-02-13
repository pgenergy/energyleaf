"use client";

import { Suspense, useTransition } from "react";
import { updateBaseInformationUsername } from "@/actions/profile";
import { baseInformationSchema } from "@/lib/schema/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import { track } from "@vercel/analytics";
import { Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
    Skeleton,
} from "@energyleaf/ui";

import ErrorBoundary from "../error/error-boundary";
import ChangePasswordForm from "./change-password-form";
import ChangePasswordError from "./change-password-form-error";

interface Props {
    username: string;
    email: string;
    id: string;
}

export default function BaseInformationForm({ username, email, id }: Props) {
    const [changeIsPending, startTransition] = useTransition();
    const form = useForm<z.infer<typeof baseInformationSchema>>({
        resolver: zodResolver(baseInformationSchema),
        defaultValues: {
            username,
            email,
        },
    });

    function onSubmit(data: z.infer<typeof baseInformationSchema>) {
        startTransition(() => {
            track("updateBaseInformation()");
            if (data.email !== email) {
                return;
            }
            toast.promise(updateBaseInformationUsername(data, id), {
                loading: "Speichere...",
                success: "Erfolgreich aktualisiert",
                error: "Fehler beim Aktualisieren",
            });
        });
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Meine Daten</CardTitle>
                <CardDescription>Deine persönlichen Daten</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form className="grid grid-cols-2 gap-4" onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            control={form.control}
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
                            control={form.control}
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
                            <Button disabled={changeIsPending} type="submit" value="username">
                                {changeIsPending ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Speichern
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
            <ErrorBoundary fallback={ChangePasswordError}>
                <Suspense fallback={<Skeleton className="h-72 w-full" />}>
                    <ChangePasswordForm id={id} />
                </Suspense>
            </ErrorBoundary>
        </Card>
    );
}
