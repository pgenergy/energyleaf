import EnergyPageTodayView from "@/components/energy/views/today-view";
import { convertTZDate } from "@energyleaf/lib";
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
    const date = convertTZDate(new Date(props.searchParams.date), "client");

    return <EnergyPageTodayView initialDate={date} />;
}
