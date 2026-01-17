import { eq } from "drizzle-orm";
import { all, create, type MathJsInstance, type Matrix } from "mathjs";
import { db } from "../db";
import { type Device, deviceTable, deviceToPeakTable } from "../db/tables/device";
import { energyDataSequenceTable } from "../db/tables/sensor";
import { userDataTable } from "../db/tables/user";

const DEFAULT_RIDGE_LAMBDA = 1;

function linearRegression(A: (1 | 0)[][], b: number[][], prior?: number[], lambda = DEFAULT_RIDGE_LAMBDA) {
	const math = create(all, {});
	const AMatrix = math.matrix(A);
	const bMatrix = math.matrix(b);

	const solution = prior
		? solveRidgeRegressionProblem(math, AMatrix, bMatrix, prior, lambda)
		: solveLeastSquaresProblem(math, AMatrix, bMatrix);
	const rSquared = calculateRSquared(math, AMatrix, bMatrix, solution);

	return {
		solution: solution.toArray() as number[][],
		rSquared,
	};
}

function solveLeastSquaresProblem(math: MathJsInstance, AMatrix: Matrix, bMatrix: Matrix) {
	const At = math.transpose(AMatrix);
	const AtA = math.multiply(At, AMatrix);
	const Atb = math.multiply(At, bMatrix);
	return math.lusolve(AtA, Atb);
}

function solveRidgeRegressionProblem(
	math: MathJsInstance,
	AMatrix: Matrix,
	bMatrix: Matrix,
	prior: number[],
	lambda: number,
) {
	const At = math.transpose(AMatrix);
	const AtA = math.multiply(At, AMatrix);
	const rows = (AtA.size() as number[])[0];
	const identity = math.identity(rows);
	const ridgeMatrix = math.add(AtA, math.multiply(lambda, identity)) as Matrix;
	const Atb = math.multiply(At, bMatrix);
	const priorMatrix = math.matrix(prior.map((value) => [value]));
	const rightHandSide = math.add(Atb, math.multiply(lambda, priorMatrix)) as Matrix;
	return math.lusolve(ridgeMatrix, rightHandSide);
}

function calculateRSquared(math: MathJsInstance, AMatrix: Matrix, bMatrix: Matrix, solution: Matrix) {
	const residuals = math.subtract(bMatrix, math.multiply(AMatrix, solution));
	const subtraction = math.subtract(bMatrix, math.mean(bMatrix)) as Matrix;
	const SST = math.sum(math.map(subtraction, math.square));
	const SSR = math.sum(math.map(residuals, math.square));
	if (SST === 0) {
		return SSR === 0 ? 1 : 0;
	}
	return math.subtract(1, math.divide(SSR, SST)) as number;
}

function calculateConfidenceScore(rSquared: number, peakCount: number) {
	const normalizedRSquared = Math.max(0, Math.min(1, rSquared));
	const peakFactor = Math.min(1, peakCount / 5);
	return Math.round(normalizedRSquared * peakFactor * 100);
}

interface Peak {
	sequence: string;
	devices: string[];
	power: number;
}

export interface DevicePowerConfidence {
	deviceId: string;
	confidence: number;
	peaks: number;
}

function estimateDevicePowers(devices: Device[], peaks: Peak[]) {
	const deviceIdsWithInitialPower = new Map(
		devices
			.filter((device) => device.power !== null && device.power !== undefined)
			.map((device) => [device.id, Number(device.power)]),
	);

	const deviceIdsToEstimate = Array.from(new Set(peaks.flatMap((peak) => peak.devices)));
	const peaksWithoutFixedPower = peaks.filter((peak) => peak.power > 0);

	if (peaksWithoutFixedPower.length === 0) {
		return null;
	}

	const A = peaksWithoutFixedPower.map((dp) => {
		return deviceIdsToEstimate.map((deviceId) => (dp.devices.includes(deviceId) ? 1 : 0));
	});
	const b = peaksWithoutFixedPower.map((dp) => [dp.power]);
	const prior = deviceIdsToEstimate.map((deviceId) => deviceIdsWithInitialPower.get(deviceId) ?? 0);
	const { solution, rSquared } = linearRegression(A, b, prior);

	const result = solution.map((value, index) => ({
		[deviceIdsToEstimate[index]]: (value as number[])[0],
	}));

	const devicePeakCounts = deviceIdsToEstimate.map((deviceId) => ({
		deviceId,
		count: peaksWithoutFixedPower.filter((peak) => peak.devices.includes(deviceId)).length,
	}));

	const confidence = devicePeakCounts.map((devicePeak) => ({
		deviceId: devicePeak.deviceId,
		peaks: devicePeak.count,
		confidence: calculateConfidenceScore(rSquared, devicePeak.count),
	}));

	return {
		result,
		rSquared,
		estimatedDeviceIds: deviceIdsToEstimate,
		confidence,
	};
}

export async function updatePowerOfDevices(userId: string): Promise<Map<string, DevicePowerConfidence> | null> {
	return db.transaction(async (trx) => {
		const devicesWithPeaks = await trx
			.select()
			.from(deviceTable)
			.leftJoin(deviceToPeakTable, eq(deviceToPeakTable.deviceId, deviceTable.id))
			.leftJoin(energyDataSequenceTable, eq(energyDataSequenceTable.id, deviceToPeakTable.energyDataSequenceId))
			.where(eq(deviceTable.userId, userId));

		const flattenPeak = devicesWithPeaks
			.filter((x) => x.device_to_peak && x.energy_data_sequence)
			.map((device) => ({
				sequenceId: device.energy_data_sequence?.id ?? "",
				power: device.energy_data_sequence?.averagePeakPower ?? 0,
				device: device.device_to_peak?.deviceId ?? "",
			}));

		const peaks = Object.values(
			flattenPeak.reduce(
				(acc, obj) => {
					if (!acc[obj.sequenceId]) {
						acc[obj.sequenceId] = { sequence: obj.sequenceId, devices: [], power: obj.power };
					}
					acc[obj.sequenceId].devices.push(obj.device);
					return acc;
				},
				{} as { [key: string]: { sequence: string; devices: string[]; power: number } },
			),
		);

		const removeDuplicatesById = (devices: Device[]) => {
			const seen = new Set();
			return devices.filter((device) => {
				const isDuplicate = seen.has(device.id);
				seen.add(device.id);
				return !isDuplicate;
			});
		};

		const devices = removeDuplicatesById(devicesWithPeaks.map((device) => device.device));
		const powerEstimationResult = estimateDevicePowers(devices, peaks);
		if (!powerEstimationResult) {
			return null;
		}

		const { result, rSquared, estimatedDeviceIds, confidence } = powerEstimationResult;

		const confidenceMap = new Map(confidence.map((entry) => [entry.deviceId, entry]));

		for (const deviceId of estimatedDeviceIds) {
			const powerEstimationRaw = result.find((r) => r[deviceId])?.[deviceId];
			const powerEstimation = powerEstimationRaw ? Number(powerEstimationRaw) : null;
			const correctedPowerEstimation = powerEstimation && powerEstimation >= 0 ? powerEstimation : null; // power needs to be greater than 0.
			await trx
				.update(deviceTable)
				.set({ power: correctedPowerEstimation, isPowerEstimated: true })
				.where(eq(deviceTable.id, deviceId));
		}

		await trx
			.update(userDataTable)
			.set({ devicePowerEstimationRSquared: rSquared })
			.where(eq(userDataTable.userId, userId));

		return confidenceMap;
	});
}
