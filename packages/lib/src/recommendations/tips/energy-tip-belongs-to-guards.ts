import { DeviceCategory, DeviceSuperCategory } from "@energyleaf/db/types";

export function isDeviceCategory(
    value: DeviceCategory | DeviceCategory[] | DeviceSuperCategory,
): value is DeviceCategory {
    return typeof value === "string" && Object.values(DeviceCategory).includes(value as DeviceCategory);
}

export function isDeviceCategoryArray(
    value: DeviceCategory | DeviceCategory[] | DeviceSuperCategory,
): value is DeviceCategory[] {
    return Array.isArray(value) && value.every(isDeviceCategory);
}

export function isDeviceSuperCategory(
    value: DeviceCategory | DeviceCategory[] | DeviceSuperCategory,
): value is DeviceSuperCategory {
    return typeof value === "string" && Object.values(DeviceSuperCategory).includes(value as DeviceSuperCategory);
}
