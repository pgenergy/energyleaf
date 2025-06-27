import { eq } from "drizzle-orm";
import { all, create, type MathJsInstance, type Matrix } from "mathjs";
import { db } from "../db";
import { Device, deviceTable, deviceToPeakTable } from "../db/tables/device";
import { energyDataSequenceTable } from "../db/tables/sensor";
import { userDataTable } from "../db/tables/user";

function linearRegression(A: (1 | 0)[][], b: number[][]) {
	const math = create(all, {});
	const AMatrix = math.matrix(A);
	const bMatrix = math.matrix(b);

	const solution = solveLeastSquaresProblem(math, AMatrix, bMatrix);
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

interface Peak {
	sequence: string;
	devices: string[];
	power: number;
}

function estimateDevicePowers(devices: Device[], peaks: Peak[]) {
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

export async function updatePowerOfDevices(userId: string) {
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
				{} as { [key: string]: { sequence: string; devices: string[]; power: number } }
			)
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
			return;
		}

		const { result, rSquared, estimatedDeviceIds } = powerEstimationResult;

		for (const deviceId of estimatedDeviceIds) {
			const powerEstimationRaw = result.find((r) => r[deviceId])?.[deviceId];
			const powerEstimation = powerEstimationRaw ? Number(powerEstimationRaw) : null;
			const correctedPowerEstimation = powerEstimation && powerEstimation >= 0 ? powerEstimation : null; // power needs to be greater than 0.
			await trx.update(deviceTable).set({ power: correctedPowerEstimation }).where(eq(deviceTable.id, deviceId));
		}

		await trx
			.update(userDataTable)
			.set({ devicePowerEstimationRSquared: rSquared })
			.where(eq(userDataTable.userId, userId));
	});
}
