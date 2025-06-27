import { addDays, getDaysInMonth, getWeeksInMonth } from "date-fns";
import { EnergyData } from "../db/tables/sensor";

type TAggregation = "hour" | "day" | "week" | "month";

export type EnergyDataWithCost = EnergyData & { cost: number };

export function addCostToEnergy(
	data: EnergyData[],
	workingPrice: number,
	basePrice: number,
	agg: TAggregation = "month"
): EnergyDataWithCost[] {
	let baseCost = basePrice;
	if (agg === "hour") {
		baseCost = basePrice / getDaysInMonth(data[0].timestamp) / 24;
	}
	if (agg === "day") {
		baseCost = basePrice / getDaysInMonth(data[0].timestamp);
	}
	if (agg === "week") {
		baseCost = basePrice / getWeeksInMonth(data[0].timestamp);
	}

	return data.map((d) => {
		const cost = d.consumption * workingPrice + baseCost;
		return {
			...d,
			cost: Number(cost.toFixed(2)),
		};
	});
}

export function predictedCost(data: EnergyData[], remainingDays: number, workingPrice: number, basePrice: number) {
	function dft(signal: number[]) {
		const N = signal.length;
		const result = Array(N)
			.fill(0)
			.map(() => ({ re: 0, im: 0 }));

		for (let k = 0; k < N; k++) {
			for (let n = 0; n < N; n++) {
				const phi = (2 * Math.PI * k * n) / N;
				result[k].re += signal[n] * Math.cos(phi);
				result[k].im -= signal[n] * Math.sin(phi);
			}
		}

		return result;
	}

	function idft(spectrum: { re: number; im: number }[], length: number) {
		const N = spectrum.length;
		const signal = Array(length).fill(0);

		for (let n = 0; n < length; n++) {
			for (let k = 0; k < N; k++) {
				const phi = (2 * Math.PI * k * n) / N;
				signal[n] += spectrum[k].re * Math.cos(phi) - spectrum[k].im * Math.sin(phi);
			}
			signal[n] /= N;
		}

		return signal;
	}

	function predictWithDFT(values: number[], daysToPredict: number) {
		const spectrum = dft(values);
		const totalLength = values.length + daysToPredict;
		const extendedSignal = idft(spectrum, totalLength);
		return extendedSignal.slice(values.length);
	}

	const consumptionValues = data.map((d) => d.consumption);
	const predictedConsumptions = predictWithDFT(consumptionValues, remainingDays);
	const normalizedPredictions = predictedConsumptions.map((val) => Math.max(0, val));
	const baseCost = basePrice / getDaysInMonth(data[0].timestamp);
	return normalizedPredictions.map((val, i) => {
		const cost = val * workingPrice + baseCost;
		const date = new Date(data[data.length - 1].timestamp);
		return {
			cost: Number(cost.toFixed(2)),
			timestamp: addDays(date, i + 1),
		};
	});
}

export function totalCost(data: EnergyData[], workingPrice: number, basePrice: number, agg: TAggregation = "month") {
	let baseCost = basePrice;
	if (agg === "hour") {
		baseCost = basePrice / getDaysInMonth(data[0].timestamp) / 24;
	}
	if (agg === "day") {
		baseCost = basePrice / getDaysInMonth(data[0].timestamp);
	}
	if (agg === "week") {
		baseCost = basePrice / getWeeksInMonth(data[0].timestamp);
	}

	return data.reduce((acc, curr) => acc + (curr.consumption * workingPrice + baseCost), 0);
}
