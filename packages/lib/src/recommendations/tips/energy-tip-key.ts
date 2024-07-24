export enum EnergyTipKey {
    // Stovetop
    StovetopLid = 0,
    StovetopAmountOfWater = 1,
    StovetopReheat = 2,

    // Oven
    OvenConvection = 10,
    OvenPreventPreheat = 11,

    // Fridge and Freezer
    FridgeAndFreezerTemperature = 20,
    FridgeAndFreezerStoreCovered = 21,
    FridgeAndFreezerOpenBriefly = 22,
    FridgeAndFreezerOpenSeveralTimesForAShortTimeInsteadOfOnceForALongTime = 23,
    FridgeAndFreezerFull = 24,

    // Fridge
    FridgeNoHotObjects = 30,
    FridgeDefrosting = 31,

    // Microwave
    MicrowaveRecommendedUse = 40,
    MicrowaveCorrectPlacement = 41,
    MicrowaveStandby = 42,

    // Kettle
    KettleFillWithNeededAmountOfWater = 50,
    KettleInComparisonToStovetop = 51,

    // Coffee Machine
    CoffeeMachineHotplate = 60,
    CoffeeMachineTurnOffAfterUse = 61,
    CoffeeMachineWithNeededAmountOfWater = 62,
    CoffeeMachineDescaling = 63,
    CoffeeMachineSteamNozzle = 64,

    // Air fryer
    AirFryerPreheat = 70,
    AirFryerCutIntoSmallPieces = 71,
    AirFryerSingleLayer = 72,
    AirFryerIntermediateRaster = 73,
    AirFryerSubsequentBatches = 74,

    // Blender
    BlenderPreventIdleTime = 80,
    BlenderAdjustSpeed = 81,
    BlenderPreheatedIngredients = 82,

    // Dishwasher
    DishwasherFullLoad = 90,
    DishwasherEcoProgram = 91,
    DishwasherPreRinse = 92,

    // Washing Machine
    WashingMachineFullLoad = 100,
    WashingMachineLowTemperature = 101,
    WashingMachineEcoProgram = 102,
    WashingMachineBoilWash = 103,
    WashingMachineTemperatureOnTextileLabels = 104,
    WashingMachinePreWash = 105,

    // Dryer
    DryerDryInOpenAir = 110,

    // Vacuum Cleaner
    VacuumCleanerRemoveDisturbingObjects = 120,
    VacuumCleanerTurnOffWhenNotInUse = 121,
    VacuumCleanerFullSuctionPowerOnlyForCarpet = 122,
    VacuumCleanerEmptyRegularly = 123,
    VacuumCleanerChangeFilter = 124,

    // Iron
    IronMoistenClothes = 130,
    IronShortenTimeOrPrevent = 131,
    IronMultipleClothes = 132,
    IronTemperature = 133,
    IronTurnOff = 134,
    IronTypeOfWater = 135,

    // Entertainment (Super category)
    EntertainmentDisconnectFromPowerSupply = 140,
    EntertainmentStandby = 141,
    EntertainmentLowerBrightness = 142,
    EntertainmentTurnOffDisplay = 143,

    // TVs and Monitors
    TVsAndMonitorsSizeAndEquipment = 150,
    TVsAndMonitorsPreferLED = 151,

    // Entertainment and Computers
    EntertainmentAndComputersConsumptionPerDevice = 160,
    EntertainmentAndComputersShutdownInsteadOfStandby = 161,
    EntertainmentAndComputersUnplugChargers = 162,

    // Hair Dryer
    HairDryerSqueezeMoistureOutOfHair = 170,
    HairDryerPreDryHair = 171,
    HairDryerShortUsage = 172,
    HairDryerLowStage = 173,

    // Climate Control (Super category)
    ClimateControlRecommendedTemperature = 180,
    ClimateControlVentilation = 181,
    ClimateControlRecommendedPlacement = 182,
    ClimateControlLowerTemperatureInNight = 183,
    ClimateControlDoNotHeatDuringVentilation = 184,
    ClimateControlVentilationAtHighHumidity = 185,
    ClimateControlLowerHeatingPumpOrReplace = 186,
    ClimateControlRegularlyVentRadiators = 187,

    // Lighting
    LightingTurnOffWhenNotInUse = 190,
    LightingUseDaylight = 191,
    LightingUseOnlyForNecessaryAreas = 192,
    LightingUseLED = 193,

    // E-Car
    ECarDriveEconomically = 200,
    ECarRecuperation = 201,
    ECarEcoMode = 202,
    ECarDoNotDriveWithUnnecessaryWeight = 203,
    ECarAccelerateSlowly = 204,
    ECarRollOut = 205,
    ECarReduceAcclimatization = 206,
    ECarRegularlyCheckTirePressure = 207,
    ECarDriveFlatRoutes = 208,
    ECarUseElectronicOnlyWhenNeeded = 209,

    // E-Mobility
    EMobilitySteadyCadence = 210,
    EMobilityAsLittleSupportAsPossible = 211,
    EMobilityPreventStops = 212,
    EMobilityCheckRegularly = 213,
    EMobilityDriveFlatRoutes = 214,

    // Common
    CommonElectricWarmWaterLowerWaterUsage = 220,
    CommonTurnMixingTypeToTheRight = 221,
    CommonUseEconomyShowerHead = 222,
    CommonLowerWaterTemperature = 223,
}
