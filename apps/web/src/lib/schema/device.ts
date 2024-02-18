import { z } from "zod";

export enum DeviceCategory {
  CoolingAndFreezing = "Kühl- und Gefriergeräte",
  CookingAndBaking = "Koch- und Backgeräte",
  CleaningAndLaundry = "Reinigungs- und Wäschegeräte",
  EntertainmentAndComputers = "Unterhaltungselektronik und Computer",
  SmallKitchenAppliances = "Kleingeräte Küche",
  ClimateAndHeating = "Klima- und Heizgeräte",
  Lighting = "Beleuchtung",
  Care = "Pflege",
}

export const deviceSchema = z.object({
  deviceName: z.string().min(1, { message: "Bitte gib einen Gerätenamen an." }),
  category: z.nativeEnum(DeviceCategory),
});
