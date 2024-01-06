import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/auth";
import { getDevicesByUser } from "@/query/device";

import { device } from "@energyleaf/db/schema";
import type { SortOrder } from "@energyleaf/db/util";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";

import DevicesTable from "./devices-tables";

export default async function DevicesOverviewCard({
    searchParams,
}: {
    searchParams: { sortOrder: SortOrder; sortProp: string };
}) {
    const session = await getSession();
    if (!session) {
        redirect("/");
    }

    let sortProp: (x: typeof device) => (typeof device)[keyof typeof device] = (x) => x.name;
    if (searchParams.sortProp) {
        const prop = Object.keys(device).find((x) => x === searchParams.sortProp) as keyof typeof device | undefined;
        if (prop) {
            sortProp = (x) => x[prop];
        }
    }

    const userId = session.user.id;
    const devices = await getDevicesByUser(userId, searchParams.sortOrder, sortProp);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Deine Geräte</CardTitle>
                <CardDescription>Hier siehst du alle deine Geräte und kannst diese verwalten.</CardDescription>
            </CardHeader>
            <CardContent>
                <DevicesTable
                    devices={devices}
                    sortOrder={searchParams.sortOrder}
                    sortProp={searchParams.sortProp}
                    userId={userId}
                />
            </CardContent>
        </Card>
    );
}
