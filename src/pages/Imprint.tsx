import { Building, Mail, Phone, MapPin, Scale } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Imprint() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <Building className="h-8 w-8 text-primary" />
                        <h1 className="text-3xl font-bold">Impressum</h1>
                    </div>
                    <p className="text-muted-foreground">Angaben gemäß § 5 TMG / Art. 14 e-DSG</p>
                </div>

                <div className="space-y-6">
                    {/* Provider Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building className="h-5 w-5" />
                                Anbieter
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="font-semibold">[IHR NAME / FIRMENNAME]</p>
                                <p className="text-sm text-muted-foreground">[RECHTSFORM, z.B. "Einzelunternehmen", "GmbH", etc.]</p>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Adresse</p>
                                        <p className="text-sm text-muted-foreground">
                                            [STRASSE UND HAUSNUMMER]<br />
                                            [PLZ ORT]<br />
                                            [LAND]
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">E-Mail</p>
                                        <a
                                            href="mailto:[IHRE-EMAIL]"
                                            className="text-sm text-primary hover:underline"
                                        >
                                            [IHRE-EMAIL]
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Telefon</p>
                                        <a
                                            href="tel:[TELEFONNUMMER]"
                                            className="text-sm text-primary hover:underline"
                                        >
                                            [TELEFONNUMMER]
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Legal Representative */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Vertretungsberechtigt</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">
                                <strong>Geschäftsführung / Inhaber:</strong> [NAME DER GESCHÄFTSFÜHRUNG]
                            </p>
                        </CardContent>
                    </Card>

                    {/* Register Entry (if applicable) */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Registereintrag</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="text-sm text-muted-foreground italic">
                                Falls zutreffend, bitte ausfüllen:
                            </p>
                            <div className="text-sm space-y-1">
                                <p><strong>Registergericht:</strong> [REGISTERGERICHT]</p>
                                <p><strong>Registernummer:</strong> [HANDELSREGISTERNUMMER]</p>
                                <p><strong>Umsatzsteuer-ID:</strong> [UST-ID]</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-3">
                                * Wenn nicht zutreffend (z.B. bei Kleinunternehmen), bitte diesen Abschnitt entfernen
                            </p>
                        </CardContent>
                    </Card>

                    {/* Responsible for Content */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Verantwortlich für den Inhalt</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">
                                <strong>Verantwortlich nach § 55 Abs. 2 RStV:</strong><br />
                                [NAME]<br />
                                [ADRESSE]
                            </p>
                        </CardContent>
                    </Card>

                    {/* Dispute Resolution */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Scale className="h-5 w-5" />
                                Streitbeilegung
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <h3 className="font-semibold text-sm mb-2">
                                    EU-Streitschlichtung
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS)
                                    bereit:{" "}
                                    <a
                                        href="https://ec.europa.eu/consumers/odr/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline"
                                    >
                                        https://ec.europa.eu/consumers/odr/
                                    </a>
                                </p>
                            </div>

                            <Separator />

                            <div>
                                <h3 className="font-semibold text-sm mb-2">
                                    Verbraucherstreitbeilegung / Universalschlichtungsstelle
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
                                    Verbraucherschlichtungsstelle teilzunehmen.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Copyright */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Urheberrecht</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">
                                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten
                                unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung,
                                Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes
                                bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
                                Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen
                                Gebrauch gestattet.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Disclaimer */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Haftungsausschluss</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-sm mb-2">Haftung für Inhalte</h3>
                                <p className="text-sm text-muted-foreground">
                                    Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen
                                    Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir
                                    als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte
                                    fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine
                                    rechtswidrige Tätigkeit hinweisen.
                                </p>
                            </div>

                            <Separator />

                            <div>
                                <h3 className="font-semibold text-sm mb-2">Haftung für Links</h3>
                                <p className="text-sm text-muted-foreground">
                                    Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir
                                    keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine
                                    Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige
                                    Anbieter oder Betreiber der Seiten verantwortlich.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Switzerland Specific (if applicable) */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Hinweis für Schweizer Nutzer</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Diese Website unterliegt dem schweizerischen Datenschutzgesetz (revDSG). Weitere
                                Informationen finden Sie in unserer{" "}
                                <a href="/privacy" className="text-primary hover:underline">
                                    Datenschutzerklärung
                                </a>.
                            </p>
                            <p className="text-sm text-muted-foreground mt-3">
                                Bei Fragen zum Datenschutz können Sie sich an den Eidgenössischen Datenschutz- und
                                Öffentlichkeitsbeauftragten (EDÖB) wenden:{" "}
                                <a
                                    href="https://www.edoeb.admin.ch/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                >
                                    https://www.edoeb.admin.ch/
                                </a>
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Back Link */}
                <div className="mt-8">
                    <a href="/" className="inline-flex items-center text-sm text-primary hover:underline">
                        ← Zurück zur Startseite
                    </a>
                </div>
            </div>
        </div>
    );
}
