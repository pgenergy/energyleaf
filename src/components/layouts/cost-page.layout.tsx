import PageHeaderNav from "../nav/page-header-nav";

const links = [
	{
		slug: "day",
		href: "/cost",
		label: "Tag",
	},
	{
		slug: "week",
		href: "/cost/week",
		label: "Woche",
	},
	{
		slug: "month",
		href: "/cost/month",
		label: "Monat",
	},
];

interface Props {
	children?: React.ReactNode;
	selector: React.ReactNode;
}

export function CostPageLayout(props: Props) {
	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
				<PageHeaderNav links={links} />
				{props.selector}
			</div>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">{props.children}</div>
		</div>
	);
}
