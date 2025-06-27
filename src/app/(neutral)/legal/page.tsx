import Link from "next/link";

export const metadata = {
	title: "Impressum | Energyleaf",
};

export default function LegalPage() {
	return (
		<>
			<h2 className="text-xl font-bold">Impressum</h2>
			<p>
				<span className="font-bold">Beauftragter im datenschutzrechtlichen Sinne</span>
				<br />
				Carl von Ossietzky Universität Oldenburg
				<br />
				Ammerländer Heerstraße 114-118
				<br />
				26129 Oldenburg
				<br />
				Telefon: 0441/7980
				<br />
				E-Mail: infopoint@uol.de
				<br />
				Vertreten durch Ihren Präsidenten: Prof. Dr. Ralph Bruder
			</p>
			<p>
				<span className="font-bold">Datenschutzbeauftragter</span>
				<br />
				Carl von Ossietzky Universität Oldenburg
				<br />- Der Datenschutzbeauftragte -
				<br />
				Ammerländer Heerstraße 114-118
				<br />
				26129 Oldenburg
				<br />
				Telefon: 0441/ 7984196
				<br />
				E-Mail: dsuni@uol.de
				<br />
				Internetauftritt:{" "}
				<Link href="https://uol.de/datenschutz" target="_blank">
					https://uol.de/datenschutz
				</Link>
			</p>
			<p>
				<span className="font-bold">Verantwortlicher des Forschungsprojektes Energyleaf</span>
				<br />
				Prof. Dr. Philipp Staudt
				<br />
				Lehrstuhl für Wirtschaftsinformatik – Umwelt & Nachhaltigkeit
				<br />
				Carl von Ossietzky Universität Oldenburg
				<br />
				Ammerländer Heerstraße 114-118
				<br />
				26129 Oldenburg
				<br />
				Mail: philipp.staudt@uni-oldenburg.de
			</p>
		</>
	);
}
