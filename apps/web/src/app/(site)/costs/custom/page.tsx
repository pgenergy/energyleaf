import CostPageTodayView from "@/components/costs/views/today-view";
import { convertTZDate } from "@energyleaf/lib";
import { redirect } from "next/navigation";

interface Props {
    searchParams?: {
        date?: string;
    };
}

export default function CostCustomPage(props: Props) {
    if (!props.searchParams?.date) {
        redirect("/energy");
    }
    const date = convertTZDate(new Date(props.searchParams.date), "client");

    return <CostPageTodayView initialDate={date} previousTitle="Zum Vortag" />;
}
