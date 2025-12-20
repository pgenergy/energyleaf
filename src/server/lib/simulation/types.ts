export interface EnergyPoint {
	id: string;
	sensorId: string;
	value: number;
	consumption: number;
	valueOut: number | null;
	inserted: number | null;
	valueCurrent: number | null;
	timestamp: Date;
}

export type EnergySeries = EnergyPoint[];
export type Simulation = (input: EnergySeries) => Promise<EnergySeries>;

export interface SimulationState {
	batteryChargeKwh?: number;
	evChargeKwh?: number;
}
