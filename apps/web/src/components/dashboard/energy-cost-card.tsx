import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/auth";
import { getEnergyDataForUser } from "@/query/energy";
import { getUserData } from "@/query/user";
import { format } from "date-fns";
import de from "date-fns/locale/de";
import { ArrowRightIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";

interface Props {
    startDate: Date;
    endDate: Date;
}

export default async function EnergyCostCard({ startDate, endDate }: Props) {
    const session = await getSession();

    if (!session) {
        redirect("/");
    }

    const energyData = await getEnergyDataForUser(startDate, endDate, session.user.id);
    const userData = await getUserData(session.user.id);
    const price = userData?.user_data.basePrice;
    const absolut = energyData.reduce((acc, cur) => acc + cur.value, 0) / 1000;
    const cost = price ? (absolut * price).toFixed(2) : null;

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Energiekosten</CardTitle>
                <CardDescription>
                    {startDate.toDateString() === endDate.toDateString() ? (
                        <>
                            {format(startDate, "PPP", {
                                locale: de,
                            })}
                        </>
                    ) : (
                        <>
                            {format(startDate, "PPP", {
                                locale: de,
                            })}{" "}
                            -{" "}
                            {format(endDate, "PPP", {
                                locale: de,
                            })}
                        </>
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {cost !== null ? (
                    <h1 className="text-center text-2xl font-bold text-primary">{cost} €</h1>
                ) : (
                    <Link
                        className="flex flex-row items-center justify-center gap-2 text-sm text-muted-foreground"
                        href="/profile"
                    >
                        Preis im Profil festlegen
                        <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                )}
            </CardContent>
        </Card>
    );
}
