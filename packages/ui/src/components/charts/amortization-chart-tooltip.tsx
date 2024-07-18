import type { TooltipProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { useChart } from "../../ui/chart";

interface Props {
    tooltipProps: TooltipProps<ValueType, NameType>;
}

export default function AmortizationChartTooltip({ tooltipProps }: Props) {
    const { config } = useChart();
    const payload = tooltipProps.payload;
    const data = payload?.[0]?.payload as { before: number; after: number; timestamp: string };

    if (!data) {
        return null;
    }

    return (
        <div className="z-10 flex flex-col gap-2 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
            <p className="font-bold">Woche {data.timestamp}</p>
            <div className="flex flex-row items-center gap-1">
                <div
                    className="h-2.5 w-2.5 shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]"
                    style={
                        {
                            "--color-bg": config.before.color,
                        } as React.CSSProperties
                    }
                />
                <p className="text-sm">
                    <span className="font-bold">Vorher:</span> {data.before.toFixed(4)}{" "}
                </p>
            </div>
            <div className="flex flex-row items-center gap-1">
                <div
                    className="h-2.5 w-2.5 shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]"
                    style={
                        {
                            "--color-bg": config.after.color,
                        } as React.CSSProperties
                    }
                />
                <p className="text-sm">
                    <span className="font-bold">Nachher:</span> {data.after.toFixed(4)}{" "}
                </p>
            </div>
        </div>
    );
}
