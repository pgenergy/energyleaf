import { getSession } from "@/lib/auth/auth.server";
import { getElectricitySensorIdForUser, getEnergyDataForSensor } from "@/query/energy";
import { getUserDataHistory } from "@/query/user";
import { redirect } from "next/navigation";
import ClientSidePage from "./client-page";

export const metadata = {
    title: "Kosten | Energyleaf",
};

export default async function CostsPage() {
    const { session, user } = await getSession();

    if (!session) {
        redirect("/");
    }

    const userId = user.id;
    const sensorId = await getElectricitySensorIdForUser(userId);
    if (!sensorId) {
        redirect("/");
    }

    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() - 2;
    if (month < 0) {
        month += 12;
        year -= 1;
    }

    const startDate = new Date(year, month, 1);
    const endDate = now;

    const energyDataRaw = await getEnergyDataForSensor(startDate, endDate, sensorId);
    const userData = await getUserDataHistory(userId);

    return <ClientSidePage userData={userData} energyDataRaw={energyDataRaw} sensorId={sensorId} />;
}
