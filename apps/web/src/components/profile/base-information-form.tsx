"use client";

import { useTransition } from "react";
import { updateBaseInformation } from "@/actions/profile";
import { baseInfromationSchema } from "@/lib/schema/profile";
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
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const form = useForm<z.infer<typeof baseInfromationSchema>>({
        resolver: zodResolver(baseInfromationSchema),
        defaultValues: {
            username,
            email,
        },
    });

    function onSubmit(data: z.infer<typeof baseInfromationSchema>) {
        startTransition(async () => {
            if (data.email !== email) {
                return;
            }
            try {
                await updateBaseInformation(data, id);
                toast({
                    title: "Erfolgreich aktualisiert",
                    description: "Deine Daten wurden erfolgreich aktualisiert",
                });
            } catch (e) {
                toast({
                    title: "Fehler beim aktualisieren",
                    description: "Deine Daten konnten nicht aktualisiert werden",
                    variant: "destructive",
                });
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
                            <Button disabled={isPending} type="submit">
                                {isPending ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Speichern
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
