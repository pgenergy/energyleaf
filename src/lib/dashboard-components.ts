/**
 * Dashboard component registry
 * Defines all available dashboard components (both default and optional)
 */

export type DashboardComponentId =
	// Default components (currently on dashboard)
	| "total-consumption"
	| "total-cost"
	| "energy-goals"
	| "detail-energy"
	// Optional energy components
	| "energy-bar-day"
	| "energy-bar-week"
	| "energy-bar-month"
	// Optional cost components
	| "cost-bar-day"
	| "cost-bar-week"
	| "cost-bar-month"
	| "cost-prediction"
	// Optional simulation components
	| "simulation-detail"
	| "simulation-cost";

export interface DashboardComponentConfig {
	label: string;
	description: string;
	group: "default" | "energy" | "cost" | "simulation";
	/** Order for display on dashboard (lower = higher priority) */
	order: number;
	/** Whether this component requires simulations to be enabled */
	requiresSimulation?: boolean;
}

/**
 * All available dashboard components
 * Order follows: Overview -> Detail Energy -> Agg Energy -> Agg Cost -> Cost Prediction -> Simulation
 */
export const DASHBOARD_COMPONENTS: Record<DashboardComponentId, DashboardComponentConfig> = {
	// Default components (Overview)
	"total-consumption": {
		label: "Gesamtverbrauch",
		description: "Zeigt den Gesamtverbrauch des heutigen Tages an.",
		group: "default",
		order: 10,
	},
	"total-cost": {
		label: "Gesamtkosten",
		description: "Zeigt die Gesamtkosten des heutigen Tages an.",
		group: "default",
		order: 20,
	},
	"energy-goals": {
		label: "Energielimits",
		description: "Zeigt den Fortschritt Ihrer Energielimits an.",
		group: "default",
		order: 30,
	},
	// Detail Energy Chart
	"detail-energy": {
		label: "Detailansicht Verbrauch",
		description: "Detaillierte Ansicht Ihres Verbrauchs im Tagesverlauf.",
		group: "default",
		order: 40,
	},
	// Aggregated Energy Charts
	"energy-bar-day": {
		label: "Verbrauch (Tag)",
		description: "Verbrauch aggregiert in Stunden.",
		group: "energy",
		order: 50,
	},
	"energy-bar-week": {
		label: "Verbrauch (Woche)",
		description: "Verbrauch aggregiert in Wochentage.",
		group: "energy",
		order: 60,
	},
	"energy-bar-month": {
		label: "Verbrauch (Monat)",
		description: "Verbrauch aggregiert in Wochen.",
		group: "energy",
		order: 70,
	},
	// Aggregated Cost Charts
	"cost-bar-day": {
		label: "Kosten (Tag)",
		description: "Kosten aggregiert in Stunden.",
		group: "cost",
		order: 80,
	},
	"cost-bar-week": {
		label: "Kosten (Woche)",
		description: "Kosten aggregiert in Wochentage.",
		group: "cost",
		order: 90,
	},
	"cost-bar-month": {
		label: "Kosten (Monat)",
		description: "Kosten aggregiert in Wochen.",
		group: "cost",
		order: 100,
	},
	// Cost Prediction
	"cost-prediction": {
		label: "Kostenvorhersage",
		description: "Vorhersage der Kosten für diesen Monat.",
		group: "cost",
		order: 110,
	},
	// Simulation Components
	"simulation-detail": {
		label: "Simulation Detailansicht",
		description: "Vergleichen Sie Ihren Verbrauch mit simulierten Szenarien.",
		group: "simulation",
		order: 120,
		requiresSimulation: true,
	},
	"simulation-cost": {
		label: "Simulation Kostenübersicht",
		description: "Vergleichen Sie Ihre Kosten mit simulierten Szenarien.",
		group: "simulation",
		order: 130,
		requiresSimulation: true,
	},
} as const;

/**
 * Default components that are shown when no config exists (backwards compatibility)
 */
export const DEFAULT_DASHBOARD_COMPONENTS: DashboardComponentId[] = [
	"total-consumption",
	"total-cost",
	"energy-goals",
	"detail-energy",
];

/**
 * Component group labels for the settings dialog
 */
export const COMPONENT_GROUP_LABELS: Record<DashboardComponentConfig["group"], string> = {
	default: "Übersicht",
	energy: "Energie",
	cost: "Kosten",
	simulation: "Simulation",
};

/**
 * Get components grouped by their category
 */
export function getComponentsByGroup(): Record<DashboardComponentConfig["group"], DashboardComponentId[]> {
	const groups: Record<DashboardComponentConfig["group"], DashboardComponentId[]> = {
		default: [],
		energy: [],
		cost: [],
		simulation: [],
	};

	for (const [id, config] of Object.entries(DASHBOARD_COMPONENTS)) {
		groups[config.group].push(id as DashboardComponentId);
	}

	// Sort each group by order
	for (const group of Object.keys(groups) as DashboardComponentConfig["group"][]) {
		groups[group].sort((a, b) => DASHBOARD_COMPONENTS[a].order - DASHBOARD_COMPONENTS[b].order);
	}

	return groups;
}

/**
 * Get active components sorted by their display order
 */
export function sortComponentsByOrder(componentIds: string[]): DashboardComponentId[] {
	return (componentIds as DashboardComponentId[])
		.filter((id) => id in DASHBOARD_COMPONENTS)
		.sort((a, b) => DASHBOARD_COMPONENTS[a].order - DASHBOARD_COMPONENTS[b].order);
}
