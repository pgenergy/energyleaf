import type { FC } from "react";

interface IconLabelProps {
    x: number;
    y: number;
    icon: React.ElementType;
}

const IconLabel: FC<IconLabelProps> = ({ x, y, icon: Icon }) => (
    <foreignObject x={x - 8} y={y - 24} width={32} height={32}>
        <Icon size={24} color="hsl(var(--chart-4))" />
    </foreignObject>
);

export default IconLabel;
