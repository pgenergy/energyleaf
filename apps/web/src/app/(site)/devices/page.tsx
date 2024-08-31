import DevicesOverviewCard from "@/components/devices/devices-overview-card";
import { getSession } from "@/lib/auth/auth.server";
import { Versions, fulfills } from "@energyleaf/lib/versioning";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Geräte | Energyleaf",
};

export default async function DevicesPage() {
    const { user } = await getSession();

    if (!user || !fulfills(Versions.self_reflection, user.appVersion)) {
        redirect("/dashboard");
    }

    return (
        <div className="flex flex-col gap-4">
            <DevicesOverviewCard />
        </div>
    );
}
