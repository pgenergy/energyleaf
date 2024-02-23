import {type ControllerRenderProps, useForm} from "react-hook-form";
import type {z} from "zod";
import {assignUserToSensorSchema} from "@/lib/schema/sensor";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormField, Spinner} from "@energyleaf/ui";
import UserSelector from "@/components/users/user-selector";
import {toast} from "sonner";
import {assignUserToSensor} from "@/actions/sensors";
import {useState} from "react";

interface Props {
    sensorId: string;
    selectedUserId: number | undefined;
    selectedUserName: string | undefined;
}

export default function SensorUserAssignmentForm({sensorId, selectedUserId, selectedUserName}: Props) {
    const form = useForm<z.infer<typeof assignUserToSensorSchema>>({
        resolver: zodResolver(assignUserToSensorSchema),
        defaultValues: {
            userId: selectedUserId
        }
    });

    const [isSaving, setIsSaving] = useState(false);

    function onSubmit(data: z.infer<typeof assignUserToSensorSchema>) {
        toast.promise(
            async () => {
                setIsSaving(true);
                await assignUserToSensor(data, sensorId)
            },
            {
                loading: "Zuweisung wird durchgeführt...",
                success: _ => {
                    setIsSaving(false);
                    return `Der Sensor wurde erfolgreich zum Benutzer zugeordnet.`;
                },
                error: _ => {
                    setIsSaving(false);
                    return `Fehler beim Zuweisen`
                },
            },
        );
    }

    function onFieldChange(field: ControllerRenderProps<{ userId: number | null }, "userId">, id: number | null) {
        field.onChange(id);
        onSubmit(form.getValues());
    }

    return (
        <Form {...form}>
            <form>
                <FormField
                    control={form.control}
                    name="userId"
                    render={({field}) => (
                        (
                            isSaving ? <Spinner/> : <UserSelector onUserSelected={(id) => {onFieldChange(field, id)}}
                                                                  selectedUserId={field.value}
                                                                  selectedUserName={selectedUserName}/>
                        )
                    )}
                />
            </form>
        </Form>
    )
}