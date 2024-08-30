import type { DeviceCategory } from "@energyleaf/db/types";

export interface DeviceOption {
    id: string;
    category: DeviceCategory;
    name: string;
    isSuggested: boolean;
    isDraft: boolean;
    isSelected: boolean;
    deviceId?: number;
}

export interface DeviceSelection {
    hasSuggestions: boolean;
    options: DeviceOption[];
}
