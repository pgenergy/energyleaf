import { DeviceCategory } from "@/lib/enums";
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
	AirVentIcon,
	BikeIcon,
	CarIcon,
	CircleHelpIcon,
	CookingPotIcon,
	EllipsisIcon,
	FanIcon,
	FlameIcon,
	HeaterIcon,
	Icon,
	LampIcon,
	LaptopIcon,
	MicrowaveIcon,
	RefrigeratorIcon,
	TvIcon,
	UtensilsIcon,
	WashingMachineIcon,
} from "lucide-react";

export function DeviceCategoryToIcon(category: DeviceCategory, className?: string) {
	switch (category) {
		case DeviceCategory.Stovetop:
			return <HeaterIcon className={className} />;
		case DeviceCategory.Oven:
			return <FlameIcon className={className} />;
		case DeviceCategory.AirFryer:
			return <UtensilsIcon className={className} />;
		case DeviceCategory.Fridge:
			return <RefrigeratorIcon className={className} />;
		case DeviceCategory.Freezer:
			return <Icon iconNode={refrigeratorFreezer} className={className} />;
		case DeviceCategory.Microwave:
			return <MicrowaveIcon className={className} />;
		case DeviceCategory.Kettle:
			return <Icon iconNode={kettleElectric} className={className} />;
		case DeviceCategory.Toaster:
			return <Icon iconNode={toaster} className={className} />;
		case DeviceCategory.CoffeeMachine:
			return <Icon iconNode={coffeemaker} className={className} />;
		case DeviceCategory.Blender:
			return <CookingPotIcon className={className} />;
		case DeviceCategory.Dishwasher:
			return <Icon iconNode={dishwasher} className={className} />;
		case DeviceCategory.WashingMachine:
			return <WashingMachineIcon className={className} />;
		case DeviceCategory.Dryer:
			return <WashingMachineIcon className={className} />;
		case DeviceCategory.VacuumCleaner:
			return <AirVentIcon className={className} />;
		case DeviceCategory.Iron:
			return <Icon iconNode={iron} className={className} />;
		case DeviceCategory.TVsAndMonitors:
			return <TvIcon className={className} />;
		case DeviceCategory.EntertainmentAndComputers:
			return <LaptopIcon className={className} />;
		case DeviceCategory.HairDryer:
			return <Icon iconNode={hairdryer} className={className} />;
		case DeviceCategory.BodyCare:
			return <Icon iconNode={razor} className={className} />;
		case DeviceCategory.HeaterFan:
			return <FanIcon className={className} />;
		case DeviceCategory.ElectricHeater:
			return <HeaterIcon className={className} />;
		case DeviceCategory.AirConditioning:
			return <AirVentIcon className={className} />;
		case DeviceCategory.HeatPump:
			return <HeaterIcon className={className} />;
		case DeviceCategory.Lighting:
			return <LampIcon className={className} />;
		case DeviceCategory.ECar:
			return <CarIcon className={className} />;
		case DeviceCategory.EMobility:
			return <BikeIcon className={className} />;
		case DeviceCategory.Others:
			return <EllipsisIcon className={className} />;
		default:
			return <CircleHelpIcon className={className} />;
	}
}
