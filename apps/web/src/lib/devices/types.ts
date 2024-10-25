import type { DeviceCategory } from "@energyleaf/postgres/types";

export interface DeviceOption {
    id: string;
    category: DeviceCategory;
    name: string;
    isSelected: boolean;
    deviceId?: number;
}

export interface DeviceSelection {
    options: DeviceOption[];
}
