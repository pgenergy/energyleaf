import { Card, CardContent, CardDescription, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@energyleaf/ui";
import { getSession } from "@/lib/auth/auth";
import { redirect, usePathname } from "next/navigation";
import { getDevicesByUser } from "@/query/device";
import { SortOrder } from "@energyleaf/db/util";
import { Button } from "react-day-picker";
import router, { Router, useRouter } from "next/router";
import DeviceSortButton from "@/components/devices/device-sort-button";

export default async function DevicesPage({ searchParams }: { searchParams: { sortOrder: SortOrder } }) {
    const session = await getSession()
    if (!session) {
        redirect("/");
    }

    const sortOrder = searchParams?.sortOrder ? searchParams.sortOrder : SortOrder.ASC
    const devices = await getDevicesByUser(session.user.id, sortOrder)

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
                                    <DeviceSortButton sortOrder={sortOrder}>Gerätename</DeviceSortButton>
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