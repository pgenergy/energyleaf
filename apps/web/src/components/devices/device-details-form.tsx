"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { deviceSchema, DeviceCategory } from "@/lib/schema/device";
import { toast } from "sonner";
import { createDevice, updateDevice } from "@/actions/device";
import type { z } from "zod";

import {  Button,  Form,  FormControl,  FormField,  FormItem,  FormLabel,  FormMessage,  Input,  Select,} from "@energyleaf/ui";

interface Props {
  device?: { id: number; name: string; category?: DeviceCategory };
  onCallback: () => void;
}

export default function DeviceDetailsForm({ device, onCallback }: Props) {
  const form = useForm<z.infer<typeof deviceSchema>>({
    resolver: zodResolver(deviceSchema),
    defaultValues: {
      deviceName: device?.name ?? "",
      category: device?.category ?? DeviceCategory.CoolingAndFreezing,
    },
  });

  async function onSubmit(data: z.infer<typeof deviceSchema>) {
    const operation = device ? "aktualisiert" : "hinzugefügt";
    await toast.promise(
      async () => {
        if (!device) {
          await createDevice(data);
        } else {
          await updateDevice(data, device.id);
        }
      },
      {
        loading: "Laden...",
        success: `Gerät erfolgreich ${operation}.`,
        error: `Fehler beim ${operation} des Geräts.`,
      }
    );

    onCallback();
}
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
                  {Object.entries(DeviceCategory).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-row justify-end">
          <Button type="submit">Speichern</Button>
        </div>
      </form>
    </Form>
  );
}

