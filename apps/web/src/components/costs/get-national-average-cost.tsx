export function getNationalAverageCost(userData, days) {
    const { people, houseType = "apartment", hotWater = "not_electric" } = userData;

    const yearlyCosts = {
        house: {
            regular: [1015, 1265, 1520, 1690, 2110, 2304.5, 2566, 2827.5],
            withHotWater: [1140, 1480, 1900, 2155, 2660, 2981.5, 3353, 3724.5],
        },
        apartment: {
            regular: [590, 845, 1100, 1225, 1265, 1524, 1697, 1870],
            withHotWater: [720, 1180, 1520, 1775, 1900, 2305.5, 2601, 2896.5],
        },
    };

    if (people > 8) return null;

    const costArray = yearlyCosts[houseType]?.[hotWater === "electric" ? "withHotWater" : "regular"];
    if (!costArray) {
        console.error("Invalid houseType or hotWater settings", { houseType, hotWater });
        return null;
    }

    const annualCost = costArray[Math.min(people, costArray.length) - 1];
    return (annualCost / 365) * days;
}
