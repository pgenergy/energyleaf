import { Card, CardContent, CardDescription, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@energyleaf/ui";
import { getSession } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { getDevicesByUser } from "@/query/device";

export default async function DevicesPage() {
    const session = await getSession()
    if (!session) {
        redirect("/");
    }
    
    const devices = await getDevicesByUser(session.user.id)

    return (
        <div className="flex flex-col gap-4">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Deine Geräte</CardTitle>
                    <CardDescription>Hier siehst du alle deine Geräte und kannst diese verwalten.</CardDescription>
                </CardHeader>
                <CardContent>
                    { (devices && devices.length > 0) ? (
                        <Table>
                            <TableHead>
                                <TableHeader>
                                    Gerätename
                                </TableHeader>
                            </TableHead>
                            <TableBody>
                                { devices.map((device) => (
                                    <TableRow>
                                        <TableCell>
                                            {device}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="flex flex-row justify-center">
                            <p className="text-muted-foreground">Noch keine Geräte vorhanden</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
