import EnergyPageCompareView from "@/components/energy/views/compare-view";
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
    const date = new Date(props.searchParams.date);
    const compareDate = new Date(props.searchParams.compareDate);

    return <EnergyPageCompareView date={date} compareDate={compareDate} />;
}
