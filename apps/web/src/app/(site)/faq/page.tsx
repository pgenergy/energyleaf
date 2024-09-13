import { getSession } from "@/lib/auth/auth.server";
import { Versions, fulfills } from "@energyleaf/lib/versioning";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@energyleaf/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";

export const metadata = {
    title: "FAQ | Energyleaf",
};

export default async function FaqPage() {
    const { user } = await getSession();

    if (!user) {
        return null;
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Häufig gestellte Fragen</CardTitle>
                <CardDescription>
                    Hier finden Sie eine Auswahl von häufig gestellten Fragen und deren Antworten. Klicken Sie einfach
                    auf die Frage, um die Antwort angezeigt zu bekommen.
                </CardDescription>
                <CardContent>
                    <h2 className="mt-6 font-extrabold text-xl">Über Energyleaf</h2>
                    <Accordion collapsible type="single">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>Was bringt mir die Nutzung von Energyleaf?</AccordionTrigger>
                            <AccordionContent>
                                Energyleaf hilft Ihnen, Ihren Energieverbrauch zu überwachen und zu optimieren. Sie
                                erhalten detaillierte Einblicke in Ihr Verbrauchsverhalten und können so Stromkosten
                                sparen und umweltbewusster leben.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>Was ist der Hintergrund von Energyleaf?</AccordionTrigger>
                            <AccordionContent>
                                Energyleaf ist aus der Forschungsarbeit von Prof. Dr. Philipp Staudt entstanden. Er
                                untersucht die Auswirkung von digitalen Hilfsmitteln auf das Verständnis von
                                Privatpersonen für ihren eigenen Energieverbrauch. Im Rahmen seiner Forschung betreut er
                                die Projektgruppe Energyleaf bestehend aus (Wirtschafts-)Informatik-Studierenden der
                                Universität Oldenburg, die die gleichnamige App entwickelt haben. Mit Ihrer Teilnahme an
                                Feldexperimenten der Projektgruppe gewinnen Sie also nicht nur Einblick in Ihren
                                Stromverbrauch, sondern unterstützen auch die Forschungsarbeit der Carl von Ossietzky
                                Universität und helfen den Studierenden bei der Evaluation ihres Softwareprojekts.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>
                                An wen kann ich mich bei Fragen zur Energyleaf-App wenden?
                            </AccordionTrigger>
                            <AccordionContent>
                                Wenn Sie Anmerkungen oder Fragen zur Anwendung haben, kontaktieren Sie die
                                verantwortliche Projektgruppe unter energyleaf@uni-oldenburg.de. Das dahinterstehende
                                Forschungsprojekt stammt von Prof. Dr. Philipp Staudt, den Sie unter
                                philipp.staudt@uni-oldenburg.de erreichen können.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    <h2 className="mt-6 font-extrabold text-xl">Energyleaf bedienen</h2>
                    <Accordion collapsible type="single">
                        <AccordionItem value="item-4">
                            <AccordionTrigger>
                                Wie kann ich meinen aktuellen Energieverbrauch in Echtzeit überwachen?
                            </AccordionTrigger>
                            <AccordionContent>
                                Unter „Übersicht“ sehen Sie Ihren aktuellen Energieverbrauch in Kilowattstunden. Das
                                Liniendiagramm zeigt den Verlauf Ihres Verbrauchs, und Sie können die Daten auch im
                                CSV-Format exportieren. Der Spitzenverbrauch wird mit roten Punkten markiert.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-5">
                            <AccordionTrigger>
                                Wie kann ich meine Profilinformationen in Energyleaf aktualisieren?
                            </AccordionTrigger>
                            <AccordionContent>
                                Sie können Ihre Profilinformationen aktualisieren, indem Sie auf Ihr Profilbild oben
                                rechts klicken. Dort können Sie unter Einstellungen Ihre persönlichen Daten,
                                Tarifinformationen und Maileinstellungen anpassen.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-6">
                            <AccordionTrigger>
                                Kann ich regelmäßig Berichte über meinen Energieverbrauch erhalten?
                            </AccordionTrigger>
                            <AccordionContent>
                                Ja, sie können in den Einstellungen einstellen, dass Sie regelmäßige Berichte per E-Mail
                                erhalten, indem Sie in den Einstellungen das Intervall und die Uhrzeit der Zusendung
                                konfigurieren.
                            </AccordionContent>
                        </AccordionItem>
                        {fulfills(user.appVersion, Versions.self_reflection) && (
                            <div>
                                <AccordionItem value="item-7">
                                    <AccordionTrigger>
                                        Wie erhalte ich Benachrichtigungen bei hohem Energieverbrauch?
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        Energyleaf sendet Ihnen bei aktivierter Einstellung automatisch eine
                                        Benachrichtigung per E-Mail, wenn Ihr aktueller Verbrauch stark von Ihrem
                                        normalen Verbrauch abweicht und ungewöhnlich hoch ist. Sollten Sie die
                                        Einstellung aktivieren wollen, können Sie dies oben rechts in den Einstellungen
                                        tun.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-8">
                                    <AccordionTrigger>
                                        Wie kann ich mein Energieverbrauchsziel festlegen und überwachen?
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        Sie können in den Einstellungen ein tägliches Energieverbrauchsziel in kWh oder
                                        ein tägliches Energiebudget in Euro festlegen. Energyleaf zeigt Ihnen dann auf
                                        der Übersichtseite sowie in den Berichten, wie gut Sie Ihr Ziel erreichen, und
                                        warnt Sie, wenn Sie es überschreiten.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-9">
                                    <AccordionTrigger>
                                        Wie kann ich mein Energieverbrauchsziel festlegen und überwachen?
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        Unter „Geräte“ können Sie über die Schaltfläche „Gerät hinzufügen“ neue
                                        elektrische Geräte anlegen. Sie müssen jedem Gerät einen Namen und eine
                                        Kategorie zuweisen. Über das Aktionsmenü können Sie Geräte auch bearbeiten oder
                                        löschen.
                                    </AccordionContent>
                                </AccordionItem>
                            </div>
                        )}
                    </Accordion>

                    <h2 className="mt-6 font-extrabold text-xl">Weitere Informationen</h2>
                    <Accordion collapsible type="single">
                        <AccordionItem value="item-10">
                            <AccordionTrigger>Wo finde ich weitere Stromsparhilfen?</AccordionTrigger>
                            <AccordionContent>
                                Weitere Stromsparhilfen finden Sie zum Beispiel beim Stromsparcheck:{" "}
                                <a
                                    className="text-primary hover:underline"
                                    href="https://www.stromspar-check.de"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    https://www.stromspar-check.de
                                </a>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-11">
                            <AccordionTrigger>
                                Wo kann ich sehen, zu welchen Zeiten viel Wind- und Sonnenenergie zur Verfügung steht?
                            </AccordionTrigger>
                            <AccordionContent>
                                Informationen zur Verfügbarkeit von Wind- und Sonnenenergie finden Sie beispielsweise
                                bei aWATTar:{" "}
                                <a
                                    className="text-primary hover:underline"
                                    href="https://www.awattar.de"
                                    rel="noreferrer noopener"
                                    target="_blank"
                                >
                                    https://www.awattar.de
                                </a>{" "}
                                Dies könnte bei einem flexiblen Stromtarif von Vorteil sein.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    <h2 className="mt-6 font-extrabold text-xl">Einheiten und Größen</h2>
                    <Accordion collapsible type="single">
                        <AccordionItem value="item-12">
                            <AccordionTrigger>Was ist eine Kilowattstunde?</AccordionTrigger>
                            <AccordionContent>
                                <p>
                                    Eine Kilowattstunde (kWh) ist eine Maßeinheit für Energie. Sie sagt aus, wie viel
                                    Energie ein Gerät verbraucht, das eine Leistung von{" "}
                                    <span className="font-semibold">1 Kilowatt (1000 Watt)</span> hat, wenn es{" "}
                                    <span className="font-semibold">eine Stunde</span> lang läuft.
                                </p>
                                <p>
                                    Beispiel: Ein Gerät mit 1000 Watt muss eine Stunde lang benutzt werden, bis 1 kWh
                                    verbraucht wird. Aber ein Gerät mit 2000 Watt benötigt nur eine halbe Stunde, um 1
                                    kWh zu verbrauchen, weil es doppelt so viel Leistung hat.
                                </p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-13">
                            <AccordionTrigger>Was ist (elektrische) Leistung?</AccordionTrigger>
                            <AccordionContent>
                                Elektrische Leistung ist ein Maß dafür, wie viel elektrische Energie ein Gerät in einer
                                bestimmten Zeit nutzt. Sie gibt an, wie „stark“ oder „schnell“ ein Gerät Energie
                                verbraucht oder abgibt. Die elektrische Leistung wird in Watt (W) gemessen und wird vom
                                Elektrogerät angegeben.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-14">
                            <AccordionTrigger>Welche Kosten gibt es beim Strom?</AccordionTrigger>
                            <AccordionContent>
                                <p>
                                    Der <span className="font-semibold">Strompreis</span> ist ein an den Stromanbieter
                                    zu entrichtenden Preis pro Kilowattstunde, der den Grundpreis, Arbeitspreis und
                                    Steuern enthält.
                                </p>
                                <p>
                                    Der <span className="font-semibold">Strom-Grundpreis</span> ist eine
                                    verbrauchsunabhängige Gebühr (in €) pro Monat, entspricht dem Arbeitspreis.
                                </p>
                                <p>
                                    Der <span className="font-semibold">monatliche Abschlag</span> ist ein an den
                                    Energielieferanten pro Monat zu zahlender Betrag.
                                </p>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </CardHeader>
        </Card>
    );
}
