import React from "react";
import type { userGoalSchema } from "@/lib/schema/profile";
import { CircleHelp } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Input } from "@energyleaf/ui";

interface Props {
    form: UseFormReturn<z.infer<typeof userGoalSchema>>;
    goalIsCalculated: boolean;
}

UserGoalsFormFields.defaultProps = {
    goalIsCalculated: false,
};

export default function UserGoalsFormFields({ form, goalIsCalculated }: Props) {
    return (
        <FormField
            control={form.control}
            name="goalValue"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Zielverbrauch (in kWh)</FormLabel>
                    <FormDescription>Hier können Sie Ihren Zielverbrauch für einen Tag festlegen.</FormDescription>
                    <FormControl>
                        <div className="flex flex-row items-center">
                            <Input type="number" {...field} />
                            {goalIsCalculated && !form.formState.isDirty ? <HelpCircle /> : null}
                        </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}

function HelpCircle() {
    const tooltip =
        "Dieser Zielverbrauch wurde auf Basis Ihres Strompreises und Ihres Abschlages automatisch berechnet.";

    return (
        <div title={tooltip}>
            <CircleHelp className="ms-1 h-6 w-6 text-muted-foreground" />
        </div>
    );
}
