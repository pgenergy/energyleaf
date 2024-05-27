export const formatNumber = (number: number) =>
    number.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
