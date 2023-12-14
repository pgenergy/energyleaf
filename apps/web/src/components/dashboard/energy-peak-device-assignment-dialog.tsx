import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@energyleaf/ui";

interface Props {
    open: boolean;
    setOpen: (open: boolean) => void;
    value: Record<string, string | number | undefined>;
    devices: { id: number; userId: number; name: string; created: Date | null; }[] | null;
}

export function EnergyPeakDeviceAssignmentDialog({ open, setOpen, value, devices }: Props) {
    return (
        <Dialog onOpenChange={setOpen} open={open}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Geräteauswahl</DialogTitle>
                    <DialogDescription>Wähle ein Gerät aus, was diesen Verbrauch verursacht hat.</DialogDescription>
                </DialogHeader>
                <p>Verbrauch: {value.energy}</p>
                <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Gerät wählen" />
                    </SelectTrigger>
                    <SelectContent>
                        {devices?.map((device) => (
                            <SelectItem key={device.id} value={device.id.toString()}>
                                {device.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </DialogContent>
        </Dialog>
    );
}