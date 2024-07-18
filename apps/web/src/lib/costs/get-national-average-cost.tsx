function validateInputs(userData, days) {
    if (typeof userData !== "object" || userData === null) {
        throw new Error("Invalid input: userData must be an object.");
    }
    if (!Number.isInteger(days) || days < 1) {
        throw new Error("Invalid input: days must be a positive integer.");
    }
    if (!Object.prototype.hasOwnProperty.call(userData, "household")) {
        throw new Error("Missing household information in userData.");
    }
    if (!Number.isInteger(userData.household) || userData.household < 1 || userData.household > 8) {
        throw new Error("Invalid household size. Must be between 1 and 8.");
    }
}

export function getNationalAverageCost(userDatas, days) {
    if (!Array.isArray(userDatas) || userDatas.length === 0) {
        console.error("Invalid input: userData must be a non-empty array.");
        return null;
    }

    const userData = userDatas[1];

    try {
        validateInputs(userData, days);
    } catch (error) {
        console.error("Validation error:", error.message);
        return null;
    }

    const { household, property = "apartment", hotWater = "not_electric" } = userData;
    const yearlyCosts = getYearlyCosts();
    const costCategory = yearlyCosts[property]?.[hotWater === "electric" ? "withHotWater" : "regular"];

    if (!costCategory) {
        console.error("Invalid property or hot water settings", { property, hotWater });
        return null;
    }

    const annualCost = costCategory[household - 1];
    if (annualCost === undefined) {
        console.error("No annual cost found for the given household size.", { household });
        return null;
    }

    const dailyCost = annualCost / 365;
    return dailyCost * days;
}

function getYearlyCosts() {
    return {
        house: {
            regular: [1015, 1265, 1520, 1690, 2110, 2304.5, 2566, 2827.5],
            withHotWater: [1140, 1480, 1900, 2155, 2660, 2981.5, 3353, 3724.5],
        },
        apartment: {
            regular: [590, 845, 1100, 1225, 1265, 1524, 1697, 1870],
            withHotWater: [720, 1180, 1520, 1775, 1900, 2305.5, 2601, 2896.5],
        },
    };
}
