import { getActionSession } from "@/lib/auth/auth.action";
import { Versions, fulfills } from "@energyleaf/lib/versioning";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@energyleaf/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";

export const metadata = {
    title: "FAQ | Energyleaf",
};

export default async function FaqPage() {
    const { user } = await getActionSession();

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
                                rechts klicken. Dort können Sie Ihre persönlichen Daten, Tarifinformationen und
                                Maileinstellungen anpassen.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-6">
                            <AccordionTrigger>
                                Kann ich regelmäßig Berichte über meinen Energieverbrauch erhalten?
                            </AccordionTrigger>
                            <AccordionContent>
                                Ja, sie können im Profil einstellen, dass Sie regelmäßige Berichte per E-Mail erhalten,
                                indem Sie im Profil das Intervall und die Uhrzeit der Zusendung konfigurieren.
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
                                        Einstellung aktivieren wollen, können Sie dies oben rechts in Ihrem Profil tun.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-8">
                                    <AccordionTrigger>
                                        Wie kann ich mein Energieverbrauchsziel festlegen und überwachen?
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        Sie können in Ihrem Profil ein tägliches Energieverbrauchsziel in kWh oder ein
                                        tägliches Energiebudget in Euro festlegen. Energyleaf zeigt Ihnen dann auf der
                                        Übersichtseite sowie in den Berichten, wie gut Sie Ihr Ziel erreichen, und warnt
                                        Sie, wenn Sie es überschreiten.
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
                </CardContent>
            </CardHeader>
        </Card>
    );
}
