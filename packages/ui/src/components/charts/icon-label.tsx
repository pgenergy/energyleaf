import { FC } from "react";
import { GiWashingMachine } from 'react-icons/gi';
import { CiRouter } from "react-icons/ci";
import { BiFridge, BiSolidDryer } from "react-icons/bi";
import { LuMicrowave } from "react-icons/lu";
import { CgSmartHomeBoiler } from "react-icons/cg";
import { TbFreezeRow } from "react-icons/tb";

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
