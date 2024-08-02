export const energyRangeOptions = {
    today: "Heute",
    week: "Diese Woche",
    month: "Diesen Monat",
    custom: "Individuell",
    compare: "Vergleichen",
};

export type EnergyRangeOptionType = keyof typeof energyRangeOptions;
export const energyRangeOptionKeys = Object.keys(energyRangeOptions) as EnergyRangeOptionType[];
