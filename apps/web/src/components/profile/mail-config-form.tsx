import { Button, Form, Spinner } from "@energyleaf/ui";

import { mailSettingsSchema } from "@/lib/schema/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import MailSettingsFormFields from "./mail-settings-form-fields";

interface Props {
    disabled?: boolean;
    onSubmit: (data: z.infer<typeof mailSettingsSchema>) => void;

    initialData: z.infer<typeof mailSettingsSchema>;
}

export default function MailConfigForm({ initialData: reportConfig, disabled, onSubmit }: Props) {
    const [isPending, startTransition] = useTransition();
    const form = useForm<z.infer<typeof mailSettingsSchema>>({
        resolver: zodResolver(mailSettingsSchema),
        defaultValues: reportConfig,
    });

    function onSubmitInternal(data: z.infer<typeof mailSettingsSchema>) {
        if (disabled) return;
        startTransition(() => {
            onSubmit(data);
        });
    }

    return (
        <Form {...form}>
            <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmitInternal)}>
                <MailSettingsFormFields form={form} disabled={disabled} />
                <div className="flex flex-row justify-end">
                    <Button disabled={isPending || disabled} type="submit">
                        {isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
                        Speichern
                    </Button>
                </div>
            </form>
        </Form>
    );
}
