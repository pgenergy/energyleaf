"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { deviceSchema, DeviceCategory } from "@/lib/schema/device";
import { toast } from "sonner";
import { createDevice, updateDevice } from "@/actions/device";
import type { z } from "zod";

import { Button, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@energyleaf/ui";

interface Props {
  device?: { id: number; name: string; category?: DeviceCategory };
  onCallback: () => void;
}

export default function DeviceDetailsForm({ device, onCallback }: Props) {
  const form = useForm<z.infer<typeof deviceSchema>>({
    resolver: zodResolver(deviceSchema),
    defaultValues: {
      deviceName: device?.name ?? '',
      category: device?.category,
    },
  });

  const onSubmit = async (data: z.infer<typeof deviceSchema>) => {
    try {
      if (device) {
        await updateDevice(data, device.id);
        toast.success('Gerät erfolgreich aktualisiert');
      } else {
        await createDevice(data);
        toast.success('Gerät erfolgreich hinzugefügt');
      }
      onCallback();
    } catch (error) {
      toast.error('Fehler beim Speichern des Geräts');
      console.error(error);
    }
  };

  return (
    <Form {...form}>
      <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="deviceName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gerätename</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
  control={form.control}
  name="category"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Kategorie</FormLabel>
      <FormControl>
        <Select {...field}>
          <SelectTrigger>
            <SelectValue placeholder="Kategorie auswählen" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DeviceCategory).map(([key, value]) => (
              <SelectItem key={key} value={key}>{value}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>


        <Button className="flex flex-row gap-2" disabled={device !== undefined && !form.formState.isDirty} type="submit">
          Speichern
        </Button>
      </form>
    </Form>
  );
}

