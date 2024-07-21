import EnergyPageCompareView from "@/components/energy/views/compare-view";
import { convertTZDate } from "@energyleaf/lib";
import { redirect } from "next/navigation";

interface Props {
    searchParams?: {
        date?: string;
        compareDate?: string;
    };
}

export default function EnergyCustomPage(props: Props) {
    if (!props.searchParams?.date || !props.searchParams?.compareDate) {
        redirect("/energy");
    }
    const date = convertTZDate(new Date(props.searchParams.date), "client");
    const compareDate = convertTZDate(new Date(props.searchParams.compareDate), "client");

    return <EnergyPageCompareView date={date} compareDate={compareDate} />;
}
