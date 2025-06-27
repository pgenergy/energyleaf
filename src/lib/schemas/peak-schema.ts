import { z } from "zod";
import { DeviceCategory } from "../enums";

const peakDeviceSchema = z.object({
	id: z.string(),
	name: z.string(),
	category: z.nativeEnum(DeviceCategory),
});

export const addDeviceToPeakSchema = z.object({
	devices: z.array(peakDeviceSchema),
});
