import type { SensorDataSelectType, UserDataSelectType } from "@energyleaf/postgres/types";
import { differenceInMilliseconds } from "date-fns";

export function calculateCosts(userData: UserDataSelectType, sensorData: SensorDataSelectType[]) {
    if (sensorData.length === 0) {
        return { totalCost: 0, totalWorkingCost: 0, totalBasePrice: 0 };
    }

    const minDate = new Date(sensorData[0].timestamp);
    const maxDate = new Date(sensorData[sensorData.length - 1].timestamp);
    const timeDiff = Math.abs(differenceInMilliseconds(maxDate, minDate));

    const workingPrice = userData?.workingPrice ?? 0;
    const totalWorkingCost = sensorData.reduce((acc, cur) => {
        return acc + cur.consumption * workingPrice;
    }, 0);

    const totalBasePrice = ((userData.basePrice ?? 0) / 30 / 24 / 60 / 60 / 1000) * timeDiff;
    const totalCost = totalWorkingCost + totalBasePrice;
    return { totalCost, totalWorkingCost, totalBasePrice };
}
