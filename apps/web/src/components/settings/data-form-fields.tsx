"use client";

import type { userDataSchema } from "@/lib/schema/profile";
import { userDataTable } from "@energyleaf/postgres/schema/user";
import { userDataHotWaterEnums, userDataPropertyEnums, userDataTariffEnums } from "@energyleaf/postgres/types";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@energyleaf/ui/form";
import { Input } from "@energyleaf/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@energyleaf/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@energyleaf/ui/select";
import { Info } from "lucide-react";
import React from "react";
import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";

interface Props {
    form: UseFormReturn<z.infer<typeof userDataSchema>>;
    disabled: boolean;
}

DataFormFields.defaultProps = {
    disabled: false,
};

export default function DataFormFields({ form, disabled }: Props) {
    return (
        <>
            <FormField
                control={form.control}
                name="houseType"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Hausart</FormLabel>
                        <FormControl>
                            <Select defaultValue={field.value} disabled={disabled} onValueChange={field.onChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Hausart wählen" />
                                </SelectTrigger>
                                <SelectContent>
                                    {userDataTable.property.enumValues.map((value) => (
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
                            <Select defaultValue={field.value} disabled={disabled} onValueChange={field.onChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Warmwasser wählen" />
                                </SelectTrigger>
                                <SelectContent>
                                    {userDataTable.hotWater.enumValues.map((value) => (
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
                            <Select defaultValue={field.value} disabled={disabled} onValueChange={field.onChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Tarif wählen" />
                                </SelectTrigger>
                                <SelectContent>
                                    {userDataTable.tariff.enumValues.map((value) => (
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
                        <Popover>
                            <PopoverTrigger>
                                <Info className="ml-2 h-4 w-4" />
                            </PopoverTrigger>
                            <PopoverContent className="text-s">
                                Verbrauchsunabhängige Gebühr pro Monat, entspricht dem Arbeitspreis.
                            </PopoverContent>
                        </Popover>

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
                        <Popover>
                            <PopoverTrigger>
                                <Info className="ml-2 h-4 w-4" />
                            </PopoverTrigger>
                            <PopoverContent className="text-s">
                                An Stromanbieter zu entrichtender Preis pro Kilowattstunde und enthält Grundpreis,
                                Arbeitspreis und Steuern.
                            </PopoverContent>
                        </Popover>

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
                        <Popover>
                            <PopoverTrigger>
                                <Info className="ml-2 h-4 w-4" />
                            </PopoverTrigger>
                            <PopoverContent className="text-s">
                                An Energielieferanten zu zahlender Betrag
                            </PopoverContent>
                        </Popover>

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
