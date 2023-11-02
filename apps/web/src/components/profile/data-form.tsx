"use client";

import { useTransition } from "react";
import { updateUserDataInformation } from "@/actions/profile";
import { userDataSchema } from "@/lib/schema/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { userData, userDataImmobilieEnums, userDataTarfiEnums, userDataWarmwasserEnums } from "@energyleaf/db/schema";
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
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@energyleaf/ui";
import { useToast } from "@energyleaf/ui/hooks";

interface Props {
    initialData: z.infer<typeof userDataSchema>;
    id: string;
}

export default function UserDataForm({ initialData, id }: Props) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const form = useForm<z.infer<typeof userDataSchema>>({
        resolver: zodResolver(userDataSchema),
        defaultValues: {
            ...initialData,
        },
    });

    function onSubmit(data: z.infer<typeof userDataSchema>) {
        startTransition(async () => {
            try {
                await updateUserDataInformation(data, id);
                toast({
                    title: "Erfolgreich aktualisiert",
                    description: "Deine Daten wurden erfolgreich aktualisiert",
                });
            } catch (err) {
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
                <CardTitle>Benutzerdaten</CardTitle>
                <CardDescription>Ändere deine Benutzerdaten</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form className="grid grid-cols-2 gap-4" onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            control={form.control}
                            name="houseType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Hausart</FormLabel>
                                    <Select defaultValue={field.value} onValueChange={field.onChange}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Hausart wählen" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {userData.immobilie.enumValues.map((value) => (
                                                <SelectItem key={value} value={value}>
                                                    {userDataImmobilieEnums[value]}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="warmWater"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Warmwasser</FormLabel>
                                    <Select defaultValue={field.value} onValueChange={field.onChange}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Warmwasser wählen" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {userData.warmwasser.enumValues.map((value) => (
                                                <SelectItem key={value} value={value}>
                                                    {userDataWarmwasserEnums[value]}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="tarif"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tarif</FormLabel>
                                    <Select defaultValue={field.value} onValueChange={field.onChange}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Tarif wählen" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {userData.tarif.enumValues.map((value) => (
                                                <SelectItem key={value} value={value}>
                                                    {userDataTarfiEnums[value]}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="budget"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Budget</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Strompreis</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="houseSize"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Wohnfläche</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="people"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Personen im Haushalt</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <div className="col-span-2 flex justify-end">
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
