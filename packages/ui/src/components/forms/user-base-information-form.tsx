import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { baseInformationSchema } from "@energyleaf/lib";

import { Button, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, Spinner } from "../../ui";

interface Props {
    username: string;
    email: string;
    changeIsPending: boolean;
    onSubmit: (data: z.infer<typeof baseInformationSchema>) => void;
    disabled?: boolean;
}

export function UserBaseInformationForm({ username, email, changeIsPending, onSubmit, disabled }: Props) {
    const form = useForm<z.infer<typeof baseInformationSchema>>({
        resolver: zodResolver(baseInformationSchema),
        defaultValues: {
            username,
            email,
        },
    });

    return (
        <Form {...form}>
            <form className="grid grid-cols-2 gap-4" onSubmit={form.handleSubmit(onSubmit)}>
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
