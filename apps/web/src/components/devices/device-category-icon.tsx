import { DeviceCategory } from "@energyleaf/postgres/types";
import { cn } from "@energyleaf/tailwindcss/utils";
import {
    coffeemaker,
    dishwasher,
    hairdryer,
    iron,
    kettleElectric,
    razor,
    refrigeratorFreezer,
    toaster,
} from "@lucide/lab";
import {
    AirVent,
    Bike,
    Car,
    CookingPot,
    Ellipsis,
    Fan,
    Heater,
    Icon,
    Lamp,
    Laptop,
    Microwave,
    Refrigerator,
    Tv,
    WashingMachine,
} from "lucide-react";
import Fryer from "./icons/fryer";
import HeatPump from "./icons/heat-pump";
import HeatingCoil from "./icons/heating-coil";
import LaundryDryer from "./icons/laundy-dryer";
import Oven from "./icons/oven";
import VacuumCleaner from "./icons/vacuum-cleaner";

interface Props {
    category: DeviceCategory;
    className?: string;
}

export default function DeviceCategoryIcon({ category, className }: Props) {
    className = cn("h-6 w-6", className);
    switch (category) {
        case DeviceCategory.Stovetop:
            return <Heater className={className} />;
        case DeviceCategory.Oven:
            return <Oven className={className} />;
        case DeviceCategory.AirFryer:
            return <Fryer className={className} />;
        case DeviceCategory.Fridge:
            return <Refrigerator className={className} />;
        case DeviceCategory.Freezer:
            return <Icon iconNode={refrigeratorFreezer} className={className} />;
        case DeviceCategory.Microwave:
            return <Microwave className={className} />;
        case DeviceCategory.Kettle:
            return <Icon iconNode={kettleElectric} className={className} />;
        case DeviceCategory.Toaster:
            return <Icon iconNode={toaster} className={className} />;
        case DeviceCategory.CoffeeMachine:
            return <Icon iconNode={coffeemaker} className={className} />;
        case DeviceCategory.Blender:
            return <CookingPot className={className} />;
        case DeviceCategory.Dishwasher:
            return <Icon iconNode={dishwasher} className={className} />;
        case DeviceCategory.WashingMachine:
            return <WashingMachine className={className} />;
        case DeviceCategory.Dryer:
            return <LaundryDryer className={className} />;
        case DeviceCategory.VacuumCleaner:
            return <VacuumCleaner className={className} />;
        case DeviceCategory.Iron:
            return <Icon iconNode={iron} className={className} />;
        case DeviceCategory.TVsAndMonitors:
            return <Tv className={className} />;
        case DeviceCategory.EntertainmentAndComputers:
            return <Laptop className={className} />;
        case DeviceCategory.HairDryer:
            return <Icon iconNode={hairdryer} className={className} />;
        case DeviceCategory.BodyCare:
            return <Icon iconNode={razor} className={className} />;
        case DeviceCategory.HeaterFan:
            return <Fan className={className} />;
        case DeviceCategory.ElectricHeater:
            return <HeatingCoil className={className} />;
        case DeviceCategory.AirConditioning:
            return <AirVent className={className} />;
        case DeviceCategory.HeatPump:
            return <HeatPump className={className} />;
        case DeviceCategory.Lighting:
            return <Lamp className={className} />;
        case DeviceCategory.ECar:
            return <Car className={className} />;
        case DeviceCategory.EMobility:
            return <Bike className={className} />;
        case DeviceCategory.Others:
            return <Ellipsis className={className} />;
        default:
            return null;
    }
}
