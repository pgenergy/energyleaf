import type { SensorDataSelectType } from "@energyleaf/db/types";
import type { DeviceClassification } from "@energyleaf/lib";

export const mockClassifyDeviceUsage = async (sensorData: SensorDataSelectType[]): Promise<DeviceClassification[]> => {
    return [
        {
            timestamp: "2024-07-16T00:00:00.000Z",
            power: 3,
            dominantClassification: "fridge",
            classification: {
                router: 0.38,
                washing_machine: 0.77,
                freezer: 0.03,
                micro_wave: 0,
                boiler: 0.02,
                fridge: 98.75,
                dryer: 0.04,
            },
        },
        {
            timestamp: "2024-07-20T00:00:00.000Z",
            power: 4,
            dominantClassification: "router",
            classification: {
                router: 87.2,
                washing_machine: 2.53,
                freezer: 0.41,
                micro_wave: 0.3,
                boiler: 2.07,
                fridge: 6.87,
                dryer: 0.62,
            },
        },
        {
            timestamp: "2024-07-21T00:00:00.000Z",
            power: 71,
            dominantClassification: "router",
            classification: {
                router: 99.99,
                washing_machine: 0.01,
                freezer: 0,
                micro_wave: 0,
                boiler: 0,
                fridge: 0,
                dryer: 0,
            },
        },
    ];
};
