import { linearRegression } from "./linear-regression";

interface Peak {
    sequence: string;
    devices: number[];
    power: number;
}

interface Device {
    id: number;
    power: number | null;
    isPowerEstimated: boolean;
}

export function estimateDevicePowers(devices: Device[], peaks: Peak[]) {
    const devicesWithFixedPower = devices.filter((device) => !device.isPowerEstimated);
    const deviceIdsWithFixedPower = devicesWithFixedPower.map((device) => device.id);

    const devicesWhosePowerNeedsToBeEstimated = devices.filter((device) => device.isPowerEstimated);
    const deviceIdsWhosePowerNeedsToBeEstimated = devicesWhosePowerNeedsToBeEstimated.map((device) => device.id);

    const peaksWithoutFixedPower = peaks
        .filter((peak) => !peak.devices.every((device) => deviceIdsWithFixedPower.includes(device)))
        .map((peak) => {
            let powerAdjustment = 0;
            for (const fixedDevice of devicesWithFixedPower) {
                if (peak.devices.includes(fixedDevice.id)) {
                    powerAdjustment += fixedDevice.power ?? 0;
                }
            }
            return { ...peak, power: peak.power - powerAdjustment }; // Remove power of fixed devices from the peak power.
        });

    if (peaksWithoutFixedPower.length === 0) {
        return null;
    }

    const A = peaksWithoutFixedPower.map((dp) => {
        return deviceIdsWhosePowerNeedsToBeEstimated.map((device) => (dp.devices.includes(device) ? 1 : 0));
    });
    const b = peaksWithoutFixedPower.map((dp) => [dp.power]);
    const { solution, rSquared } = linearRegression(A, b);

    // Extract the solution values
    const result = solution.map((value, index) => ({
        [deviceIdsWhosePowerNeedsToBeEstimated[index]]: (value as number[])[0],
    }));
    return {
        result,
        rSquared,
        estimatedDeviceIds: deviceIdsWhosePowerNeedsToBeEstimated,
    };
}
