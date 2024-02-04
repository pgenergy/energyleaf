"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {toast} from "sonner";
import type {z} from "zod";

import {Button, Form, FormField, FormItem, FormLabel} from "@energyleaf/ui";
import {baseInfromationSchema} from "@/lib/schema/profile";
import {updateBaseInformationUsername} from "@/actions/profile";
import {FormControl, Input, Textarea} from "@energyleaf/ui";
import {getUserById} from "@energyleaf/db/query";

interface Props {
    userId: number;
    onInteract: () => void;
}

export default function UserManagementEditForm({userId, onInteract}: Props) {
    const user = getUserById(userId);

    const form = useForm<z.infer<typeof baseInfromationSchema>>({
        resolver: zodResolver(baseInfromationSchema),
        defaultValues: {
            username: user.username,
            email: user.email,
        },
    });

    function onSubmit(data: z.infer<typeof baseInfromationSchema>) {
        toast.promise(
            async () => {
                await updateBaseInformationUsername(data, userId);
            },
            {
                loading: "Speichern...",
                success: `Erolfgreich gespeichert`,
                error: `Der User wurde erffolgreich gespeichert!`,
            },
        );

        onInteract();
    }

    function onAbort() {
        onInteract();
    }

    /*
    return (
        <Form {...form}>
            <form className="flex flex-col gap-4" onAbortCapture={onAbort} onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="username"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>User</FormLabel>
                            <FormControl>
                                <Input {...field} type="username"/>
                            </FormControl>
                        </FormItem>
                    )}
                />

                <div className="flex flex-row justify-end">
                    <Button type="submit">Speichern</Button>
                </div>
            </form>
        </Form>
    );
     */

    return (
        <Form {...form}>
            <form className="flex flex-col gap-4" onAbortCapture={onAbort} onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="username"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                                <Input {...field} type="username"/>
                            </FormControl>
                        </FormItem>
                    )}
                />

                <div className="flex flex-row justify-end">
                    <Button type="submit">Speichern</Button>
                </div>
            </form>
        </Form>
    );
}
