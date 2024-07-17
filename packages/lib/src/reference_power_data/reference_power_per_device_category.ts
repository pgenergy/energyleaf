import { DeviceCategory } from "@energyleaf/db/types";
import type { DeviceCategoryPower } from "../types";

/**
 * Returns information about the average power consumption and purchase price of state of the art, middle priced examples
 * for a given device category
 * @param deviceCategory The device category for which the reference power and price data should be returned
 */
export function getReferencePowerDataForDeviceCategory(deviceCategory: DeviceCategory): DeviceCategoryPower {
    switch (deviceCategory) {
        case DeviceCategory.Stovetop:
            return {
                averagePower: 2000,
                minimumPower: 1500,
                maximumPower: 4000,
                linkToSource: "https://www.bluettipower.ph/blogs/news/how-many-watts-does-an-electric-stove-use",
                purchasePrice: 150,
            };
        case DeviceCategory.Oven:
            return {
                averagePower: 3300,
                minimumPower: 2000,
                maximumPower: 5000,
                linkToSource:
                    "https://www.energysage.com/electricity/house-watts/how-many-watts-does-an-electric-oven-and-stove-use/",
                purchasePrice: 400,
            };
        case DeviceCategory.Fridge:
            return {
                averagePower: 100,
                minimumPower: 80,
                maximumPower: 180,
                linkToSource:
                    "https://www.co2online.de/energie-sparen/strom-sparen/strom-sparen-stromspartipps/kuehlschrank/",
                purchasePrice: 600,
            };
        case DeviceCategory.Freezer:
            return {
                averagePower: 120,
                minimumPower: 100,
                maximumPower: 200,
                linkToSource: "https://solarwissen.selfmade-energy.com/wie-viel-strom-verbraucht-eine-gefriertruhe",
                purchasePrice: 450,
            };
        case DeviceCategory.Microwave:
            return {
                averagePower: 1000,
                minimumPower: 800,
                maximumPower: 1600,
                linkToSource:
                    "https://www.cnet.com/home/energy-and-utilities/oven-versus-microwave-which-kitchen-appliance-uses-less-energy/",
                purchasePrice: 100,
            };
        case DeviceCategory.Kettle:
            return {
                averagePower: 1500,
                minimumPower: 1200,
                maximumPower: 2500,
                linkToSource: "https://www.bluettipower.com/blogs/news/kettle-energy-consumption",
                purchasePrice: 40,
            };
        case DeviceCategory.Toaster:
            return {
                averagePower: 1000,
                minimumPower: 800,
                maximumPower: 1500,
                linkToSource: "https://www.anker.com/eu-de/blogs/portable-power/how-many-watts-does-a-toaster-use",
                purchasePrice: 30,
            };
        case DeviceCategory.CoffeeMachine:
            return {
                averagePower: 850,
                minimumPower: 550,
                maximumPower: 1200,
                linkToSource: "https://www.jackery.com/blogs/knowledge/how-many-watts-does-a-coffee-maker-use",
                purchasePrice: 50,
            };
        case DeviceCategory.AirFryer:
            return {
                averagePower: 1000,
                minimumPower: 900,
                maximumPower: 1800,
                linkToSource:
                    "https://www.endesa.com/en/blogs/endesa-s-blog/home-appliances/the-real-consumption-of-small-kitchen-appliances",
                purchasePrice: 65,
            };
        case DeviceCategory.Blender:
            return {
                averagePower: 1000,
                minimumPower: 800,
                maximumPower: 1800,
                linkToSource:
                    "https://www.endesa.com/en/blogs/endesa-s-blog/home-appliances/the-real-consumption-of-small-kitchen-appliances",
                purchasePrice: 50,
            };
        case DeviceCategory.Dishwasher:
            return {
                averagePower: 1800,
                minimumPower: 1200,
                maximumPower: 2400,
                linkToSource: "https://www.finishdishwashing.com/dishwasher-benefits/energy",
                purchasePrice: 450,
            };
        case DeviceCategory.WashingMachine:
            return {
                averagePower: 600,
                minimumPower: 400,
                maximumPower: 1500,
                linkToSource: "https://www.agwayenergy.com/blog/how-much-electricity-does-a-washer-and-dryer-use/",
                purchasePrice: 400,
            };
        case DeviceCategory.Dryer:
            return {
                averagePower: 2500,
                minimumPower: 1800,
                maximumPower: 5000,
                linkToSource: "https://www.agwayenergy.com/blog/how-much-electricity-does-a-washer-and-dryer-use/",
                purchasePrice: 400,
            };
        case DeviceCategory.VacuumCleaner:
            return {
                averagePower: 850,
                minimumPower: 500,
                maximumPower: 2000,
                linkToSource: "https://www.jackery.com/blogs/knowledge/how-many-watts-does-a-vacuum-use",
                purchasePrice: 150,
            };
        case DeviceCategory.Iron:
            return {
                averagePower: 1800,
                minimumPower: 500,
                maximumPower: 3000,
                linkToSource: "https://www.crompton.co.in/blogs/home-appliances/iron-wattage",
                purchasePrice: 45,
            };
        case DeviceCategory.TVsAndMonitors:
            return {
                averagePower: 70,
                minimumPower: 50,
                maximumPower: 200,
                linkToSource: "https://www.jackery.com/blogs/knowledge/how-many-watts-does-a-tv-use",
                purchasePrice: 500,
            };
        case DeviceCategory.EntertainmentAndComputers:
            return {
                averagePower: 200,
                minimumPower: 50,
                maximumPower: 400,
                linkToSource: "https://www.energysage.com/electricity/house-watts/how-many-watts-does-a-computer-use/",
                purchasePrice: 500,
            };
        case DeviceCategory.HairDryer:
            return {
                averagePower: 1800,
                minimumPower: 1400,
                maximumPower: 2500,
                linkToSource: "https://www.canstarblue.com.au/electricity/hair-dryer-electricity-usage/",
                purchasePrice: 50,
            };
        case DeviceCategory.BodyCare:
            return {
                averagePower: 40,
                minimumPower: 20,
                maximumPower: 100,
                linkToSource: "https://www.slashplan.com/shaver-energy-calculator-cost-and-kwh-usage",
                purchasePrice: 50,
            };
        case DeviceCategory.HeaterFan:
            return {
                averagePower: 1500,
                minimumPower: 750,
                maximumPower: 3000,
                linkToSource: "https://www.homebuilding.co.uk/advice/how-much-does-it-cost-to-run-a-fan-heater",
                purchasePrice: 50,
            };
        case DeviceCategory.ElectricHeater:
            return {
                averagePower: 1500,
                minimumPower: 750,
                maximumPower: 2500,
                linkToSource: "https://www.schwaebisch-hall.de/ratgeber/heizen-und-baustoffe/heizungsarten/elektroheizung.html",
                purchasePrice: 150,
            };
        case DeviceCategory.AirConditioning:
            return {
                averagePower: 2000,
                minimumPower: 750,
                maximumPower: 4000,
                linkToSource: "https://www.inspirecleanenergy.com/blog/sustainable-living/how-much-electricity-does-air-conditioning-use",
                purchasePrice: 450,
            };
        case DeviceCategory.HeatPump:
            return {
                averagePower: 5000,
                minimumPower: 4000,
                maximumPower: 10000,
                linkToSource: "https://waermepumpe-bwp.de/waermepumpe-wieviel-kw-pro-m2/",
                purchasePrice: 20000,
            };
        case DeviceCategory.Lighting:
            return {
                averagePower: 10,
                minimumPower: 5,
                maximumPower: 15,
                linkToSource: "https://www.energysage.com/electricity/house-watts/how-many-watts-does-a-light-bulb-use/",
                purchasePrice: 20,
            };
        case DeviceCategory.ECar:
            return {
                averagePower: 7000,
                minimumPower: 5000,
                maximumPower: 9000,
                linkToSource: "https://www.energysage.com/electricity/house-watts/how-many-watts-does-an-electric-car-charger-use/",
                purchasePrice: 30000,
            };
        case DeviceCategory.EMobility:
            return {
                averagePower: 250,
                minimumPower: 100,
                maximumPower: 700,
                linkToSource: "https://rebeinlaw.com/how-much-does-it-cost-to-charge-an-electric-scooter",
                purchasePrice: 400,
            };
        case DeviceCategory.Further:
            return {
                averagePower: 50,
                minimumPower: 10,
                maximumPower: 100,
                linkToSource: "",
                purchasePrice: 60,
            };
    }
}
