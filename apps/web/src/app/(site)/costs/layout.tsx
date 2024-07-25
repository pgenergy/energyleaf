import CostPageRangeSelector from "@/components/costs/ui/cost-range-selector";

export const metadata = {
    title: "Kosten | Energyleaf",
};

interface Props {
    children: React.ReactNode;
}

export default function (props: Props) {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <h2 className="col-span-1 font-bold text-xl md:col-span-3">Kosten im Zeitraum</h2>
            <CostPageRangeSelector />
            {props.children}
            <h2 className="col-span-1 font-bold text-xl md:col-span-3">Durchschnittliche Kosten</h2>
        </div>
    );
}
