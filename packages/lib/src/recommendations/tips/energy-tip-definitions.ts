import { EnergyTipKey } from "./energy-tip-key";

export interface EnergyTip {
    text: string;
    linkToSource: string;
}

export function getEnergyTip(tipKey: EnergyTipKey) {
    return Tips[tipKey];
}

const Tips: { [key in EnergyTipKey]: EnergyTip } = {
    [EnergyTipKey.StovetopLid]: {
        text: "Verwenden Sie einen Deckel beim Kochen. Wasserdampf im Topf ist genauso heiß wie das kochende Wasser am Topfboden.",
        linkToSource: "https://www.stromspar-check.de/energiespartipps",
    },
    [EnergyTipKey.StovetopAmountOfWater]: {
        text: "Verwenden Sie nur so viel Wasser zum Kochen von Gemüse, Kartoffeln oder Eiern, dass der Topfboden mit Wasser bedeckt ist.",
        linkToSource: "https://www.stromspar-check.de/energiespartipps",
    },
    [EnergyTipKey.StovetopReheat]: {
        text: "Schalten Sie Ihre Herdplatten frühzeitig ab und nutzen Sie die Platten-Nachhitze.",
        linkToSource: "https://www.stromspar-check.de/energiespartipps",
    },
    [EnergyTipKey.OvenConvection]: {
        text: "Die Umluftfunktion erlaubt das Absenken der Backtemperaturen bei gleicher oder geringerer Backdauer um bis zu 25 °C im Gegensatz zur Ober-/Unterhitze.",
        linkToSource: "https://www.stromspar-check.de/energiespartipps",
    },
    [EnergyTipKey.OvenPreventPreheat]: {
        text: "Normalerweise muss nicht vorgeheizt werden. Die Backdauer ist dann etwas länger, jedoch kann der Ofen einige Minuten vorher abgestellt werden, da die Restwärme genutzt werden kann.",
        linkToSource:
            "https://www.co2online.de/energie-sparen/strom-sparen/strom-sparen-stromspartipps/strom-sparen-tipps-und-tricks/",
    },
    [EnergyTipKey.FridgeAndFreezerTemperature]: {
        text: "Beim Kühlschrank wird eine Innentemperatur von +7 °C und beim Gefrierschrank eine Temperatur von -18 °C empfohlen.",
        linkToSource: "https://www.stromspar-check.de/energiespartipps",
    },
    [EnergyTipKey.FridgeAndFreezerStoreCovered]: {
        text: "Lagern Sie Lebensmittel nur abgedeckt, verpackt oder in Kunststoffbehältern, um das Bilden von Eisschichten zu verhindern.",
        linkToSource: "https://www.stromspar-check.de/energiespartipps",
    },
    [EnergyTipKey.FridgeAndFreezerOpenBriefly]: {
        text: "Öffnen Sie Ihren Kühl- oder Gefrierschrank so kurz wie möglich. Eine übersichtliche Lagerung der Lebensmittel kann dabei helfen.",
        linkToSource: "https://www.stromspar-check.de/energiespartipps",
    },
    [EnergyTipKey.FridgeAndFreezerOpenSeveralTimesForAShortTimeInsteadOfOnceForALongTime]: {
        text: "Es ist besser mehrmals hintereinander kurz den Kühl- oder Gefrierschrank zu öffnen, als ihn lange offen stehen zu lassen.",
        linkToSource:
            "https://www.co2online.de/energie-sparen/strom-sparen/strom-sparen-stromspartipps/strom-sparen-tipps-und-tricks/",
    },
    [EnergyTipKey.FridgeAndFreezerFull]: {
        text: "Je voller der Kühl- oder Gefrierschrank, desto weniger Kühlleistung muss das Gerät selbst erbringen.",
        linkToSource:
            "https://www.co2online.de/energie-sparen/strom-sparen/strom-sparen-stromspartipps/strom-sparen-tipps-und-tricks/",
    },
    [EnergyTipKey.FridgeNoHotObjects]: {
        text: "Stellen Sie keine heißen oder warmen Objekte in den Kühlschrank, dafür wird mehr Energie benötigt.",
        linkToSource: "https://www.stromspar-check.de/energiespartipps",
    },
    [EnergyTipKey.FridgeDefrosting]: {
        text: "Tauen Sie Gefrorenes im Kühlschrank auf, denn die Kälte gefrorener Lebensmittel senkt die zum Kühlen benötigte Energie.",
        linkToSource: "https://www.stromspar-check.de/energiespartipps",
    },
    [EnergyTipKey.MicrowaveRecommendedUse]: {
        text: "Nutzen Sie die Mikrowelle nur zum Erwärmen von kleineren Speisen bis zu 400 g.",
        linkToSource: "https://energiespartipps.de/strom-sparen-mikrowelle/",
    },
    [EnergyTipKey.MicrowaveCorrectPlacement]: {
        text: "Platzieren Sie die Gerichte möglichst flach und gleichmäßig auf dem Teller.",
        linkToSource: "https://energiespartipps.de/strom-sparen-mikrowelle/",
    },
    [EnergyTipKey.MicrowaveStandby]: {
        text: "Schalten Sie nach Nutzung den Standby-Modus an bzw. trennen Sie die Mikrowelle vom Stromnetz.",
        linkToSource: "https://energiespartipps.de/strom-sparen-mikrowelle/",
    },
    [EnergyTipKey.KettleFillWithNeededAmountOfWater]: {
        text: "Erhitzen Sie nur so viel Wasser, wie sie brauchen.",
        linkToSource: "https://www.stromspar-check.de/energiespartipps",
    },
    [EnergyTipKey.KettleInComparisonToStovetop]: {
        text: "Im Vergleich zum Elektroherd verbraucht ein Wasserkocher ca. die Hälfte an Energie zum Erhitzen von einem halben Liter Wasser.",
        linkToSource: "https://www.stromspar-check.de/energiespartipps",
    },
    [EnergyTipKey.CoffeeMachineHotplate]: {
        text: "Schalten Sie die Warmhalteplatte Ihrer Kaffeemaschine nach dem Brühen ab.",
        linkToSource: "https://www.plag-haustechnik.de/ueber-uns/nachhaltigkeit/ratgeber/kaffeemaschine",
    },
    [EnergyTipKey.CoffeeMachineTurnOffAfterUse]: {
        text: "Schalten Sie die Kaffeemaschine nach Gebrauch ab bzw. stellen Sie die  Abschaltautomatik auf eine geringe Betriebszeit ein.",
        linkToSource: "https://www.plag-haustechnik.de/ueber-uns/nachhaltigkeit/ratgeber/kaffeemaschine",
    },
    [EnergyTipKey.CoffeeMachineWithNeededAmountOfWater]: {
        text: "Füllen Sie den Wassertank nur mit etwas mehr als der benötigten Wassermenge.",
        linkToSource: "https://www.plag-haustechnik.de/ueber-uns/nachhaltigkeit/ratgeber/kaffeemaschine",
    },
    [EnergyTipKey.CoffeeMachineDescaling]: {
        text: "Entkalken Sie die Kaffeemaschine mindestens alle drei Monate.",
        linkToSource: "https://www.plag-haustechnik.de/ueber-uns/nachhaltigkeit/ratgeber/kaffeemaschine",
    },
    [EnergyTipKey.CoffeeMachineSteamNozzle]: {
        text: "Wenn Ihre Kaffeemaschine eine Dampfdüse besitzt, kann damit eine kleine Menge an Wasser erhitzt werden. Das ist energiesparender als mit dem Herd oder Wasserkocher.",
        linkToSource:
            "https://www.fuersie.de/lifestyle/haushalt-5-tipps-um-beim-kaffee-kochen-strom-zu-sparen-10743.html",
    },
    [EnergyTipKey.AirFryerPreheat]: {
        text: "Verzichten Sie vor dem Gebrauch der Heißluftfritteuse  auf Vorheizen.",
        linkToSource:
            "https://energie-echo.de/stromsparen-beim-frittieren-tipps-fuer-den-einsatz-der-hei-luftfritteuse/",
    },
    [EnergyTipKey.AirFryerCutIntoSmallPieces]: {
        text: "Schneiden Sie Lebensmittel in kleinere Stücke, um die Zubereitungszeit zu verkürzen.",
        linkToSource:
            "https://energie-echo.de/stromsparen-beim-frittieren-tipps-fuer-den-einsatz-der-hei-luftfritteuse/",
    },
    [EnergyTipKey.AirFryerSingleLayer]: {
        text: "Eine einzelne Schicht im Garkorb führt zu schnellem und gleichmäßigem Garen.",
        linkToSource:
            "https://energie-echo.de/stromsparen-beim-frittieren-tipps-fuer-den-einsatz-der-hei-luftfritteuse/",
    },
    [EnergyTipKey.AirFryerIntermediateRaster]: {
        text: "Ein geeignetes Zwischenraster hilft die Kapazität zu erhöhen, ohne die Luftzirkulation zu behindern.",
        linkToSource:
            "https://energie-echo.de/stromsparen-beim-frittieren-tipps-fuer-den-einsatz-der-hei-luftfritteuse/",
    },
    [EnergyTipKey.AirFryerSubsequentBatches]: {
        text: "Bereiten Sie mehrere Gerichte hintereinander zu, um die vorhandene Hitze effizient zu nutzen.",
        linkToSource:
            "https://energie-echo.de/stromsparen-beim-frittieren-tipps-fuer-den-einsatz-der-hei-luftfritteuse/",
    },
    [EnergyTipKey.BlenderPreventIdleTime]: {
        text: "Vermeiden Sie Leerlaufzeiten und nutzen Sie den Mixer nur so lange wie nötig.",
        linkToSource: "https://solarwissen.selfmade-energy.com/wie-viel-strom-verbraucht-ein-handmixer/",
    },
    [EnergyTipKey.BlenderAdjustSpeed]: {
        text: "Passen Sie die Geschwindigkeit und Intensität des Mixers nach Bedarf an.",
        linkToSource: "https://solarwissen.selfmade-energy.com/wie-viel-strom-verbraucht-ein-handmixer/",
    },
    [EnergyTipKey.BlenderPreheatedIngredients]: {
        text: "Verwenden Sie vorgewärmte Zutaten, um die Mixzeit zu verkürzen.",
        linkToSource: "https://solarwissen.selfmade-energy.com/wie-viel-strom-verbraucht-ein-handmixer/",
    },
    [EnergyTipKey.DishwasherFullLoad]: {
        text: "Spülmaschinen verbrauchen weniger Wasser als das Spülen von Hand, wenn sie voll beladen werden.",
        linkToSource: "https://www.stromspar-check.de/energiespartipps",
    },
    [EnergyTipKey.DishwasherEcoProgram]: {
        text: "Eco-Programme sind effizienter und schonender. Ein Mal im Monat sollte bei 60 °C gespült werden, um Keimbildung zu verhindern.",
        linkToSource: "https://www.stromspar-check.de/energiespartipps",
    },
    [EnergyTipKey.DishwasherPreRinse]: {
        text: "Grobe Essensreste können manuell entfernt werden, Vorspülen von Hand ist aber nicht nötig.",
        linkToSource: "https://www.stromspar-check.de/energiespartipps",
    },
    [EnergyTipKey.WashingMachineFullLoad]: {
        text: "Waschen Sie nur, wenn Ihre Waschmaschine voll ist. Für kleine Haushalte lohnt sich die Verwendung kleinerer Waschmaschinen.",
        linkToSource: "https://www.stromspar-check.de/energiespartipps",
    },
    [EnergyTipKey.WashingMachineLowTemperature]: {
        text: "Wenn Sie bei 30 °C waschen, wird nur ein Drittel des Stroms eines 60 °C-Waschgangs verbraucht.",
        linkToSource: "https://www.stromspar-check.de/energiespartipps",
    },
    [EnergyTipKey.WashingMachineEcoProgram]: {
        text: "Eco-Programme senken die Temperatur und den Wasserverbrauch bei einer längeren Waschzeit.",
        linkToSource: "https://www.stromspar-check.de/energiespartipps",
    },
    [EnergyTipKey.WashingMachineBoilWash]: {
        text: "Kochwäsche wird auch bei 60 °C sauber und bei stark verschmutzter Wäsche hilft ein Hygienespüler.",
        linkToSource: "https://www.stromspar-check.de/energiespartipps",
    },
    [EnergyTipKey.WashingMachineTemperatureOnTextileLabels]: {
        text: "Textiletiketten zeigen nicht die empfohlene, sondern die maximal erlaubte Waschtemperatur.",
        linkToSource: "https://www.stromspar-check.de/energiespartipps",
    },
    [EnergyTipKey.WashingMachinePreWash]: {
        text: "Nutzen Sie keine Vorwäsche vor der Hauptwäsche.",
        linkToSource:
            "https://www.co2online.de/energie-sparen/strom-sparen/strom-sparen-stromspartipps/strom-sparen-tipps-und-tricks/",
    },
    [EnergyTipKey.DryerDryInOpenAir]: {
        text: "Trocknen Sie Ihre Wäsche an der frischen Luft oder in unbeheizten, gut belüfteten Räumen.",
        linkToSource: "https://www.stromspar-check.de/energiespartipps",
    },
    [EnergyTipKey.VacuumCleanerRemoveDisturbingObjects]: {
        text: "Räumen Sie vor dem Saugen störende Gegenstände aus dem Weg.",
        linkToSource: "https://www.plag-haustechnik.de/ueber-uns/nachhaltigkeit/ratgeber/staubsauger",
    },
    [EnergyTipKey.VacuumCleanerTurnOffWhenNotInUse]: {
        text: "Schalten Sie den Staubsauger aus, wenn Sie vom Saugen unterbrochen werden.",
        linkToSource: "https://www.plag-haustechnik.de/ueber-uns/nachhaltigkeit/ratgeber/staubsauger",
    },
    [EnergyTipKey.VacuumCleanerFullSuctionPowerOnlyForCarpet]: {
        text: "Nutzen Sie die volle Saugkraft nur für Teppiche. Für Fliesen, Parkett, usw. reicht eine niedrige Saugstufe.",
        linkToSource: "https://www.plag-haustechnik.de/ueber-uns/nachhaltigkeit/ratgeber/staubsauger",
    },
    [EnergyTipKey.VacuumCleanerEmptyRegularly]: {
        text: "Tauschen Sie den Staubsaugerbeutel regelmäßig aus Nutzen Sie bei Wegwerf-Beuteln die aus Vlies statt Papier.",
        linkToSource: "https://www.plag-haustechnik.de/ueber-uns/nachhaltigkeit/ratgeber/staubsauger",
    },
    [EnergyTipKey.VacuumCleanerChangeFilter]: {
        text: "Tauschen Sie alle zwei bis drei Monate den Filter Ihres Staubsaugers aus.",
        linkToSource: "https://www.plag-haustechnik.de/ueber-uns/nachhaltigkeit/ratgeber/staubsauger",
    },
    [EnergyTipKey.IronMoistenClothes]: {
        text: "Befeuchten Sie Kleidungsstücke durch Wassernebel aus der Sprühflasche statt mit Dampf. Alternativ können Sie ein dünnes angefeuchtetes Baumwolltuch auflegen.",
        linkToSource:
            "https://rp-online.de/leben/ratgeber/strom-sparen-beim-buegeln-so-buegelt-man-effizienter_aid-81412359",
    },
    [EnergyTipKey.IronShortenTimeOrPrevent]: {
        text: "Verkürzen oder vermeiden Sie das Bügeln, indem Sie die Wäsche direkt aus der Trommel nehmen und hängend trocknen lassen – am besten mit einem glatten Gummibügel.",
        linkToSource:
            "https://rp-online.de/leben/ratgeber/strom-sparen-beim-buegeln-so-buegelt-man-effizienter_aid-81412359",
    },
    [EnergyTipKey.IronMultipleClothes]: {
        text: "Bügeln Sie mehrere Artikel auf einmal.",
        linkToSource: "https://de.bluettipower.eu/blogs/sicherung-zu-hause/stromverbrauch-bugeleisen",
    },
    [EnergyTipKey.IronTemperature]: {
        text: "Wählen Sie eine niedrigere Temperatur für empfindlichere Stoffe und eine höhere Temperatur für schwere Stoffe.",
        linkToSource: "https://de.bluettipower.eu/blogs/sicherung-zu-hause/stromverbrauch-bugeleisen",
    },
    [EnergyTipKey.IronTurnOff]: {
        text: "Schalten Sie das Bügeleisen aus, wenn Sie eine Pause machen.",
        linkToSource: "https://de.bluettipower.eu/blogs/sicherung-zu-hause/stromverbrauch-bugeleisen",
    },
    [EnergyTipKey.IronTypeOfWater]: {
        text: "Verwenden Sie destilliertes Wasser zum Bügeln.",
        linkToSource: "https://de.bluettipower.eu/blogs/sicherung-zu-hause/stromverbrauch-bugeleisen",
    },
    [EnergyTipKey.EntertainmentDisconnectFromPowerSupply]: {
        text: "Selbst nach dem Abschalten verbrauchen viele Geräte Strom, da die innen liegenden Netzteile noch aktiv sind. Mit abschaltbaren Steckdosenleisten können die Geräte endgültig vom Stromnetz getrennt werden.",
        linkToSource: "https://www.stromspar-check.de/energiespartipps",
    },
    [EnergyTipKey.EntertainmentStandby]: {
        text: "Stellen Sie Ihre elektronischen Geräte auf den Eco- oder Energiesparmodus ein. Oft ist es möglich, Geräte so einzustellen, dass sie nach kurzer Zeit der Nichtnutzung den Verbrauch reduzieren.",
        linkToSource: "https://www.stromspar-check.de/energiespartipps",
    },
    [EnergyTipKey.EntertainmentLowerBrightness]: {
        text: "Senken Sie die Helligkeit Ihrer Bildschirme. Durch das Anpassen der Helligkeit an die Lichtverhältnisse kann der Stromverbrauch um über 50% reduziert werden.",
        linkToSource: "https://www.stromspar-check.de/energiespartipps",
    },
    [EnergyTipKey.EntertainmentTurnOffDisplay]: {
        text: "Schalten Sie zumindest den Bildschirm aus, wenn Sie eine Pause machen.",
        linkToSource: "https://www.stromspar-check.de/energiespartipps",
    },
    [EnergyTipKey.TVsAndMonitorsSizeAndEquipment]: {
        text: "Je größer der Bildschirm und je umfangreicher die Ausstattung, desto mehr Strom benötigt der Fernseher.",
        linkToSource:
            "https://www.co2online.de/energie-sparen/strom-sparen/strom-sparen-stromspartipps/strom-sparen-tipps-und-tricks/",
    },
    [EnergyTipKey.TVsAndMonitorsPreferLED]: {
        text: "Plasma-Bildschirme haben einen höheren Verbrauch als Geräte mit LED-Hintergrundbeleuchtung.",
        linkToSource:
            "https://www.co2online.de/energie-sparen/strom-sparen/strom-sparen-stromspartipps/strom-sparen-tipps-und-tricks/",
    },
    [EnergyTipKey.EntertainmentAndComputersConsumptionPerDevice]: {
        text: "Laptops verbrauchen weniger Energie als Desktop-PCs. Tablets oder Smartphones verbrauchen weniger Strom als Laptops.",
        linkToSource:
            "https://www.co2online.de/energie-sparen/strom-sparen/strom-sparen-stromspartipps/strom-sparen-tipps-und-tricks/",
    },
    [EnergyTipKey.EntertainmentAndComputersShutdownInsteadOfStandby]: {
        text: "Schalten Sie Elektrogeräte nach dem Gebrauch nicht in den Standby-Modus, sondern komplett aus.",
        linkToSource:
            "https://www.co2online.de/energie-sparen/strom-sparen/strom-sparen-stromspartipps/strom-sparen-tipps-und-tricks/",
    },
    [EnergyTipKey.EntertainmentAndComputersUnplugChargers]: {
        text: "Ziehen Sie Ladegeräte nach dem Laden aus der Steckdose, sonst fließt weiter Strom.",
        linkToSource:
            "https://www.co2online.de/energie-sparen/strom-sparen/strom-sparen-stromspartipps/strom-sparen-tipps-und-tricks/",
    },
    [EnergyTipKey.HairDryerSqueezeMoistureOutOfHair]: {
        text: "Drücken Sie die Feuchtigkeit vor dem Föhnen aus den Haaren.",
        linkToSource: "https://utopia.de/ratgeber/haare-foehnen-so-sparst-du-dabei-strom_252947/",
    },
    [EnergyTipKey.HairDryerPreDryHair]: {
        text: "Lassen Sie Ihre Haare an der Luft vortrocknen.",
        linkToSource: "https://utopia.de/ratgeber/haare-foehnen-so-sparst-du-dabei-strom_252947/",
    },
    [EnergyTipKey.HairDryerShortUsage]: {
        text: "Föhnen Sie Ihre Haare nur kurz an.",
        linkToSource: "https://utopia.de/ratgeber/haare-foehnen-so-sparst-du-dabei-strom_252947/",
    },
    [EnergyTipKey.HairDryerLowStage]: {
        text: "Verwenden Sie eine niedrige Föhnstufe.",
        linkToSource: "https://utopia.de/ratgeber/haare-foehnen-so-sparst-du-dabei-strom_252947/",
    },
    [EnergyTipKey.ClimateControlRecommendedTemperature]: {
        text: "Empfohlen werden Temperaturen von 20 - 22 °C im Wohnzimmer, 17 - 18 °C im Schlafzimmer und 22 °C im Badezimmer.",
        linkToSource: "https://www.stromspar-check.de/energiespartipps",
    },
    [EnergyTipKey.ClimateControlVentilation]: {
        text: "Lüften Sie 3 - 4 am Tag für jeweils 5 - 10 Minuten. Stoßlüften mit weit geöffnetem Fenster oder Querlüften mit weit geöffneten gegenüberliegenden Fenstern und Innentüren sind geeignet.",
        linkToSource: "https://www.stromspar-check.de/energiespartipps",
    },
    [EnergyTipKey.ClimateControlRecommendedPlacement]: {
        text: "Heizkörper und Thermostatventile sollen frei stehen, damit Wärme optimal in den Raum abgegeben werden kann.",
        linkToSource: "https://www.stromspar-check.de/energiespartipps",
    },
    [EnergyTipKey.ClimateControlLowerTemperatureInNight]: {
        text: "Drehen Sie nachts die Heizung auf 15 - 16 °C runter.",
        linkToSource: "https://www.stromspar-check.de/energiespartipps",
    },
    [EnergyTipKey.ClimateControlDoNotHeatDuringVentilation]: {
        text: "Schließen Sie während des Lüftens immer die Thermostatventile der Heizkörper.",
        linkToSource: "https://www.stromspar-check.de/energiespartipps",
    },
    [EnergyTipKey.ClimateControlVentilationAtHighHumidity]: {
        text: "Lüften Sie immer direkt, wenn nach dem Duschen, Kochen oder Bodenwischen hohe Feuchtemengen entstehen.",
        linkToSource: "https://www.stromspar-check.de/energiespartipps",
    },
    [EnergyTipKey.ClimateControlLowerHeatingPumpOrReplace]: {
        text: "Stellen Sie Ihre Heizungspumpe niedriger oder tauschen Sie sie aus.",
        linkToSource:
            "https://www.co2online.de/energie-sparen/strom-sparen/strom-sparen-stromspartipps/strom-sparen-tipps-und-tricks/",
    },
    [EnergyTipKey.ClimateControlRegularlyVentRadiators]: {
        text: "Entlüften Sie Heizkörper regelmäßig.",
        linkToSource: "https://verbraucherzentrale-energieberatung.de/energie-sparen/",
    },
    [EnergyTipKey.LightingTurnOffWhenNotInUse]: {
        text: "Das Ein- und Ausschalten von Licht führt zu keinem höheren Stromverbrauch oder reduzierten Lebensdauer von LED-Lampen. Schalten Sie das Licht immer aus, wenn Sie den Raum verlassen.",
        linkToSource: "https://www.stromspar-check.de/energiespartipps",
    },
    [EnergyTipKey.LightingUseDaylight]: {
        text: "Nutzen Sie wenn möglich Tageslicht.",
        linkToSource: "https://www.stromspar-check.de/energiespartipps",
    },
    [EnergyTipKey.LightingUseOnlyForNecessaryAreas]: {
        text: "Beleuchten Sie nur die Bereiche, in denen viel Licht benötigt wird.",
        linkToSource: "https://www.stromspar-check.de/energiespartipps",
    },
    [EnergyTipKey.LightingUseLED]: {
        text: "Ersetzen Sie ineffiziente Lampen durch LED-Beleuchtung.",
        linkToSource: "https://www.stromspar-check.de/energiespartipps",
    },
    [EnergyTipKey.ECarDriveEconomically]: {
        text: "Fahren Sie mit Ihrem Auto vorausschauend und sparsam.",
        linkToSource: "https://www.polarstern-energie.de/magazin/artikel/elektroauto-strom-energie-sparen-fahren/",
    },
    [EnergyTipKey.ECarRecuperation]: {
        text: "Nutzen Sie den Rekuperationseffekt beim Elektroauto, indem Sie die Motorbremse wirken lassen.",
        linkToSource: "https://www.polarstern-energie.de/magazin/artikel/elektroauto-strom-energie-sparen-fahren/",
    },
    [EnergyTipKey.ECarEcoMode]: {
        text: "Verwenden Sie den Eco- oder Energiesparmodus Ihres Elektroautos.",
        linkToSource: "https://www.polarstern-energie.de/magazin/artikel/elektroauto-strom-energie-sparen-fahren/",
    },
    [EnergyTipKey.ECarDoNotDriveWithUnnecessaryWeight]: {
        text: "Fahren Sie nicht mit einem unnötig beladenem Auto.",
        linkToSource: "https://www.polarstern-energie.de/magazin/artikel/elektroauto-strom-energie-sparen-fahren/",
    },
    [EnergyTipKey.ECarAccelerateSlowly]: {
        text: "Beschleunigen Sie sanft.",
        linkToSource: "https://www.polarstern-energie.de/magazin/artikel/elektroauto-strom-energie-sparen-fahren/",
    },
    [EnergyTipKey.ECarRollOut]: {
        text: "Lassen Sie Ihr Elektroauto ausrollen.",
        linkToSource: "https://www.polarstern-energie.de/magazin/artikel/elektroauto-strom-energie-sparen-fahren/",
    },
    [EnergyTipKey.ECarReduceAcclimatization]: {
        text: "Reduzieren Sie die Heizleistung in Ihrem Elektroauto, um die Reichweite zu erhöhen.",
        linkToSource: "https://www.polarstern-energie.de/magazin/artikel/elektroauto-strom-energie-sparen-fahren/",
    },
    [EnergyTipKey.ECarRegularlyCheckTirePressure]: {
        text: "Prüfen Sie regelmäßig Ihren Reifendruck, um den Rollwiderstand zu reduzieren.",
        linkToSource: "https://www.polarstern-energie.de/magazin/artikel/elektroauto-strom-energie-sparen-fahren/",
    },
    [EnergyTipKey.ECarDriveFlatRoutes]: {
        text: "Wählen Sie möglichst flache Strecken.",
        linkToSource: "https://www.polarstern-energie.de/magazin/artikel/elektroauto-strom-energie-sparen-fahren/",
    },
    [EnergyTipKey.ECarUseElectronicOnlyWhenNeeded]: {
        text: "Schalten Sie Abblendlicht, Radio, Klimaanlage, Sitzheizung, Nebelscheinwerfer und Innenbeleuchtung nur an, wenn Sie sie brauchen.",
        linkToSource: "https://www.polarstern-energie.de/magazin/artikel/elektroauto-strom-energie-sparen-fahren/",
    },
    [EnergyTipKey.EMobilitySteadyCadence]: {
        text: "Achten Sie beim E-Bike auf eine stetige Trittfrequenz von 70 - 75 Umdrehungen pro Minute.",
        linkToSource: "https://fit-ebike.com/ueber-uns/blog/e-bike-akku-reichweite-erhoehen/",
    },
    [EnergyTipKey.EMobilityAsLittleSupportAsPossible]: {
        text: "Je geringer die Unterstützungsstufe beim E-Bike, desto weniger Akku wird benötigt.",
        linkToSource: "https://fit-ebike.com/ueber-uns/blog/e-bike-akku-reichweite-erhoehen/",
    },
    [EnergyTipKey.EMobilityPreventStops]: {
        text: "Versuchen Sie mit Ihrem Elektrofahrzeug so wenig wie möglich zu stoppen, indem Sie langsam auf eine Ampel zurollen oder abrupte Geschwindigkeitswechsel vermeiden.",
        linkToSource: "https://fit-ebike.com/ueber-uns/blog/e-bike-akku-reichweite-erhoehen/",
    },
    [EnergyTipKey.EMobilityCheckRegularly]: {
        text: "Warten Sie Ihr Elektrofahrzeug regelmäßig und prüfen Sie ggf. den Reifendruck.",
        linkToSource: "https://fit-ebike.com/ueber-uns/blog/e-bike-akku-reichweite-erhoehen/",
    },
    [EnergyTipKey.EMobilityDriveFlatRoutes]: {
        text: "Wählen Sie für Ihr Elektrofahrzeug möglichst flache Routen, um eine größere Reichweite zu erreichen.",
        linkToSource: "https://fit-ebike.com/ueber-uns/blog/e-bike-akku-reichweite-erhoehen/",
    },
    [EnergyTipKey.CommonElectricWarmWaterLowerWaterUsage]: {
        text: "Wird Ihr Wasser elektrisch erwärmt, sparen Sie Strom, indem Sie Ihren Warmwasserverbrauch reduzieren. Wenn Sie in unter 10 min Duschen, sparen Sie dadurch mehr Wasser als beim Baden.",
        linkToSource: "https://www.stromspar-check.de/energiespartipps",
    },
    [EnergyTipKey.CommonTurnMixingTypeToTheRight]: {
        text: "Drehen Sie die Mischbatterie in Küche und Bad immer nach rechts, sonst geht die Heizung bzw. der Durchlauferhitzer immer an, sobald Wasser fließt.",
        linkToSource: "https://www.stromspar-check.de/energiespartipps",
    },
    [EnergyTipKey.CommonUseEconomyShowerHead]: {
        text: "Verwenden Sie Sparduschköpfe für Badewanne oder Dusche und Perlatoren für Wasserhähne.",
        linkToSource:
            "https://www.co2online.de/energie-sparen/strom-sparen/strom-sparen-stromspartipps/strom-sparen-tipps-und-tricks/",
    },
    [EnergyTipKey.CommonLowerWaterTemperature]: {
        text: "Senken Sie die Warmwassertemperatur.",
        linkToSource: "https://verbraucherzentrale-energieberatung.de/energie-sparen/",
    },
};
