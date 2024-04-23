import Link from "next/link";

export const metadata = {
    title: "Datenschutzerklärung | Energyleaf",
};

export default function PrivacyPage() {
    return (
        <>
            <h2 className="text-xl">Datenschutzerklärung</h2>
            <p>
                <span className="font-bold">1. Beauftragter im datenschutzrechtlichen Sinne</span>
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
                <span className="font-bold">2. Datenschutzbeauftragter</span>
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
                <span className="font-bold">3. Verantwortlicher des Forschungsprojektes Energyleaf</span>
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
            <p>
                <span className="font-bold">4. Verarbeitung von personenbezogenen Daten</span>
                <br />
                Soweit nicht gesondert aufgeführt, werden die personenbezogenen Daten im Rahmen des Projektes
                "Energyleaf" wie folgt verarbeitet:
            </p>
            <p>
                <span className="font-semibold">4.1 Erhebung und Auswertung des Stromverbrauchs</span>
                <br />
                Im Rahmen des Forschungsprojektes soll ein Einblick in den Stromverbrauch der Teilnehmer gewährt werden.
                Dies erfordert die Erhebung des Stromverbrauchs.
                <br />
                <br />
                <span className="font-medium">4.1.1 Zweck</span>
                <br />
                Ziel der Erhebung des Stromverbrauchs ist es, den Teilnehmern eine Übersicht über diesen eigenen
                Stromverbrauch in einer internetbasierten Anwendung bereitzustellen. Ziel der Auswertung des
                Stromverbrauchs ist es, Untersuchungen der Daten hinsichtlich der Forschungsfrage "Wirkt sich die
                Kenntnis des eigenen Stromverbrauchs auf das Verbrauchsverhalten aus?" durchzuführen. Weiterhin sollen
                diese nach einer Anonymisierung (s. Abschnitt 4.1.4) auch als Grundlage für weiterführende
                Data-Analytics oder die Entwicklung von KI-Modellen genutzt werden.
                <br />
                <br />
                <span className="font-medium">4.1.2 Rechtsgrundlage</span>
                <br />
                Für die vorliegende Verarbeitung dient eine Einwilligung gemäß Art. 6 Absatz 1 Buchst. a DSGVO als
                Rechtsgrundlage.
                <br />
                <br />
                <span className="font-medium">4.1.3 Empfänger</span>
                <br />
                Das Projektteam pseudonymisiert und wertet den Stromverbrauch der Teilnehmer aus. Anschließend werden
                die Datenzugänge intern innerhalb des Lehrstuhls von Prof. Staudt verwaltet. Die Daten werden beim
                externen Cloud-Datenbank-Dienstleister Planetscale gespeichert. Sollte es zu Folgeprojekten kommen,
                werden die Daten in der abschließenden pseudonymisierten Form an folgende Projektteams innerhalb des
                Lehrstuhls weitergegeben.
                <br />
                <br />
                <span className="font-medium">4.1.4 Dauer der Speicherung</span>
                <br />
                Die Teilnehmer haben die Möglichkeit, ihre Daten eigenständig zu löschen. Nach Abschluss der Studie
                werden die Daten von uns anonymisiert, um sicherzustellen, dass keine Rückschlüsse auf die Person mehr
                möglich sind. Die personenbezogenen Daten werden unverzüglich nach Durchführung des Projektes gelöscht.
                Die Sensordaten bleiben nach Abschluss der Studie erhalten, jedoch werden sie von jeglicher Verbindung
                zur spezifischen Person entkoppelt. Diese anonymisierten Daten dienen als Grundlage für weiterführende
                Data-Analytics oder die Entwicklung von KI-Modellen. Durch diese Verwendung ermöglichen sie zukünftige
                Forschung und Innovation, während gleichzeitig die Anonymität und der Schutz der individuellen
                Privatsphäre gewahrt bleiben. Diese Daten sollen im Rahmen von Folgeprojekten in den nächsten Jahren
                weiter genutzt werden können und deshalb zu diesem Zweck noch mehrere Jahre intern innerhalb des
                Lehrstuhls von Prof. Staudt gespeichert werden.
            </p>
            <p>
                <span className="font-semibold">4.2 Erhebung und Auswertung des Verhaltens in der Anwendung</span>
                <br />
                Während des Projektzeitraums soll das Verhalten der Teilnehmer in der Anwendung erhoben und nachträglich
                ausgewertet werden.
                <br />
                <br />
                <span className="font-medium">4.2.1 Zweck</span>
                <br />
                Ziel der Erhebung und Auswertung des Verhaltens in der Anwendung ist es, das Verhalten der Teilnehmer
                innerhalb der Anwendung während des Projektzeitraums nachträglich nachvollziehen zu können. Dadurch soll
                die Relevanz einzelner Aspekte der Anwendung für die Teilnehmer ermittelt werden. Weiterhin soll auch
                die zur Verfügung gestellte Anwendung auf Basis dieser Daten evaluiert werden, um Probleme und
                Verbesserungspotenziale zu ermitteln.
                <br />
                <br />
                <span className="font-medium">4.2.2 Rechtsgrundlage</span>
                <br />
                Für die vorliegende Verarbeitung dient eine Einwilligung gemäß Art. 6 Absatz 1 Buchst. a DSGVO als
                Rechtsgrundlage.
                <br />
                <br />
                <span className="font-medium">4.2.3 Empfänger</span>
                <br />
                Das Projektteam pseudonymisiert und wertet die Ergebnisse der Fragebögen aus. Anschließend werden die
                Datenzugänge intern innerhalb des Lehrstuhls von Prof. Staudt verwaltet. Die Daten werden beim externen
                Cloud-Datenbank-Dienstleister Planetscale gespeichert. Sollte es zu Folgeprojekten kommen, werden die
                Daten in der abschließenden pseudonymisierten Form an folgende Projektteams innerhalb des Lehrstuhls
                weitergegeben.
                <br />
                <br />
                <span className="font-medium">4.2.4 Dauer der Speicherung</span>
                <br />
                Die personenbezogenen Daten der Teilnehmer werden unverzüglich nach Durchführung des Projektes gelöscht.
                Die Daten des Klick-Verhaltens bleiben nach Abschluss der Studie erhalten und werden ebenfalls wieder
                pseudonymisiert, also von jeglicher Verbindung zur spezifischen Person entkoppelt. Diese Daten sollen im
                Rahmen von Folgeprojekten in den nächsten Jahren weiter genutzt werden können und deshalb zu diesem
                Zweck noch mehrere Jahre intern innerhalb des Lehrstuhls von Prof. Staudt gespeichert werden.
            </p>
            <p>
                <span className="font-semibold">4.3 Fragebogen</span>
                <br />
                Anschließend an den Projektzeitraum soll eine abschließende Teilnehmerbefragung durchgeführt werden, in
                der diese über die Verwendung und die Auswirkungen der internetbasierten Anwendung hinsichtlich der
                Forschungsfrage "Wirkt sich die Kenntnis des eigenen Stromverbrauchs auf das Verbrauchsverhalten aus?"
                befragt werden.
                <br />
                <br />
                <span className="font-medium">4.3.1 Zweck</span>
                <br />
                Ziel abschließenden Teilnehmerbefragung ist es, direktes Feedback der Teilnehmer hinsichtlich der
                Forschungsfrage zu erhalten, in dem diese ihre subjektiven Eindrücke durch das Verwenden der Anwendung
                darstellen.
                <br />
                Weiterhin soll auch die zur Verfügung gestellte Anwendung in diesen Fragebögen evaluiert werden, um
                Probleme und Verbesserungspotenziale zu ermitteln.
                <br />
                <br />
                <span className="font-medium">4.3.2 Rechtsgrundlage</span>
                <br />
                Für die vorliegende Verarbeitung dient eine Einwilligung gemäß Art. 6 Absatz 1 Buchst. a DSGVO als
                Rechtsgrundlage.
                <br />
                <br />
                <span className="font-medium">4.3.3 Empfänger</span>
                <br />
                Das Projektteam pseudonymisiert und wertet die Ergebnisse der Fragebögen aus. Anschließend werden die
                Datenzugänge intern innerhalb des Lehrstuhls von Prof. Staudt verwaltet. Sollte es zu Folgeprojekten
                kommen, werden die Daten in der abschließenden pseudonymisierten Form an folgende Projektteams innerhalb
                des Lehrstuhls weitergegeben.
                <br />
                <br />
                <span className="font-medium">4.3.4 Dauer der Speicherung</span>
                <br />
                Die personenbezogenen Daten der Teilnehmer werden unverzüglich nach Durchführung des Projektes gelöscht.
                Die Ergebnisse der Fragebögen bleiben nach Abschluss der Studie erhalten, jedoch werden sie wie die
                Stromverbrauchs- und Klickdaten von jeglicher Verbindung zur spezifischen Person entkoppelt. Diese Daten
                sollen im Rahmen von Folgeprojekten in den nächsten Jahren weiter genutzt werden können und deshalb zu
                diesem Zweck noch mehrere Jahre intern innerhalb des Lehrstuhls von Prof. Staudt gespeichert werden.
                Ausgenommen hiervon sind die Daten, zu deren Weiterleitung und/oder Aufbewahrung wir gesetzlich
                verpflichtet sind.
            </p>
            <p>
                <span className="font-bold">5. Ihre Rechte</span>
                <br />
                <ul className="flex list-disc flex-col gap-1">
                    <li>
                        Sie haben jederzeit die Möglichkeit, Auskunft über die von uns gespeicherten personenbezogenen
                        Daten zu erhalten. Sie können jederzeit eine Berichtigung dieser Daten sowie deren Löschung
                        verlangen.
                    </li>
                    <li>
                        Ihre Teilnahme an den Erhebungen und Ihre Zustimmung zur Verwendung der Daten wie oben
                        beschrieben sind freiwillig. Sie haben jederzeit die Möglichkeit zu widerrufen. Durch
                        Verweigerung oder Widerruf entstehen Ihnen keine Nachteile.
                    </li>
                    <li>
                        Außerdem haben Sie in dem Fall, in dem als Rechtsgrundlage für die Verarbeitung Sie die
                        Einwilligung gegeben haben, das Recht, die Einwilligung jederzeit zu widerrufen, wobei die
                        Rechtmäßigkeit, der aufgrund der Einwilligung bis zum Widerruf erfolgten Verarbeitung nicht
                        berührt wird.
                    </li>
                    <li>Bitte wenden Sie sich in dem Fall jeweils an folgende Person: Prof. Dr. Philipp Staudt</li>
                    <li>
                        Sie haben das Recht auf Beschwerde bei einer Aufsichtsbehörde, wenn Sie der Ansicht sind, dass
                        die Verarbeitung der Sie betreffenden personenbezogenen Daten gegen die Rechtsvorschriften
                        verstößt.
                    </li>
                </ul>
            </p>
        </>
    );
}
