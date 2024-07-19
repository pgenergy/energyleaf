import { Button } from "../../ui/button";

interface Props {
    active: boolean;
    chart: string;
    onClick: (chart: unknown) => void;
    label: React.ReactNode;
}

export default function ChartSwitchButton(props: Props) {
    return (
        <Button onClick={() => props.onClick(props.chart)} variant={props.active ? "outline" : "ghost"} size="sm">
            {props.label}
        </Button>
    );
}
