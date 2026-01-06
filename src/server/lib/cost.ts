import { addDays, getDay, getDaysInMonth, getWeeksInMonth } from "date-fns";
import type { EnergyData } from "../db/tables/sensor";

type TAggregation = "hour" | "day" | "week" | "month";

export type PredictionResult = {
	cost: number;
	costMin: number;
	costMax: number;
	consumption: number;
	consumptionMin: number;
	consumptionMax: number;
	timestamp: Date;
};

export type EnergyDataWithCost = EnergyData & { cost: number };

export function addCostToEnergy(
	data: EnergyData[],
	workingPrice: number,
	basePrice: number,
	agg: TAggregation = "month",
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

export function predictedCostImproved(
	currentMonthData: EnergyData[],
	historicalData: EnergyData[] | null,
	remainingDays: number,
	workingPrice: number,
	basePrice: number,
): PredictionResult[] {
	if (currentMonthData.length === 0) {
		return [];
	}

	const baseCostPerDay = basePrice / getDaysInMonth(currentMonthData[0].timestamp);
	const lastDate = new Date(currentMonthData[currentMonthData.length - 1].timestamp);

	// Calculate weekday-based averages from available data
	const weekdayStats = calculateWeekdayStats(currentMonthData, historicalData);

	// Calculate weighted average for fallback (more recent data = higher weight)
	const weightedAvg = calculateWeightedAverage(currentMonthData);

	// Calculate overall variance for confidence intervals
	const allConsumptions = currentMonthData.map((d) => d.consumption);
	const overallStdDev = calculateStdDev(allConsumptions);

	const predictions: PredictionResult[] = [];

	for (let i = 1; i <= remainingDays; i++) {
		const predictedDate = addDays(lastDate, i);
		const dayOfWeek = getDay(predictedDate); // 0 = Sunday, 6 = Saturday

		const dayStats = weekdayStats.get(dayOfWeek);
		let predictedConsumption: number;
		let stdDev: number;

		if (dayStats && dayStats.count >= 2) {
			const weekdayWeight = Math.min(dayStats.count / 4, 1);
			predictedConsumption = weekdayWeight * dayStats.mean + (1 - weekdayWeight) * weightedAvg.mean;
			stdDev = dayStats.stdDev;
		} else {
			predictedConsumption = weightedAvg.mean;
			stdDev = overallStdDev;
		}

		predictedConsumption = Math.max(0, predictedConsumption);

		const confidenceMultiplier = 1.28;
		const consumptionMin = Math.max(0, predictedConsumption - confidenceMultiplier * stdDev);
		const consumptionMax = predictedConsumption + confidenceMultiplier * stdDev;

		const cost = predictedConsumption * workingPrice + baseCostPerDay;
		const costMin = consumptionMin * workingPrice + baseCostPerDay;
		const costMax = consumptionMax * workingPrice + baseCostPerDay;

		predictions.push({
			cost: Number(cost.toFixed(2)),
			costMin: Number(costMin.toFixed(2)),
			costMax: Number(costMax.toFixed(2)),
			consumption: Number(predictedConsumption.toFixed(4)),
			consumptionMin: Number(consumptionMin.toFixed(4)),
			consumptionMax: Number(consumptionMax.toFixed(4)),
			timestamp: predictedDate,
		});
	}

	return predictions;
}

function calculateWeekdayStats(
	currentData: EnergyData[],
	historicalData: EnergyData[] | null,
): Map<number, { mean: number; stdDev: number; count: number }> {
	const weekdayConsumptions = new Map<number, number[]>();

	for (let i = 0; i < 7; i++) {
		weekdayConsumptions.set(i, []);
	}

	for (const d of currentData) {
		const dayOfWeek = getDay(d.timestamp);
		weekdayConsumptions.get(dayOfWeek)?.push(d.consumption);
	}

	if (historicalData && historicalData.length > 0) {
		for (const d of historicalData) {
			const dayOfWeek = getDay(d.timestamp);
			weekdayConsumptions.get(dayOfWeek)?.push(d.consumption);
		}
	}

	const stats = new Map<number, { mean: number; stdDev: number; count: number }>();

	weekdayConsumptions.forEach((consumptions, dayOfWeek) => {
		if (consumptions.length > 0) {
			const mean = consumptions.reduce((a, b) => a + b, 0) / consumptions.length;
			const stdDev = calculateStdDev(consumptions);
			stats.set(dayOfWeek, { mean, stdDev, count: consumptions.length });
		}
	});

	return stats;
}

function calculateWeightedAverage(data: EnergyData[]): { mean: number; weights: number[] } {
	if (data.length === 0) {
		return { mean: 0, weights: [] };
	}

	const decayRate = 0.87;

	let weightedSum = 0;
	let totalWeight = 0;
	const weights: number[] = [];

	for (let i = 0; i < data.length; i++) {
		const recency = i;
		const weight = decayRate ** (data.length - 1 - recency);
		weights.push(weight);
		weightedSum += data[i].consumption * weight;
		totalWeight += weight;
	}

	return {
		mean: totalWeight > 0 ? weightedSum / totalWeight : 0,
		weights,
	};
}

function calculateStdDev(values: number[]): number {
	if (values.length < 2) {
		return 0;
	}

	const mean = values.reduce((a, b) => a + b, 0) / values.length;
	const squaredDiffs = values.map((v) => (v - mean) ** 2);
	const variance = squaredDiffs.reduce((a, b) => a + b, 0) / (values.length - 1);
	return Math.sqrt(variance);
}

export function calculatePredictionMetrics(
	currentMonthData: EnergyDataWithCost[],
	predictions: PredictionResult[],
	monthlyPayment: number | null,
	consumptionGoal: number | null,
	workingPrice: number,
	basePrice: number,
): {
	currentTotalCost: number;
	predictedTotalCost: number;
	predictedTotalCostMin: number;
	predictedTotalCostMax: number;
	dailyAverageCost: number;
	status: "on_track" | "warning" | "over_budget";
	percentageOfBudget: number | null;
	percentageOfGoal: number | null;
	projectedSavings: number | null;
} {
	const currentTotalCost = currentMonthData.reduce((sum, d) => sum + d.cost, 0);
	const predictedCostSum = predictions.reduce((sum, p) => sum + p.cost, 0);
	const predictedCostMinSum = predictions.reduce((sum, p) => sum + p.costMin, 0);
	const predictedCostMaxSum = predictions.reduce((sum, p) => sum + p.costMax, 0);

	const predictedTotalCost = currentTotalCost + predictedCostSum;
	const predictedTotalCostMin = currentTotalCost + predictedCostMinSum;
	const predictedTotalCostMax = currentTotalCost + predictedCostMaxSum;

	const dailyAverageCost = currentMonthData.length > 0 ? currentTotalCost / currentMonthData.length : 0;

	let status: "on_track" | "warning" | "over_budget" = "on_track";
	let percentageOfBudget: number | null = null;
	let percentageOfGoal: number | null = null;
	let projectedSavings: number | null = null;

	if (monthlyPayment && monthlyPayment > 0) {
		percentageOfBudget = (predictedTotalCost / monthlyPayment) * 100;

		if (percentageOfBudget > 100) {
			status = "over_budget";
		} else if (percentageOfBudget > 90) {
			status = "warning";
		}

		projectedSavings = monthlyPayment - predictedTotalCost;
	}

	if (consumptionGoal && consumptionGoal > 0) {
		const goalCost = consumptionGoal * workingPrice + basePrice;
		percentageOfGoal = (predictedTotalCost / goalCost) * 100;

		if (!monthlyPayment) {
			if (percentageOfGoal > 100) {
				status = "over_budget";
			} else if (percentageOfGoal > 90) {
				status = "warning";
			}
		}
	}

	return {
		currentTotalCost: Number(currentTotalCost.toFixed(2)),
		predictedTotalCost: Number(predictedTotalCost.toFixed(2)),
		predictedTotalCostMin: Number(predictedTotalCostMin.toFixed(2)),
		predictedTotalCostMax: Number(predictedTotalCostMax.toFixed(2)),
		dailyAverageCost: Number(dailyAverageCost.toFixed(2)),
		status,
		percentageOfBudget: percentageOfBudget ? Number(percentageOfBudget.toFixed(1)) : null,
		percentageOfGoal: percentageOfGoal ? Number(percentageOfGoal.toFixed(1)) : null,
		projectedSavings: projectedSavings ? Number(projectedSavings.toFixed(2)) : null,
	};
}
