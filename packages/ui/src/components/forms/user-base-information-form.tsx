import {Button, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input} from "../../ui";
import {Loader2Icon} from "lucide-react";
import {useForm} from "react-hook-form";
import type {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {baseInformationSchema} from "@energyleaf/lib";

interface Props {
    username: string;
    email: string;
    changeIsPending: boolean;
    onSubmit: (data: z.infer<typeof baseInformationSchema>) => void;
    mailDisabled?: boolean;
}

export function UserBaseInformationForm({ username, email, changeIsPending, onSubmit, mailDisabled }: Props) {
    const form = useForm<z.infer<typeof baseInformationSchema>>({
        resolver: zodResolver(baseInformationSchema),
        defaultValues: {
            username,
            email,
        },
    });

    return(
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
                                <Input disabled={mailDisabled ?? true} type="email" {...field} />
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
    )
}