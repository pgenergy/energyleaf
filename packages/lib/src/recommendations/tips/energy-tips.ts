import { DeviceCategory, DeviceSuperCategory, getDeviceCategories } from "@energyleaf/db/types";
import { getEnergyTip } from "./energy-tip-definitions";
import { type EnergyTipKey, EnergyTipKeyRegions, getEnergyTipsInRegion } from "./energy-tip-key";

function appendTipsByDevices(tips: EnergyTipKey[], deviceCategories: DeviceCategory[]) {
    if (deviceCategories.length === 0) {
        return;
    }

    if (deviceCategories.includes(DeviceCategory.Stovetop)) {
        tips.push(...getEnergyTipsInRegion(EnergyTipKeyRegions.Stovetop));
    }

    if (deviceCategories.includes(DeviceCategory.Oven)) {
        tips.push(...getEnergyTipsInRegion(EnergyTipKeyRegions.Oven));
    }

    const includesFridge = deviceCategories.includes(DeviceCategory.Fridge);
    const includesFreezer = deviceCategories.includes(DeviceCategory.Freezer);
    if (includesFridge || includesFreezer) {
        tips.push(...getEnergyTipsInRegion(EnergyTipKeyRegions.FridgeAndFreezer));
    }

    if (includesFridge) {
        tips.push(...getEnergyTipsInRegion(EnergyTipKeyRegions.Fridge));
    }

    if (deviceCategories.includes(DeviceCategory.Microwave)) {
        tips.push(...getEnergyTipsInRegion(EnergyTipKeyRegions.Microwave));
    }

    if (deviceCategories.includes(DeviceCategory.Kettle)) {
        tips.push(...getEnergyTipsInRegion(EnergyTipKeyRegions.Kettle));
    }

    if (deviceCategories.includes(DeviceCategory.CoffeeMachine)) {
        tips.push(...getEnergyTipsInRegion(EnergyTipKeyRegions.CoffeeMachine));
    }

    if (deviceCategories.includes(DeviceCategory.AirFryer)) {
        tips.push(...getEnergyTipsInRegion(EnergyTipKeyRegions.AirFryer));
    }

    if (deviceCategories.includes(DeviceCategory.Blender)) {
        tips.push(...getEnergyTipsInRegion(EnergyTipKeyRegions.Blender));
    }

    if (deviceCategories.includes(DeviceCategory.Dishwasher)) {
        tips.push(...getEnergyTipsInRegion(EnergyTipKeyRegions.Dishwasher));
    }

    if (deviceCategories.includes(DeviceCategory.WashingMachine)) {
        tips.push(...getEnergyTipsInRegion(EnergyTipKeyRegions.WashingMachine));
    }

    if (deviceCategories.includes(DeviceCategory.Dryer)) {
        tips.push(...getEnergyTipsInRegion(EnergyTipKeyRegions.Dryer));
    }

    if (deviceCategories.includes(DeviceCategory.VacuumCleaner)) {
        tips.push(...getEnergyTipsInRegion(EnergyTipKeyRegions.VacuumCleaner));
    }

    if (deviceCategories.includes(DeviceCategory.Iron)) {
        tips.push(...getEnergyTipsInRegion(EnergyTipKeyRegions.Iron));
    }

    const entertainmentSuperCategoryItems = getDeviceCategories(DeviceSuperCategory.Entertainment);
    if (deviceCategories.some((deviceCategory) => entertainmentSuperCategoryItems.includes(deviceCategory))) {
        tips.push(...getEnergyTipsInRegion(EnergyTipKeyRegions.Entertainment));
    }

    if (deviceCategories.includes(DeviceCategory.TVsAndMonitors)) {
        tips.push(...getEnergyTipsInRegion(EnergyTipKeyRegions.TVsAndMonitors));
    }

    if (deviceCategories.includes(DeviceCategory.EntertainmentAndComputers)) {
        tips.push(...getEnergyTipsInRegion(EnergyTipKeyRegions.EntertainmentAndComputers));
    }

    if (deviceCategories.includes(DeviceCategory.HairDryer)) {
        tips.push(...getEnergyTipsInRegion(EnergyTipKeyRegions.HairDryer));
    }

    const climateControlSuperCategoryItems = getDeviceCategories(DeviceSuperCategory.ClimateControl);
    if (deviceCategories.some((deviceCategory) => climateControlSuperCategoryItems.includes(deviceCategory))) {
        tips.push(...getEnergyTipsInRegion(EnergyTipKeyRegions.ClimateControl));
    }

    if (deviceCategories.includes(DeviceCategory.Lighting)) {
        tips.push(...getEnergyTipsInRegion(EnergyTipKeyRegions.Lighting));
    }

    if (deviceCategories.includes(DeviceCategory.ECar)) {
        tips.push(...getEnergyTipsInRegion(EnergyTipKeyRegions.ECar));
    }

    if (deviceCategories.includes(DeviceCategory.EMobility)) {
        tips.push(...getEnergyTipsInRegion(EnergyTipKeyRegions.EMobility));
    }
}

export function getTipsByDeviceCategory(deviceCategory: DeviceCategory) {
    const tips: EnergyTipKey[] = [];
    appendTipsByDevices(tips, [deviceCategory]);
    return tips.map((tipKey) => getEnergyTip(tipKey));
}

export function getRelevantTips(deviceCategory: DeviceCategory[]) {
    const tips = getEnergyTipsInRegion(EnergyTipKeyRegions.Common);
    appendTipsByDevices(tips, deviceCategory);
    return tips.map((tipKey) => getEnergyTip(tipKey));
}
