import DevicesOverviewCard from "@/components/devices/devices-overview-card";

export const metadata = {
    title: "Geräte | Energyleaf",
};

export default function DevicesPage() {
    return (
        <div className="flex flex-col gap-4">
            <DevicesOverviewCard />
        </div>
    );
}
