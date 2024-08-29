import type { sensorDataTable, sensorTable } from "../schema/sensor";

export type SensorDataSelectType = typeof sensorDataTable.$inferSelect;

export type SensorInsertType = typeof sensorTable.$inferInsert;

export enum DeviceCategory {
    Stovetop = "stovetop",
    Oven = "oven",
    Fridge = "fridge",
    Freezer = "freezer",
    Microwave = "microwave",
    Kettle = "kettle",
    Toaster = "toaster",
    CoffeeMachine = "coffeeMachine",
    AirFryer = "airFryer",
    Blender = "blender",
    Dishwasher = "dishwasher",
    WashingMachine = "washingMachine",
    Dryer = "dryer",
    VacuumCleaner = "vacuumCleaner",
    Iron = "iron",
    TVsAndMonitors = "tvsAndMonitors",
    EntertainmentAndComputers = "entertainmentAndComputers",
    HairDryer = "hairDryer",
    BodyCare = "bodyCare",
    HeaterFan = "heaterFan",
    ElectricHeater = "electricHeater",
    AirConditioning = "airConditioning",
    HeatPump = "heatPump",
    Lighting = "lighting",
    ECar = "eCar",
    EMobility = "eMobility",
    Others = "others",
}

export enum SensorType {
    Electricity = "electricity",
    Gas = "gas",
}