import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@energyleaf/ui";

export default function FaqPage() {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Häufig gestellte Fragen</CardTitle>
                <CardDescription>
                    Hier ist eine Auswahl von häufig gestellten Fragen und deren Antworten. Auf die Frage klicken, um
                    die Antwort angezeigt zu bekommen.
                </CardDescription>
                <CardContent>
                    <Accordion collapsible type="single">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>Was bringt mir die Nutzung der Energyleaf-App?</AccordionTrigger>
                            <AccordionContent>
                                In der App wird dein ganz persönliches Verbrauchsverhalten dargestellt. Dies ermöglicht
                                es dir, den Überblick über Deinen Stromverbrauch zu behalten.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>
                                Wo kann ich als Geringverdiener weitere Stromsparhilfen erhalten?
                            </AccordionTrigger>
                            <AccordionContent>
                                Zum Beispiel beim Stromsparcheck:{" "}
                                <a
                                    className="text-primary hover:underline"
                                    href="https://www.stromspar-check.de"
                                    rel="noopener"
                                    target="_blank"
                                >
                                    https://www.stromspar-check.de
                                </a>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>Welche Entlastungspakete gibt es seitens der Regierung?</AccordionTrigger>
                            <AccordionContent>
                                Dazu gibt es auf der Internetseite der Bundesregierung Informationen:{" "}
                                <a
                                    className="text-primary hover:underline"
                                    href="https://www.bundesregierung.de/breg-de/themen/entlastung-fuer-deutschland"
                                    rel="noopener"
                                    target="_blank"
                                >
                                    https://www.bundesregierung.de/breg-de/themen/entlastung-fuer-deutschland
                                </a>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>
                                Wo kann ich sehen, zu welchen Zeiten heute und morgen in Deutschland voraussichtlich
                                viel Wind- und Sonnenenergie zur Verfügung steht?
                            </AccordionTrigger>
                            <AccordionContent>
                                Zum Beispiel bei aWATTar:{" "}
                                <a
                                    className="text-primary hover:underline"
                                    href="https://www.awattar.de"
                                    rel="noopener"
                                    target="_blank"
                                >
                                    https://www.awattar.de
                                </a>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-5">
                            <AccordionTrigger>
                                Wo erfahre ich mehr über die momentane Auslastung des Stromnetzes in Ba-Wü?
                            </AccordionTrigger>
                            <AccordionContent>
                                Zum Beispiel mit der App StromGedacht:{" "} 
                                <a
                                    className="text-primary hover:underline"
                                    href="https://www.stromgedacht.de"
                                    rel="noopener"
                                    target="_blank"
                                >
                                    https://www.stromgedacht.de
                                </a>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </CardHeader>
        </Card>
    );
}
