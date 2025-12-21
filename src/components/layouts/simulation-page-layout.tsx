interface Props {
	children?: React.ReactNode;
	selector: React.ReactNode;
	filter: React.ReactNode;
	cards?: React.ReactNode;
	settingsLink?: React.ReactNode;
}

export function SimulationPageLayout(props: Props) {
	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
				<h1 className="text-xl font-bold">Simulation</h1>
				<div className="flex flex-col items-center gap-2 md:flex-row">
					{props.selector}
					{props.filter}
					{props.settingsLink}
				</div>
			</div>
			{props.cards ? <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{props.cards}</div> : null}
			<div className="flex flex-col gap-4">{props.children}</div>
		</div>
	);
}
