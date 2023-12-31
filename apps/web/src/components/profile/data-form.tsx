"use client";

import { useTransition } from "react";
import { updateUserDataInformation } from "@/actions/profile";
import { userDataSchema } from "@/lib/schema/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { userData, userDataHotWaterEnums, userDataPropertyEnums, userDataTariffEnums } from "@energyleaf/db/schema";
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

interface Props {
    initialData: z.infer<typeof userDataSchema>;
    id: string;
}

export default function UserDataForm({ initialData, id }: Props) {
    const [isPending, startTransition] = useTransition();
    const form = useForm<z.infer<typeof userDataSchema>>({
        resolver: zodResolver(userDataSchema),
        defaultValues: {
            ...initialData,
        },
    });

    function onSubmit(data: z.infer<typeof userDataSchema>) {
        startTransition(() => {
            toast.promise(updateUserDataInformation(data, id), {
                loading: "Speichere...",
                success: "Erfolgreich aktualisiert",
                error: "Fehler beim Aktualisieren",
            });
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
                                            {userData.property.enumValues.map((value) => (
                                                <SelectItem key={value} value={value}>
                                                    {userDataPropertyEnums[value]}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="hotWater"
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
                                            {userData.hotWater.enumValues.map((value) => (
                                                <SelectItem key={value} value={value}>
                                                    {userDataHotWaterEnums[value]}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="tariff"
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
                                            {userData.tariff.enumValues.map((value) => (
                                                <SelectItem key={value} value={value}>
                                                    {userDataTariffEnums[value]}
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
                            name="basePrice"
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
                            name="livingSpace"
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
