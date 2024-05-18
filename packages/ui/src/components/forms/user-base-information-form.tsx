import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { baseInformationSchema } from "@energyleaf/lib";

import { Button, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, Spinner } from "../../ui";

interface Props {
    firstname: string;
    lastname: string;
    username: string;
    email: string;
    changeIsPending: boolean;
    address: string;
    phone?: string;
    onSubmit: (data: z.infer<typeof baseInformationSchema>) => void;
    disabled?: boolean;
}

export function UserBaseInformationForm({
    firstname,
    lastname,
    username,
    email,
    changeIsPending,
    onSubmit,
    disabled,
    address,
    phone,
}: Props) {
    const form = useForm<z.infer<typeof baseInformationSchema>>({
        resolver: zodResolver(baseInformationSchema),
        defaultValues: {
            firstname,
            lastname,
            username,
            email,
            phone,
            address,
        },
    });

    return (
        <Form {...form}>
            <form className="grid grid-cols-2 gap-4" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="firstname"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Vorname</FormLabel>
                            <FormControl>
                                <Input disabled={disabled} {...field} />
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
                                <Input disabled={disabled} {...field} />
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
                                <Input disabled={disabled} {...field} />
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
                                <Input disabled={disabled} type="email" {...field} />
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
                                <Input disabled={disabled} type="tel" {...field} />
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
                                <Input disabled={disabled} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="col-span-2 flex flex-row justify-end">
                    <Button disabled={changeIsPending || disabled} type="submit" value="username">
                        {changeIsPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
                        Speichern
                    </Button>
                </div>
            </form>
        </Form>
    );
}
