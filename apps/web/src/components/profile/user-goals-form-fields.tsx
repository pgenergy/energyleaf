import {UseFormReturn} from "react-hook-form";
import type {z} from "zod";
import {userGoalSchema} from "@/lib/schema/profile";
import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Input} from "@energyleaf/ui";
import React from "react";

interface Props {
    form: UseFormReturn<z.infer<typeof userGoalSchema>>;
}

export default function UserGoalsFormFields({form} : Props) {
    return (
        <FormField
            control={form.control}
            name="goalValue"
            render={({field}) => (
                <FormItem>
                    <FormLabel>Zielverbrauch (in kWh)</FormLabel>
                    <FormDescription>
                        Hier können Sie Ihren Zielverbrauch für einen Tag festlegen.
                    </FormDescription>
                    <FormControl>
                        <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}