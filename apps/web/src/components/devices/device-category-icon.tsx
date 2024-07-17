import { DeviceCategory } from "@energyleaf/db/types";
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
    Microwave,
    Refrigerator,
    Tv,
    WashingMachine,
} from "lucide-react";
import HeatPump from "./icons/heat-pump";
import HeatingCoil from "./icons/heating-coil";
import LaundryDryer from "./icons/laundy-dryer";
import Oven from "./icons/oven";
import VacuumCleaner from "./icons/vacuum-cleaner";

interface Props {
    category: DeviceCategory;
}

export default function DeviceCategoryIcon({ category }: Props) {
    switch (category) {
        case DeviceCategory.Stovetop:
            return <Heater />;
        case DeviceCategory.Oven:
            return <Oven />;
        case DeviceCategory.Fridge:
            return <Refrigerator />;
        case DeviceCategory.Freezer:
            return <Icon iconNode={refrigeratorFreezer} />;
        case DeviceCategory.Microwave:
            return <Microwave />;
        case DeviceCategory.Kettle:
            return <Icon iconNode={kettleElectric} />;
        case DeviceCategory.Toaster:
            return <Icon iconNode={toaster} />;
        case DeviceCategory.CoffeeMachine:
            return <Icon iconNode={coffeemaker} />;
        case DeviceCategory.SmallKitchenAppliances:
            return <CookingPot />;
        case DeviceCategory.Dishwasher:
            return <Icon iconNode={dishwasher} />;
        case DeviceCategory.WashingMachine:
            return <WashingMachine />;
        case DeviceCategory.Dryer:
            return <LaundryDryer />;
        case DeviceCategory.VacuumCleaner:
            return <VacuumCleaner />;
        case DeviceCategory.Iron:
            return <Icon iconNode={iron} />;
        case DeviceCategory.EntertainmentAndComputers:
            return <Tv />;
        case DeviceCategory.HairDryer:
            return <Icon iconNode={hairdryer} />;
        case DeviceCategory.BodyCare:
            return <Icon iconNode={razor} />;
        case DeviceCategory.HeaterFan:
            return <Fan />;
        case DeviceCategory.ElectricHeater:
            return <HeatingCoil />;
        case DeviceCategory.AirConditioning:
            return <AirVent />;
        case DeviceCategory.HeatPump:
            return <HeatPump />;
        case DeviceCategory.Lighting:
            return <Lamp />;
        case DeviceCategory.ECar:
            return <Car />;
        case DeviceCategory.EMobility:
            return <Bike />;
        case DeviceCategory.Further:
            return <Ellipsis />;
        default:
            throw new Error("No icon for device category.");
    }
}
