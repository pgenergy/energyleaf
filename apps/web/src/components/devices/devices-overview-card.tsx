import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@energyleaf/ui";
import { getSession } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { SortOrder } from "@energyleaf/db/util";
import { device } from "@energyleaf/db/schema";
import { getDevicesByUser } from "@/query/device";
import DevicesTable from "./devices-tables";

export default async function DevicesOverviewCard({ searchParams }: { searchParams: { sortOrder: SortOrder, sortProp: String } }) {
    const session = await getSession()
    if (!session) {
        redirect("/");
    }

    const sortOrder = searchParams?.sortOrder ? searchParams.sortOrder : SortOrder.ASC
    
    var sortPropName = searchParams.sortProp ?? "name"
    var sortProp: (x: typeof device) => any = x => x.name
    if (searchParams?.sortProp) {
        const prop = Object.keys(device).find(x => x === sortPropName)
        if (prop) {
            sortProp = x => x[prop]
        }
    }

    const userId = session.user.id
    const devices = await getDevicesByUser(userId, sortOrder, sortProp)

    return(
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Deine Geräte</CardTitle>
                <CardDescription>Hier siehst du alle deine Geräte und kannst diese verwalten.</CardDescription>
            </CardHeader>
            <CardContent>
                <DevicesTable userId={userId} devices={devices} sortOrder={sortOrder} sortProp={sortPropName}/>
            </CardContent>
        </Card>
    )
}