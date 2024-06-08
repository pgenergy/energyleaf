import type { userGoalSchema } from "@/lib/schema/profile";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Input } from "@energyleaf/ui";
import { CircleHelp } from "lucide-react";
import type React from "react";
import { type ChangeEvent, useCallback, useEffect, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";

interface Props {
    form: UseFormReturn<z.infer<typeof userGoalSchema>>;
    goalIsCalculated: boolean;
}

UserGoalsFormFields.defaultProps = {
    goalIsCalculated: false,
};

export default function UserGoalsFormFields({ form, goalIsCalculated }: Props) {
    const workingPrice = 3; // TODO
    function consumptionToCost(consumption: number) {
        return consumption * workingPrice;
    }

    const [costFieldValue, setCostFieldValue] = useState<number | undefined>(
        consumptionToCost(form.getValues("goalValue")),
    );
    const goalValueField = form.watch("goalValue");

    useEffect(() => {
        setCostFieldValue(goalValueField * workingPrice);
    }, [goalValueField]);

    useEffect(() => {
        if (!costFieldValue) {
            form.setValue("goalValue", Number.NaN);
            return;
        }
        form.setValue("goalValue", costFieldValue / workingPrice);
    }, [costFieldValue, form.setValue]);

    function onMoneyInputChange(e: ChangeEvent<HTMLInputElement>) {
        const parsedValue = Number.parseFloat(e.target.value);
        const newValue = !Number.isNaN(parsedValue) ? parsedValue : undefined;
        setCostFieldValue(newValue);
    }

    return (
        <FormField
            control={form.control}
            name="goalValue"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Zielverbrauch (in kWh)</FormLabel>
                    <FormDescription>Hier können Sie Ihren Zielverbrauch für einen Tag festlegen.</FormDescription>
                    <FormControl className="pb-3">
                        <div className="flex flex-row items-center">
                            <Input type="number" {...field} />
                            {goalIsCalculated && !form.formState.isDirty ? <HelpCircle /> : null}
                        </div>
                    </FormControl>
                    <FormLabel>Zielkosten (in €)</FormLabel>
                    <FormDescription>Hier können Sie Ihre Zielkosten für einen Tag festlegen.</FormDescription>
                    <FormControl>
                        <Input type="number" onChange={onMoneyInputChange} value={costFieldValue} />
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
