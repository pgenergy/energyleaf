import Link from "next/link";

export const metadata = {
	title: "Datenschutzerklärung | Energyleaf",
};

export default function PrivacyPage() {
	return (
		<>
			<h2 className="text-xl font-bold">Datenschutzerklärung</h2>
			<p>
				<span className="font-bold">1. Verantwortlicher für die Datenverarbeitung im Sinne der DS-GVO (Art. 4 Nr. 7) sowie anderer datenschutzrechtlicher Bestimmungen</span>
				<br />
				Karlsruher Institut für Technologie (KIT) 
				<br />
				Kaiserstraße 12
				<br />
				76131 Karlsruhe 
				<br />
				Telefon: +49 721 608-0
				<br />
				E-Mail: info@kit.edu
				<br />
				Das Karlsruher Institut für Technologie ist eine Körperschaft des öffentlichen Rechts. Es wird vertreten durch die/den jeweilige/n Präsident/in. 
			</p>
			<p>
				<span className="font-bold">2. Datenschutzbeauftragte/r</span>
				<br />
				Die Datenschutzbeauftragte des KIT ist:
				<br />
				Ass. jur. Marina Bitmann
				<br />
				Kaiserstraße 12
				<br />
				76131 Karlsruhe
				<br />
				Telefon: +49 721 608-41057
				<br />
				E-Mail: dsb@kit.edu
			</p>
			<p>
				<span className="font-bold">3. Verantwortlicher des Forschungsprojektes Energyleaf</span>
				<br />
				Prof. Dr. Philipp Staudt
				<br />
				Karlsruher Institut für Technologie (KIT) 
				<br />
				Institut für Wirtschaftsinformatik
				<br />
				Kaiserstraße 89-93
				<br />
				76133 Karlsruhe
				<br />
				Telefon: +49 721 608-48370
				<br />
				E-Mail: office@win.kit.edu
			</p>
			<p>
				<span className="font-semibold">4. Zweck der Datenverarbeitung</span>
				<br />
				Teilnehmende einer Studie, in der das Software-Artefakt genutzt wird, beachten bitte seperate Datenschutz- sowie Teilnehmendeninformationen, die Sie bei der Studienregistrierung erhalten haben. Diese enthalten zusätzliche Informationen zur Datenverarbeitung im Rahmen der Studie.
				<br/>
				Soweit nicht gesondert aufgeführt, werden die personenbezogenen Daten im Rahmen der Nutzung des Software-Artefakts
				&quot;Energyleaf&quot; wie folgt verarbeitet:
				<br />
				Die Web-Anwendung &quot;Energyleaf&quot; dient der Erfassung, Speicherung und Visualisierung von Stromverbrauchsdaten im Rahmen eines Forschungsprojekts. 
				Zudem sollen die erhobenen Verbrauchsdaten nach einer Pseudonymisierung für weiterführende Datenanalysen genutzt werden, beispielsweise zur Verbesserung von Verbrauchsprognosen und Gerätedisaggregation.
			</p>
			<p>
				<span className="font-semibold">5. Erfasste personenbezogene Daten</span>
				<br />
				Folgende personenbezogene Daten werden verarbeitet:
				<br />
				<ul className="flex list-disc flex-col gap-1 pl-5 pt-2">
					<li>Anmeldeinformationen (Name, Benutzername, E-Mail-Adresse)</li>
					<li>Nutzungsdaten der Web-Anwendung (IP-Adresse, besuchte Seiten, Zugriffszeitpunkt, Systeminformationen)</li>
					<li>Stromverbrauchsdaten (Zeitstempel und Verbrauchswerte)</li>
				</ul>
			</p>
			<p>
				<span className="font-semibold">6. Rechtsgrundlage</span>
				<br />
				Die Rechtsgrundlage für die Verarbeitung Ihrer personenbezogenen Daten ist:
				<ul className="flex list-disc flex-col gap-1 pl-5 pt-2">
					<li>Ihre Einwilligung nach Art. 6 Abs. 1 UAbs. 1 lit. a DS-GVO</li>
					<li>Art. 6 Abs. 1 lit. e in Verbindung mit Art. 6 Abs. 3 Datenschutz-Grundverordnung (DS-GVO) in Verbindung mit § 13 Abs.1 Landesdatenschutzgesetz Baden-Württemberg, für die wissenschaftliche Auswertung der erhobenen Forschungsdaten.</li>
				</ul>
				<br/>
				Die Erteilung der Einwilligung erfolgt freiwillig. Die Einwilligung kann jederzeit mit der Wirkung für die Zukunft widerrufen werden. Wirkung für die Zukunft bedeutet, dass durch einen Widerruf der Einwilligung die Rechtmäßigkeit, der aufgrund der Einwilligung bis zum Widerruf erfolgten Verarbeitung nicht berührt wird.
				<br/>
				Wird die Einwilligung verweigert oder widerrufen, entstehen keine Nachteile. 
			</p>
			<p>
				<span className="font-semibold">7. Empfänger</span>
				<br/>
				Intern Zugriffsberechtigt sind die Forschenden aus dem Forschungsprojekt „Energyleaf – Erforschung von Energie Applikationen“. 
				<br/>
				Weitere interne Empfänger sind interne IT-Dienststellen zur Bereitstellung und zum Betrieb der für das Feldexperiment genutzten IT-Infrastruktur, einschließlich Hosting, Datenbanken und E-Mail-Diensten.
				Die Verarbeitung findet ausschließlich auf Servern der Hochschule statt. 
				<br/>
				Eine Übermittlung personenbezogener Daten an externe Dienstleister oder in Drittländer findet nicht statt.
				<br/>
				Eine automatisierte Entscheidungsfindung einschließlich Profiling erfolgt nicht. 
				<br/>
				Darüber hinaus müssen entsprechend den archivrechtlichen Vorschriften Unterlagen vor ihrer Löschung dem KIT-Archiv angeboten werden. Dieses entscheidet über die Übernahme von Unterlagen. Das KIT-Archiv wahrt dabei die berechtigten Interessen der Betroffenen nach Maßgabe des Landesarchivgesetz BW (LArchG) und der übrigen einschlägigen Rechtsvorschriften.
			</p>
			<p>
				<span className="font-semibold">8. Dauer der Speicherung</span>
				<br/>
				Die Kontaktdaten sowie die Einwilligungserklärung werden spätestens nach Abschluss des Projekts vernichtet.
				<br />
				Nach Abschluss der Studie werden die Daten von uns pseudonymisiert, um sicherzustellen, dass keine Rückschlüsse auf die Person mehr möglich sind. 
				<br/>
				Sämtliche Forschungsdaten werden gemäß der Satzung zur Sicherung guter wissenschaftlicher Praxis am Karlsruher Institut für Technologie (KIT) für 10 Jahre nach Abschluss des Projekts aufbewahrt. 
				<br/>
				Ggf. werden die Unterlagen vom KIT-Archiv übernommen und dort gem. Art. 5 Abs. 1 lit. e DS-GVO in Verbindung mit § 8 Abs. 2 i.V.m. den §§ 3 und 2 Landesarchivgesetz BW (LArchG) in der Regel unbegrenzt aufbewahrt.
			</p>
			<p>
				<span className="font-semibold">9. Ihre Rechte</span>
				<br />
				Bitte wenden Sie sich in dem Fall jeweils an folgende Person: Prof. Dr. Philipp Staudt
				<br />
				<ul className="flex list-disc flex-col gap-1 pl-5 pt-2">
					<li>
						Recht auf Widerruf Ihrer Einwilligung mit Wirkung für die Zukunft, sofern die Verarbeitung auf einer Einwilligung gemäß Artikel 6 Absatz 1 Unterabsatz 1 Buchstabe a DS-GVO beruht (Artikel 7 Absatz 3 DS-GVO)
					</li>
					<li>
						Recht auf Bestätigung, ob Sie betreffende Daten verarbeitet werden, und auf Auskunft über die verarbeiteten Daten, auf weitere Informationen über die Datenverarbeitung sowie auf Kopien der Daten (Artikel 15 DS-GVO)
					</li>
					<li>
						Recht auf Berichtigung oder Vervollständigung unrichtiger bzw. unvollständiger Daten (Artikel 16 DS-GVO)
					</li>
					<li>
						Recht auf unverzügliche Löschung der Sie betreffenden Daten (Artikel 17 DS-GVO)
					</li>
					<li>
						Recht auf Einschränkung der Verarbeitung (Artikel 18 DS-GVO)
					</li>
					<li>
						Recht auf Erhalt der Daten in einem strukturierten, gängigen und maschinenlesbaren Format, sofern die Verarbeitung auf einer Einwilligung gemäß Artikel 6 Absatz 1 Unterabsatz 1 Buchstabe a oder Artikel 9 Absatz 2 Buchstabe a DS-GVO beruht (Artikel 20 DS-GVO)
					</li>
					<li>
						Recht auf Widerspruch gegen die künftige Verarbeitung der Sie betreffenden Daten, sofern die Daten nach Maßgabe von Artikel 6 Absatz 1 Buchstabe e DS-GVO verarbeitet werden (Artikel 21 DS-GVO)
					</li>
				</ul>
				<br />
				Sie haben zudem das Recht, sich bei der Aufsichtsbehörde über die Verarbeitung der Sie betreffenden personenbezogenen Daten durch das KIT zu beschweren (Artikel 77 DS-GVO). 
				Aufsichtsbehörde im Sinne des Artikels 51 Absatz 1 DS-GVO über das KIT ist gemäß § 25 Absatz 1 LDSG: Der Landesbeauftragte für den Datenschutz und die Informationsfreiheit Baden-Württemberg: (<Link href="https://www.baden-wuerttemberg.datenschutz.de/" target="_blank">https://www.baden-wuerttemberg.datenschutz.de/</Link>).
			</p>
		</>
	);
}
