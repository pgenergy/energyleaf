import {getConsumptionBySensor, getElectricitySensorByUser} from "@/actions/user";
import {EnergyConsumptionChart} from "@energyleaf/ui/components/charts";

interface Props {
    userId: number;
}

export default async function UserConsumptionCardContent({ userId }: Props) {
    const sensorId = await getElectricitySensorByUser(userId);
    if (!sensorId) {
        return <h1 className="text-center text-2xl font-bold text-primary">Keine Sensoren gefunden</h1>
    }

    const energyData = await getConsumptionBySensor(sensorId);
    const data = energyData.map((entry) => ({
        sensorId: entry.sensorId || 0,
        energy: entry.value,
        timestamp: entry.timestamp.toString(),
    }));

    return <div className="h-96 w-full">
        <EnergyConsumptionChart data={data}/>
    </div>;
}