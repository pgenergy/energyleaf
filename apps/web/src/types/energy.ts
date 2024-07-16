export const energyRangeOptions = {
    today: "Heute",
    week: "Diese Woche",
    month: "Diesen Monat",
};

export type EnergyRangeOptionType = keyof typeof energyRangeOptions;
export const energyRangeOptionKeys = Object.keys(energyRangeOptions) as EnergyRangeOptionType[];
