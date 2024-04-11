"use client";

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel, FormMessage, Input,
    Select,
    SelectContent, SelectItem,
    SelectTrigger,
    SelectValue
} from "@energyleaf/ui";
import {userData} from "@energyleaf/db/schema";
import {userDataHotWaterEnums, userDataPropertyEnums, userDataTariffEnums} from "@energyleaf/db/types";
import React from "react";
import {UseFormReturn} from "react-hook-form";
import {z} from "zod";
import {userDataSchema} from "@/lib/schema/profile";

interface Props {
    form: UseFormReturn<z.infer<typeof userDataSchema>>;
    disabled: boolean;
}

DataFormFields.defaultProps = {
    disabled: false
}

export default function DataFormFields({form, disabled}: Props) {
    return (
        <>
            <FormField
                control={form.control}
                name="houseType"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Hausart</FormLabel>
                        <FormControl>
                            <Select
                                defaultValue={field.value}
                                disabled={disabled}
                                onValueChange={field.onChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Hausart wählen" />
                                </SelectTrigger>
                                <SelectContent>
                                    {userData.property.enumValues.map((value) => (
                                        <SelectItem key={value} value={value}>
                                            {userDataPropertyEnums[value]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="hotWater"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Warmwasser</FormLabel>
                        <FormControl>
                            <Select
                                defaultValue={field.value}
                                disabled={disabled}
                                onValueChange={field.onChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Warmwasser wählen" />
                                </SelectTrigger>
                                <SelectContent>
                                    {userData.hotWater.enumValues.map((value) => (
                                        <SelectItem key={value} value={value}>
                                            {userDataHotWaterEnums[value]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="tariff"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tarif</FormLabel>
                        <FormControl>
                            <Select
                                defaultValue={field.value}
                                disabled={disabled}
                                onValueChange={field.onChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Tarif wählen" />
                                </SelectTrigger>
                                <SelectContent>
                                    {userData.tariff.enumValues.map((value) => (
                                        <SelectItem key={value} value={value}>
                                            {userDataTariffEnums[value]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="basePrice"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Strom-Grundpreis (in €)</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} disabled={disabled} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="workingPrice"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Strompreis (in €/kWh)</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} disabled={disabled} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="monthlyPayment"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Monatlicher Abschlag (in €)</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} disabled={disabled} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="livingSpace"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Wohnfläche (in m²)</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} disabled={disabled} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="people"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Personen im Haushalt</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} disabled={disabled} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    );
}