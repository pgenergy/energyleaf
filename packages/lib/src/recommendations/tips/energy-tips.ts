import { DeviceCategory, DeviceSuperCategory, getDeviceCategories } from "@energyleaf/db/types";
import { getEnergyTip } from "./energy-tip-definitions";
import { EnergyTipKey } from "./energy-tip-key";

function getEnergyTipsInRange(regionIndex: number): EnergyTipKey[] {
    const regionSize = 10;
    return Array.from({ length: regionSize }, (_, i) => i + regionIndex * regionSize).filter((x) => x in EnergyTipKey);
}

function appendTipsByDevices(tips: EnergyTipKey[], deviceCategories: DeviceCategory[]) {
    if (deviceCategories.length === 0) {
        return;
    }

    if (deviceCategories.includes(DeviceCategory.Stovetop)) {
        tips.push(...getEnergyTipsInRange(0));
    }

    if (deviceCategories.includes(DeviceCategory.Oven)) {
        tips.push(...getEnergyTipsInRange(1));
    }

    const includesFridge = deviceCategories.includes(DeviceCategory.Fridge);
    const includesFreezer = deviceCategories.includes(DeviceCategory.Freezer);
    if (includesFridge || includesFreezer) {
        tips.push(...getEnergyTipsInRange(2));
    }

    if (includesFridge) {
        tips.push(...getEnergyTipsInRange(3));
    }

    if (deviceCategories.includes(DeviceCategory.Microwave)) {
        tips.push(...getEnergyTipsInRange(4));
    }

    if (deviceCategories.includes(DeviceCategory.Kettle)) {
        tips.push(...getEnergyTipsInRange(5));
    }

    if (deviceCategories.includes(DeviceCategory.CoffeeMachine)) {
        tips.push(...getEnergyTipsInRange(6));
    }

    if (deviceCategories.includes(DeviceCategory.AirFryer)) {
        tips.push(...getEnergyTipsInRange(7));
    }

    if (deviceCategories.includes(DeviceCategory.Blender)) {
        tips.push(...getEnergyTipsInRange(8));
    }

    if (deviceCategories.includes(DeviceCategory.Dishwasher)) {
        tips.push(...getEnergyTipsInRange(9));
    }

    if (deviceCategories.includes(DeviceCategory.WashingMachine)) {
        tips.push(...getEnergyTipsInRange(10));
    }

    if (deviceCategories.includes(DeviceCategory.Dryer)) {
        tips.push(...getEnergyTipsInRange(11));
    }

    if (deviceCategories.includes(DeviceCategory.VacuumCleaner)) {
        tips.push(...getEnergyTipsInRange(12));
    }

    if (deviceCategories.includes(DeviceCategory.Iron)) {
        tips.push(...getEnergyTipsInRange(13));
    }

    const entertainmentSuperCategoryItems = getDeviceCategories(DeviceSuperCategory.Entertainment);
    if (deviceCategories.some((deviceCategory) => entertainmentSuperCategoryItems.includes(deviceCategory))) {
        tips.push(...getEnergyTipsInRange(14));
    }

    if (deviceCategories.includes(DeviceCategory.TVsAndMonitors)) {
        tips.push(...getEnergyTipsInRange(15));
    }

    if (deviceCategories.includes(DeviceCategory.EntertainmentAndComputers)) {
        tips.push(...getEnergyTipsInRange(16));
    }

    if (deviceCategories.includes(DeviceCategory.HairDryer)) {
        tips.push(...getEnergyTipsInRange(17));
    }

    const climateControlSuperCategoryItems = getDeviceCategories(DeviceSuperCategory.ClimateControl);
    if (deviceCategories.some((deviceCategory) => climateControlSuperCategoryItems.includes(deviceCategory))) {
        tips.push(...getEnergyTipsInRange(18));
    }

    if (deviceCategories.includes(DeviceCategory.Lighting)) {
        tips.push(...getEnergyTipsInRange(19));
    }

    if (deviceCategories.includes(DeviceCategory.ECar)) {
        tips.push(...getEnergyTipsInRange(20));
    }

    if (deviceCategories.includes(DeviceCategory.EMobility)) {
        tips.push(...getEnergyTipsInRange(21));
    }
}

export function getRelevantTips(deviceCategory: DeviceCategory[]) {
    const tips = getEnergyTipsInRange(22);
    appendTipsByDevices(tips, deviceCategory);
    return tips.map((tipKey) => getEnergyTip(tipKey));
}
