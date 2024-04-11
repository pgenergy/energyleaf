import type {UseFormReturn} from "react-hook-form";
import type {z} from "zod";
import type {userGoalSchema} from "@/lib/schema/profile";
import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Input} from "@energyleaf/ui";
import React from "react";
import {CircleHelp} from "lucide-react";

interface Props {
    form: UseFormReturn<z.infer<typeof userGoalSchema>>;
    goalIsCalculated: boolean;
}

UserGoalsFormFields.defaultProps = {
    goalIsCalculated: false
}

export default function UserGoalsFormFields({form, goalIsCalculated} : Props) {
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
                        <div className="flex flex-row items-center">
                            <Input type="number" {...field} />
                            {
                                goalIsCalculated && !form.formState.isDirty
                                    ? <HelpCircle />
                                    : null
                            }
                        </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}

function HelpCircle() {
    const tooltip = "Dieser Zielverbrauch wurde auf Basis Ihres Strompreises und Ihres Abschlages automatisch berechnet.";

    return (
        <div title={tooltip}>
            <CircleHelp className="h-6 w-6 text-muted-foreground ms-1" />
        </div>
    );
}