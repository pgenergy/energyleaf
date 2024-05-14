import {assignUserToSensor} from "@/actions/sensors";
import UserSelector from "@/components/users/user-selector";
import {useSensorContext} from "@/hooks/sensor-hook";
import {assignUserToSensorSchema} from "@/lib/schema/sensor";
import type {SensorSelectType} from "@energyleaf/db/types";
import {Form, FormField, Spinner} from "@energyleaf/ui";
import {zodResolver} from "@hookform/resolvers/zod";
import {useState} from "react";
import {type ControllerRenderProps, useForm} from "react-hook-form";
import {toast} from "sonner";
import type {z} from "zod";
import type {DefaultActionReturnPayload} from "@energyleaf/lib";

interface Props {
    sensor: SensorSelectType;
    selectedUserId: string | undefined;
    selectedUserName: string | undefined;
}

export default function SensorUserAssignmentForm({ sensor, selectedUserId, selectedUserName }: Props) {
    const sensorContext = useSensorContext();
    const form = useForm<z.infer<typeof assignUserToSensorSchema>>({
        resolver: zodResolver(assignUserToSensorSchema),
        defaultValues: {
            userId: selectedUserId,
        },
    });

    const [isSaving, setIsSaving] = useState(false);

    function onSubmit(data: z.infer<typeof assignUserToSensorSchema>) {
        toast.promise(
            async () => {
                setIsSaving(true);
                let resp: DefaultActionReturnPayload<string> = undefined;
                try {
                    resp = await assignUserToSensor(data, sensor.clientId);
                } catch (e) {
                    throw new Error("Fehler beim Zuweisen");
                }

                if (!resp?.success) {
                    throw new Error(resp.message);
                }

                return resp.payload;
            },
            {
                loading: "Zuweisung wird durchgeführt...",
                success: (resp) => {
                    setIsSaving(false);
                    if (data.userId && resp) {
                        sensorContext.setSensor({
                            ...sensor,
                            id: resp,
                            userId: data.userId,
                        });
                        sensorContext.setAddValueDialogOpen(true);
                    }
                    return "Der Sensor wurde erfolgreich zum Benutzer zugeordnet.";
                },
                error: (err) => {
                    setIsSaving(false);
                    form.reset();
                    return err.message;
                },
            },
        );
    }

    function onFieldChange(field: ControllerRenderProps<{ userId: string | null }, "userId">, id: string | null) {
        field.onChange(id);
        onSubmit(form.getValues());
    }

    return (
        <Form {...form}>
            <form>
                <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) =>
                        isSaving ? (
                            <Spinner />
                        ) : (
                            <UserSelector
                                onUserSelected={(id) => {
                                    onFieldChange(field, id);
                                }}
                                selectedUserId={field.value}
                                selectedUserName={selectedUserName}
                            />
                        )
                    }
                />
            </form>
        </Form>
    );
}
