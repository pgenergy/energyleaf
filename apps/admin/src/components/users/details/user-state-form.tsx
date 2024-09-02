"use client";

import { updateUserState } from "@/actions/user";
import { userStateSchema } from "@/lib/schema/user";
import { type DefaultActionReturn, DismissedReasonEnum, DismissedReasonEnumMap } from "@energyleaf/lib";
import { Versions, stringify } from "@energyleaf/lib/versioning";
import {
    ExperimentNumberEnum,
    ExperimentNumberEnumMap,
    userDataExperimentStatusEnum,
} from "@energyleaf/postgres/types";
import { cn } from "@energyleaf/tailwindcss/utils";
import { Button } from "@energyleaf/ui/button";
import { Calendar } from "@energyleaf/ui/calendar";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@energyleaf/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@energyleaf/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@energyleaf/ui/select";
import { Spinner } from "@energyleaf/ui/spinner";
import { Switch } from "@energyleaf/ui/switch";
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

    async function updateUserStateCallback(data: z.infer<typeof userStateSchema>, userId: string) {
        let res: DefaultActionReturn = undefined;
        try {
            res = await updateUserState(data, userId);
        } catch (err) {
            throw new Error("Ein Fehler ist aufgetreten.");
        }

        if (res && !res?.success) {
            throw new Error(res?.message);
        }
    }

    function onSubmit(data: z.infer<typeof userStateSchema>) {
        startTransition(() => {
            toast.promise(updateUserStateCallback(data, id), {
                loading: "Aktualisiere Benutzer...",
                success: "Benutzer erfolgreich aktualisiert.",
                error: (err: Error) => err.message,
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
                {form.getValues().isParticipant ? (
                    <>
                        <FormField
                            control={form.control}
                            name="experimentNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Experimentnummer</FormLabel>
                                    <FormControl>
                                        <Select
                                            onValueChange={(value) => {
                                                field.onChange(Number(value));
                                            }}
                                            value={field.value?.toString() || undefined}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Experimentnummer wählen" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.keys(ExperimentNumberEnum)
                                                    .filter((key) => Number.isNaN(Number(key)))
                                                    .map((key) => {
                                                        const expNumber = ExperimentNumberEnum[
                                                            key
                                                        ] as ExperimentNumberEnum;
                                                        return (
                                                            <SelectItem key={key} value={expNumber.toString()}>
                                                                {ExperimentNumberEnumMap[expNumber]}
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
                        <FormField
                            control={form.control}
                            name="getsPaid"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded border border-border p-4">
                                    <div className="flex flex-col gap-2">
                                        <FormLabel>Wird bezahlt</FormLabel>
                                        <FormDescription>Gibt an, ob dieser Nutzer bezahlt wird.</FormDescription>
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
                            name="usesProlific"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded border border-border p-4">
                                    <div className="flex flex-col gap-2">
                                        <FormLabel>Bezahlung über Prolific</FormLabel>
                                        <FormDescription>
                                            Gibt an, ob dieser Nutzer über Prolific bezahlt wird.
                                        </FormDescription>
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
                        {form.getValues().experimentStatus === "dismissed" ? (
                            <FormField
                                name="dismissedReason"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ablehnungsgrund</FormLabel>
                                        <FormControl>
                                            <Select
                                                onValueChange={(value) => {
                                                    field.onChange(Number(value));
                                                }}
                                                value={field.value?.toString() || undefined}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Grund wählen" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.keys(DismissedReasonEnum)
                                                        .filter((key) => Number.isNaN(Number(key)))
                                                        .map((key) => {
                                                            const dismissedReason = DismissedReasonEnum[
                                                                key
                                                            ] as DismissedReasonEnum;
                                                            return (
                                                                <SelectItem
                                                                    key={key}
                                                                    value={dismissedReason.toString()}
                                                                >
                                                                    {DismissedReasonEnumMap[dismissedReason]}
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
                        ) : null}
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
                                                disabled={(date) => date < new Date("1900-01-01")}
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
                                    <FormLabel>Deinstallationsdatum</FormLabel>
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
                                                disabled={(date) => date < new Date("1900-01-01")}
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
