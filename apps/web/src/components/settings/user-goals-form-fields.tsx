import type { userGoalSchema } from "@/lib/schema/profile";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@energyleaf/ui/form";
import { Input } from "@energyleaf/ui/input";
import { CircleHelp } from "lucide-react";
import type React from "react";
import { type ChangeEvent, useCallback, useEffect, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";

interface Props {
    form: UseFormReturn<z.infer<typeof userGoalSchema>>;
    goalIsCalculated: boolean;
    workingPrice: number | null | undefined;
}

UserGoalsFormFields.defaultProps = {
    goalIsCalculated: false,
};

export default function UserGoalsFormFields({ form, goalIsCalculated, workingPrice }: Props) {
    const goalValueField = form.watch("goalValue");
    const costField = workingPrice && !Number.isNaN(goalValueField) ? goalValueField * workingPrice : Number.NaN;
    const hasWorkingPrice = Boolean(workingPrice);

    function onMoneyInputChange(e: ChangeEvent<HTMLInputElement>) {
        if (!workingPrice) return;

        const newValue = Number.parseFloat(e.target.value);
        form.setValue("goalValue", newValue / workingPrice);
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
                            <Input
                                type="number"
                                step="any"
                                {...field}
                                onChange={(e) => {
                                    if (e.target.value === "" || e.target.value === null) {
                                        field.onChange(Number.NaN);
                                        return;
                                    }
                                    field.onChange(Number(e.target.value));
                                }}
                            />
                            {goalIsCalculated && !form.formState.isDirty ? <HelpCircle /> : null}
                        </div>
                    </FormControl>
                    <FormLabel>Zielkosten (in €)</FormLabel>
                    <FormDescription>Hier können Sie Ihre Zielkosten für einen Tag festlegen.</FormDescription>
                    <FormControl>
                        <Input
                            disabled={!hasWorkingPrice}
                            type="number"
                            step="any"
                            onChange={onMoneyInputChange}
                            value={costField}
                        />
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
