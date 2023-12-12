interface Props {
    children: React.ReactNode;
}

export default function SiteLayout({ children }: Props) {
    return <main>{children}</main>;
}
