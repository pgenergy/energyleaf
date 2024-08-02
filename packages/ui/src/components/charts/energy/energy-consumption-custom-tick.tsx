import type { ReactElement, SVGProps } from "react";

interface Props {
    payload: {
        value: string;
    };
    svgProps: SVGProps<SVGTextElement>;
    tickFormatter: (value: string) => string | string[];
}

export default function EnergyConsumptionCustomTick({
    svgProps: { x, y },
    payload,
    tickFormatter,
}: Props): ReactElement<SVGElement, string> {
    console.log(payload);
    const formatted = tickFormatter(payload.value);
    const parts = Array.isArray(formatted) ? formatted : [formatted];

    return (
        <g transform={`translate(${x},${y})`}>
            <text className="items-center" x={0} y={0} dy={16}>
                {parts.map((part) => (
                    <tspan key={part} textAnchor="middle" x="0" dy="12">
                        {part}
                    </tspan>
                ))}
            </text>
        </g>
    );
}
