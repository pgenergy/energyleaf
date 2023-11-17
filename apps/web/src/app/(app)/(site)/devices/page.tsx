import { Card, CardContent, CardDescription, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@energyleaf/ui";
import { getSession } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { getDevicesByUser } from "@/query/device";
import { SortOrder } from "@energyleaf/db/util";
import DeviceSortButton from "@/components/devices/device-sort-button";
import { device } from "@energyleaf/db/schema";
import { format } from "date-fns";
import de from "date-fns/locale/de"

export default async function DevicesPage({ searchParams }: { searchParams: { sortOrder: SortOrder, sortProp: String } }) {
    const session = await getSession()
    if (!session) {
        redirect("/");
    }

    const sortOrder = searchParams?.sortOrder ? searchParams.sortOrder : SortOrder.ASC
    
    var sortProp: (x: typeof device) => any = x => x.name
    if (searchParams?.sortProp) {
        const prop = Object.keys(device).find(x => x === searchParams.sortProp)
        if (prop) {
            sortProp = x => x[prop]
        }
    }

    const devices = await getDevicesByUser(session.user.id, sortOrder, sortProp)

    const dateString = (created: Date | null) => {
        if (!created) {
            return ""
        }

        return `${format(created, "PPpp", {
            locale: de,
        })}`;
    };

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
                            <TableHeader>
                                <TableHead>
                                <DeviceSortButton propName="name" sortOrder={searchParams.sortProp === "name" ? sortOrder : null}/>
                                </TableHead>
                                <TableHead>
                                    <DeviceSortButton propName="created" sortOrder={searchParams.sortProp === "created" ? sortOrder : null}/>
                                </TableHead>
                            </TableHeader>
                            <TableBody>
                                { devices.map((device) => (
                                    <TableRow>
                                        <TableCell>
                                            {device.name}
                                        </TableCell>
                                        <TableCell>
                                            {dateString(device.created)}
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