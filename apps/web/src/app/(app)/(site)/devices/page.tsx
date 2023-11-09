import { Card, CardContent, CardDescription, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@energyleaf/ui";

export default function DevicesPage() {
    const devices = ["Waschmaschine", "Trockner", "Herd", "Fernseher"] // TODO: Load devices from database

    return (
        <div className="flex flex-col gap-4">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Deine Geräte</CardTitle>
                    <CardDescription>Hier siehst du alle deine Geräte und kannst diese verwalten.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHead>
                            <TableHeader>
                                Gerätename
                            </TableHeader>
                        </TableHead>
                        <TableBody>
                            {devices.map((device) => (
                                <TableRow>
                                    <TableCell>
                                        {device}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div hidden className="flex flex-row justify-center">
                        <p hidden className="text-muted-foreground">Noch keine Geräte vorhanden</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
