"use client";

import { useForm } from "@tanstack/react-form";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	COMPONENT_GROUP_LABELS,
	DASHBOARD_COMPONENTS,
	type DashboardComponentId,
	getComponentsByGroup,
} from "@/lib/dashboard-components";
import { updateDashboardConfigAction } from "@/server/actions/dashboard";

interface Props {
	activeComponents: DashboardComponentId[];
	hasSimulations: boolean;
	onSuccess?: () => void;
}

const submitSchema = z.object({
	activeComponents: z.array(z.string()),
});

export default function DashboardConfigForm(props: Props) {
	const componentsByGroup = getComponentsByGroup();

	const form = useForm({
		defaultValues: {
			activeComponents: props.activeComponents as string[],
		},
		validators: {
			onSubmit: submitSchema,
		},
		onSubmit: async ({ value }) => {
			const toastId = toast.loading("Speichern...", { duration: Infinity });
			const res = await updateDashboardConfigAction(value);
			if (!res.success) {
				toast.error(res.message, { id: toastId, duration: 4000 });
			} else {
				toast.success(res.message, { id: toastId, duration: 4000 });
				props.onSuccess?.();
			}
		},
	});

	const pending = form.state.isSubmitting;

	const handleToggle = (componentId: string, checked: boolean, currentValue: string[]) => {
		if (checked) {
			return [...currentValue, componentId];
		}
		return currentValue.filter((id) => id !== componentId);
	};

	// Filter out simulation components if user has no simulations
	const filterComponents = (componentIds: DashboardComponentId[]) => {
		if (props.hasSimulations) {
			return componentIds;
		}
		return componentIds.filter((id) => !DASHBOARD_COMPONENTS[id].requiresSimulation);
	};

	const groupOrder: (keyof typeof componentsByGroup)[] = ["default", "energy", "cost", "simulation"];

	return (
		<form
			method="POST"
			className="flex flex-col gap-6"
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<form.Field
				name="activeComponents"
				children={(field) => (
					<div className="flex flex-col gap-6">
						{groupOrder.map((group) => {
							const components = filterComponents(componentsByGroup[group]);
							if (components.length === 0) return null;

							return (
								<div key={group} className="flex flex-col gap-3">
									<h3 className="font-semibold text-sm text-muted-foreground">
										{COMPONENT_GROUP_LABELS[group]}
									</h3>
									<div className="flex flex-col gap-2">
										{components.map((componentId) => {
											const config = DASHBOARD_COMPONENTS[componentId];
											const isChecked = field.state.value.includes(componentId);

											return (
												<div
													key={componentId}
													className="flex items-start gap-3 rounded-md border p-3"
												>
													<Checkbox
														id={componentId}
														checked={isChecked}
														onCheckedChange={(checked) => {
															field.handleChange(
																handleToggle(
																	componentId,
																	checked === true,
																	field.state.value,
																),
															);
														}}
														className="mt-0.5"
													/>
													<div className="flex flex-col gap-1">
														<Label
															htmlFor={componentId}
															className="cursor-pointer font-medium"
														>
															{config.label}
														</Label>
														<p className="text-xs text-muted-foreground">
															{config.description}
														</p>
													</div>
												</div>
											);
										})}
									</div>
								</div>
							);
						})}
					</div>
				)}
			/>

			<DialogFooter>
				<Button type="submit" disabled={pending} className="cursor-pointer">
					{pending ? <Loader2Icon className="size-4 animate-spin" /> : null}
					Speichern
				</Button>
			</DialogFooter>
		</form>
	);
}
