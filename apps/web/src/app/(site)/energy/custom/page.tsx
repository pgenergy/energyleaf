import EnergyPageTodayView from "@/components/energy/views/today-view";
import { redirect } from "next/navigation";

interface Props {
    searchParams?: {
        date?: string;
    };
}

export default function EnergyCustomPage(props: Props) {
    if (!props.searchParams?.date) {
        redirect("/energy");
    }
    const date = new Date(props.searchParams.date);

    return <EnergyPageTodayView initialDate={date} />;
}
