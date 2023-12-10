"use client";

import {useState, useTransition, useEffect} from "react";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import type {z} from "zod";

import {Button, Form, FormControl, FormDescription, FormField, FormItem, FormMessage, Input} from "@energyleaf/ui";
import {useToast} from "@energyleaf/ui/hooks";
import {resetSchema} from "@/lib/schema/auth";
import {resetPassword, searchForToken} from "@/actions/auth";

import {useSearchParams} from 'next/navigation'
import {Loader2Icon} from "lucide-react";

export default function ResetForm() {
    // const [loading, setLoading] = useState<boolean>(false);
    const [hasToken, setToken] = useState<boolean>(false);
    // //const [isPending, startTransition] = useTransition();
    // const [error, setError] = useState<string>("");
    // const {toast} = useToast();
    // const form = useForm<z.infer<typeof resetSchema>>({
    //     resolver: zodResolver(resetSchema),
    //     defaultValues: {
    //         password: "",
    //         passwordRepeat: ""
    //     },
    // });
    //
    const searchParams = useSearchParams();
    if (searchParams === null) {
        return ("invalid");
    }
    // const [tokenStr, setTokenStr] = useState<string>(searchParams?.get('token') || "");
    //
    //
    //
    useEffect( () => {
        const tokenp = async () => {
            const x = await searchForToken("q");

            console.log(x);

            //setToken(x !== null);
        };

        tokenp();
    }, []);
    //
    // async function onSubmit(data: z.infer<typeof resetSchema>) {
    //     try {
    //         setLoading(true);
    //         //await resetPassword(data, (await token)?.token || "");
    //         toast({
    //             title: "Passwort erfolgreich zurückgesetzt",
    //         });
    //     } catch (e) {
    //         toast({
    //             title: e,
    //         });
    //     } finally {
    //         setLoading(false);
    //     }
    // }
    //
    if (!hasToken) {
        return (
            <div className="flex flex-col gap-2">
                <p className="text-xl font-bold">Ungültiges oder abgelaufenes Passwort-Reset-Token</p>
            </div>
        );
    }

    return (
        "form"
    );
    //
    // return (
    //     <div className="flex flex-col gap-2">
    //         <p className="text-xl font-bold">Passwort zurücksetzen</p>
    //
    //         <Form {...form}>
    //             <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
    //                 <FormField
    //                     control={form.control}
    //                     name="password"
    //                     render={({field}) => (
    //                         <FormItem>
    //                             <FormControl>
    //                                 <Input placeholder="Passwort" type="password" {...field} />
    //                             </FormControl>
    //                             <FormMessage/>
    //                         </FormItem>
    //                     )}
    //                 />
    //                 <FormField
    //                     control={form.control}
    //                     name="passwordRepeat"
    //                     render={({field}) => (
    //                         <FormItem>
    //                             <FormControl>
    //                                 <Input placeholder="Passwort wiederholen" type="password" {...field} />
    //                             </FormControl>
    //                             <FormMessage/>
    //                         </FormItem>
    //                     )}
    //                 />
    //                 <Button className="w-full" disabled={loading} type="submit">
    //                     {loading ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin"/> : null}
    //                     Passwort zurücksetzen
    //                 </Button>
    //             </form>
    //         </Form>
    //     </div>
    // );
}
