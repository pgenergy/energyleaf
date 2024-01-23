import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/auth";
import { getEnergyDataForSensor, getElectricitySensorIdForUser } from "@/query/energy";
import { getUserData } from "@/query/user";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { ArrowRightIcon} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";

interface Props {
    startDate: Date;
    endDate: Date;
}

interface EnergyEntry {
    id: number;
    sensorId: string | null;
    value: number;
    timestamp: Date | null;
  }

export default async function EnergyCostCard({ startDate, endDate }: Props) {
    const session = await getSession();

    if (!session) {
        redirect("/");
    }

    const userId = session.user.id;
    const sensorId = await getElectricitySensorIdForUser(userId);

    if (!sensorId) {
        throw new Error("Kein Stromsensor für diesen Benutzer gefunden");
    }

    const energyData = await getEnergyDataForSensor(startDate, endDate, sensorId);
    const userData = await getUserData(session.user.id);
    const price = userData?.user_data.basePrice;
    const absolut = energyData.reduce((acc, cur) => acc + cur.value, 0) / 1000;
    const cost: number | null = price ? parseFloat((absolut * price).toFixed(2)) : null;

    const monthlyPayment = userData?.user_data.monthlyPayment;

    const calculatePayment = () => {
        if (monthlyPayment !== undefined && monthlyPayment !== null) {
            const startYear = startDate.getFullYear();
            const endYear = endDate.getFullYear();
            const startMonth = startDate.getMonth();
            const endMonth = endDate.getMonth();
    
            let totalAmount = 0;
    
            for (let year = startYear; year <= endYear; year++) {

                const monthStart = (year === startYear) ? startMonth : 0;
                const monthEnd = (year === endYear) ? endMonth : 11;
    
                for (let month = monthStart; month <= monthEnd; month++) {
                    
                    const firstDayOfMonth = (year === startYear && month === startMonth) ? startDate.getDate() : 1;
                    const lastDayOfMonth = (year === endYear && month === endMonth) ? endDate.getDate() : new Date(year, month + 1, 0).getDate();
                    const daysPerMonth = new Date(year, month + 1, 0).getDate();
                    const paymentPerDay = monthlyPayment / daysPerMonth
                    const daysInMonth = lastDayOfMonth - firstDayOfMonth + 1;
                    const paymentPerMonth = paymentPerDay * daysInMonth
                    totalAmount += paymentPerMonth;

                }
            }
            return totalAmount.toFixed(2);
        }
    };

    const calculateTotalConsumptionCurrentMonth = (data: EnergyEntry[]): number => {
        const currentDate = new Date();
        const currentMonthConsumptions = data.filter((entry: EnergyEntry) => {
            const entryDate = entry.timestamp ? new Date(entry.timestamp) : null;
            return entryDate && entryDate.getMonth() === currentDate.getMonth() && entryDate.getFullYear() === currentDate.getFullYear();
        });
        const totalConsumption = currentMonthConsumptions.reduce((total, entry) => total + entry.value, 0);
      
        return totalConsumption;
      };


    const calculatePredictedCost = (): number => {
        const today: Date = new Date();
        const firstDayOfMonth: Date = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayOfMonth: Date = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const daysPassed: number = Math.floor((today.getTime() - firstDayOfMonth.getTime()) / (24 * 60 * 60 * 1000)) + 1;

        const totalConsumptionCurrentMonth = calculateTotalConsumptionCurrentMonth(energyData);
        const monthlyUsage: number = (totalConsumptionCurrentMonth / daysPassed) * lastDayOfMonth.getDate();
        const daysRemaining: number = lastDayOfMonth.getDate() - daysPassed;

        const predictedConsumption: number = ((monthlyUsage / daysPassed) * daysRemaining) / 1000;
        const predictedCost: number | null = price ? parseFloat((predictedConsumption * price).toFixed(2)) : null;

        return (cost ?? 0) + (predictedCost ?? 0);
    };
    
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
                    <>
                        <h1 className="text-center text-2xl font-bold text-primary">{cost} €</h1>
                        <p className={`text-center ${Number(cost) > Number(calculatePayment()) ? 'text-red-500' : 'white'}`}>Abschlag: {calculatePayment()} €</p>
                        <p className="text-center">Hochrechnung 0{new Date().getMonth()+1}.{new Date().getFullYear()}: {calculatePredictedCost()} €</p>
                    </>
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
