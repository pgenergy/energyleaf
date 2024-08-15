import CostPageCompareView from "@/components/costs/views/compare-view";
import { convertTZDate } from "@energyleaf/lib";
import { redirect } from "next/navigation";

export const maxDuration = 120;

interface Props {
    searchParams?: {
        date?: string;
        compareDate?: string;
    };
}

export default function CostComparePage(props: Props) {
    if (!props.searchParams?.date || !props.searchParams?.compareDate) {
        redirect("/costs");
    }
    const date = convertTZDate(new Date(props.searchParams.date), "client");
    const compareDate = convertTZDate(new Date(props.searchParams.compareDate), "client");

    return <CostPageCompareView date={date} compareDate={compareDate} />;
}
