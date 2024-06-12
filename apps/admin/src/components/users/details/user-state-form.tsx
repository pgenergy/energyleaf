"use client";

import { updateUserState } from "@/actions/user";
import { userStateSchema } from "@/lib/schema/user";
import { userDataExperimentStatusEnum } from "@energyleaf/db/types";
import { Versions, stringify } from "@energyleaf/lib/versioning";
import { cn } from "@energyleaf/tailwindcss/utils";
import {
    Button,
    Calendar,
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Spinner,
    Switch,
} from "@energyleaf/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

interface Props {
    initialValues: z.infer<typeof userStateSchema>;
    id: string;
}

export default function UserStateForm({ initialValues, id }: Props) {
    const [isPending, startTransition] = useTransition();
    const form = useForm<z.infer<typeof userStateSchema>>({
        resolver: zodResolver(userStateSchema),
        defaultValues: initialValues,
    });

    function onSubmit(data: z.infer<typeof userStateSchema>) {
        startTransition(() => {
            toast.promise(updateUserState(data, id), {
                loading: "Aktualisiere Benutzer...",
                success: "Benutzer erfolgreich aktualisiert.",
                error: "Der Benutzer konnte nicht aktualisiert werden.",
            });
        });
    }

    return (
        <Form {...form}>
            <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="isAdmin"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded border border-border p-4">
                            <div className="flex flex-col gap-2">
                                <FormLabel>Admin</FormLabel>
                                <FormDescription>Gibt an, ob der Benutzer ein Administrator ist.</FormDescription>
                            </div>
                            <FormControl>
                                <Switch aria-readonly checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="isParticipant"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded border border-border p-4">
                            <div className="flex flex-col gap-2">
                                <FormLabel>Experiment</FormLabel>
                                <FormDescription>Gibt an ob diese Person am Experiment teilnimmt.</FormDescription>
                            </div>
                            <FormControl>
                                <Switch aria-readonly checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded border border-border p-4">
                            <div className="flex flex-col gap-2">
                                <FormLabel>Aktiv</FormLabel>
                                <FormDescription>Gibt an, ob das Konto dieser Person aktiv ist.</FormDescription>
                            </div>
                            <FormControl>
                                <Switch aria-readonly checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="appVersion"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>App-Version</FormLabel>
                            <FormControl>
                                <Select
                                    onValueChange={(value) => {
                                        field.onChange(Number(value));
                                    }}
                                    value={field.value.toString()}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="App-Version wählen..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(Versions)
                                            .filter((key) => Number.isNaN(Number(key)))
                                            .map((key) => {
                                                const appVersion = Versions[key] as Versions;
                                                return (
                                                    <SelectItem key={key} value={appVersion.toString()}>
                                                        {stringify(appVersion)}
                                                    </SelectItem>
                                                );
                                            })}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {initialValues.isParticipant ? (
                    <>
                        <FormField
                            control={form.control}
                            name="experimentStatus"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Experimentphase</FormLabel>
                                    <FormControl>
                                        <Select
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                            }}
                                            value={field.value}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Phase wählen" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.keys(userDataExperimentStatusEnum).map((status) => (
                                                    <SelectItem key={status} value={status}>
                                                        {userDataExperimentStatusEnum[status]}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="installationDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Installationsdatum</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-[240px] pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground",
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP", {
                                                            locale: de,
                                                        })
                                                    ) : (
                                                        <span>Datum wählen</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="installationDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Installationsdatum</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-[240px] pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground",
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP", {
                                                            locale: de,
                                                        })
                                                    ) : (
                                                        <span>Datum wählen</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </FormItem>
                            )}
                        />
                    </>
                ) : null}
                <div className="flex flex-row justify-end">
                    <Button disabled={isPending} type="submit">
                        {isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
                        Speichern
                    </Button>
                </div>
            </form>
        </Form>
    );
}
