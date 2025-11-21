import { Shield, Lock, FileText, Mail, Info, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Privacy() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <Shield className="h-8 w-8 text-primary" />
                        <h1 className="text-3xl font-bold">Datenschutzerklärung</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Letzte Aktualisierung: {new Date().toLocaleDateString('de-DE')}
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Introduction */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Info className="h-5 w-5" />
                                Einleitung
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p>
                                Der Schutz Ihrer persönlichen Daten ist uns ein besonderes Anliegen. Wir verarbeiten
                                Ihre Daten daher ausschließlich auf Grundlage der gesetzlichen Bestimmungen (DSGVO,
                                revDSG). In dieser Datenschutzerklärung informieren wir Sie über die wichtigsten
                                Aspekte der Datenverarbeitung im Rahmen unserer Website.
                            </p>
                            <p className="text-sm text-muted-foreground">
                                <strong>Verantwortlicher:</strong> [IHR NAME/FIRMENNAME]<br />
                                <strong>Adresse:</strong> [IHRE ADRESSE]<br />
                                <strong>E-Mail:</strong> [IHRE E-MAIL]<br />
                                <strong>Telefon:</strong> [IHRE TELEFONNUMMER]
                            </p>
                        </CardContent>
                    </Card>

                    {/* Data Collection */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Welche Daten werden erhoben?
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2">1. Automatisch erfasste Daten</h3>
                                <p className="text-sm mb-2">
                                    Bei jedem Zugriff auf unsere Website werden automatisch folgende Informationen
                                    erfasst:
                                </p>
                                <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground ml-4">
                                    <li>IP-Adresse (anonymisiert)</li>
                                    <li>Datum und Uhrzeit des Zugriffs</li>
                                    <li>Aufgerufene Seiten</li>
                                    <li>Browser-Typ und -Version</li>
                                    <li>Betriebssystem</li>
                                    <li>Referrer URL (zuvor besuchte Seite)</li>
                                </ul>
                            </div>

                            <Separator />

                            <div>
                                <h3 className="font-semibold mb-2">2. Registrierung und Benutzerkonto</h3>
                                <p className="text-sm mb-2">
                                    Wenn Sie ein Benutzerkonto anlegen, erheben wir:
                                </p>
                                <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground ml-4">
                                    <li>E-Mail-Adresse (für Login und Kommunikation)</li>
                                    <li>Benutzername</li>
                                    <li>Passwort (verschlüsselt gespeichert)</li>
                                    <li>Von Ihnen erstellte Inhalte (Ausflüge, Bewertungen, etc.)</li>
                                </ul>
                            </div>

                            <Separator />

                            <div>
                                <h3 className="font-semibold mb-2">3. Cookies</h3>
                                <p className="text-sm">
                                    Wir verwenden Cookies, um die Funktionalität unserer Website zu gewährleisten und
                                    Ihr Nutzererlebnis zu verbessern. Details finden Sie in unserer{" "}
                                    <a href="/cookie-policy" className="text-primary hover:underline">
                                        Cookie-Richtlinie
                                    </a>.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Purpose of Data Processing */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="h-5 w-5" />
                                Zweck der Datenverarbeitung
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2">Wir verarbeiten Ihre Daten für folgende Zwecke:</h3>
                                <ul className="list-disc list-inside text-sm space-y-2 text-muted-foreground ml-4">
                                    <li>
                                        <strong>Bereitstellung der Website:</strong> Um Ihnen unsere Dienste zur
                                        Verfügung zu stellen (Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO)
                                    </li>
                                    <li>
                                        <strong>Benutzerkonto-Verwaltung:</strong> Zur Verwaltung Ihres Kontos und Ihrer
                                        Daten (Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO)
                                    </li>
                                    <li>
                                        <strong>Analyse und Verbesserung:</strong> Zur Analyse des Nutzerverhaltens und
                                        Verbesserung unserer Dienste (Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO -
                                        berechtigtes Interesse, nur mit Ihrer Einwilligung)
                                    </li>
                                    <li>
                                        <strong>Sicherheit:</strong> Zur Gewährleistung der IT-Sicherheit und zum Schutz
                                        vor Missbrauch (Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO)
                                    </li>
                                    <li>
                                        <strong>Rechtliche Verpflichtungen:</strong> Zur Erfüllung gesetzlicher
                                        Verpflichtungen (Rechtsgrundlage: Art. 6 Abs. 1 lit. c DSGVO)
                                    </li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Analytics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ExternalLink className="h-5 w-5" />
                                Web-Analytics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm">
                                Wir verwenden [ANALYTICS-ANBIETER, z.B. "Umami Analytics"] zur anonymen Analyse der
                                Website-Nutzung. Diese Daten werden nur erhoben, wenn Sie der Verwendung von
                                Analyse-Cookies zugestimmt haben.
                            </p>
                            <div className="text-sm space-y-2">
                                <p><strong>Anbieter:</strong> [ANBIETER-NAME]</p>
                                <p><strong>Verarbeitete Daten:</strong> Anonymisierte Nutzungsstatistiken</p>
                                <p><strong>Zweck:</strong> Verbesserung der Website und des Nutzererlebnisses</p>
                                <p><strong>Speicherort:</strong> [SERVERSTANDORT]</p>
                                <p><strong>Speicherdauer:</strong> [DAUER, z.B. "12 Monate"]</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Data Sharing */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Weitergabe von Daten</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm">
                                Wir geben Ihre persönlichen Daten nicht an Dritte weiter, es sei denn:
                            </p>
                            <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground ml-4">
                                <li>Sie haben ausdrücklich eingewilligt</li>
                                <li>Die Weitergabe ist zur Erfüllung unserer Leistungen erforderlich</li>
                                <li>Wir sind gesetzlich dazu verpflichtet</li>
                                <li>
                                    Es ist zur Durchsetzung unserer Rechte erforderlich, insbesondere zur
                                    Durchsetzung von Ansprüchen aus dem Vertragsverhältnis
                                </li>
                            </ul>
                            <p className="text-sm mt-4">
                                <strong>Hosting-Anbieter:</strong> [IHR HOSTING-ANBIETER UND STANDORT]
                            </p>
                        </CardContent>
                    </Card>

                    {/* Data Retention */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Speicherdauer</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm">
                                Wir speichern Ihre personenbezogenen Daten nur so lange, wie dies für die Erfüllung
                                der Zwecke erforderlich ist oder gesetzliche Aufbewahrungsfristen bestehen.
                            </p>
                            <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground ml-4">
                                <li>Benutzerkonto-Daten: Bis zur Löschung des Kontos</li>
                                <li>Server-Logs: Maximal 30 Tage</li>
                                <li>Analytics-Daten: [DAUER, z.B. "12 Monate"]</li>
                                <li>Cookie-Einstellungen: Bis zur Änderung durch Sie</li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* User Rights */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="h-5 w-5" />
                                Ihre Rechte
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm mb-4">
                                Ihnen stehen grundsätzlich die Rechte auf Auskunft, Berichtigung, Löschung,
                                Einschränkung, Datenübertragbarkeit, Widerruf und Widerspruch zu.
                            </p>

                            <div className="space-y-3">
                                <div>
                                    <h4 className="font-semibold text-sm mb-1">Auskunftsrecht</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Sie haben das Recht, Auskunft über Ihre bei uns gespeicherten Daten zu erhalten.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-sm mb-1">Recht auf Berichtigung</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Sie können die Berichtigung unrichtiger Daten verlangen.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-sm mb-1">Recht auf Löschung</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Sie können die Löschung Ihrer Daten verlangen, sofern keine gesetzlichen
                                        Aufbewahrungspflichten entgegenstehen.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-sm mb-1">Widerrufsrecht</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Sie können erteilte Einwilligungen jederzeit mit Wirkung für die Zukunft
                                        widerrufen.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-sm mb-1">Beschwerderecht</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die
                                        Verarbeitung Ihrer Daten zu beschweren.
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            <p className="text-sm">
                                <strong>Kontakt für Datenschutzanfragen:</strong><br />
                                E-Mail: [DATENSCHUTZ-E-MAIL]<br />
                                Adresse: [IHRE ADRESSE]
                            </p>
                        </CardContent>
                    </Card>

                    {/* SSL/TLS */}
                    <Card>
                        <CardHeader>
                            <CardTitle>SSL/TLS-Verschlüsselung</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">
                                Diese Website verwendet aus Sicherheitsgründen und zum Schutz der Übertragung
                                vertraulicher Inhalte eine SSL/TLS-Verschlüsselung. Eine verschlüsselte Verbindung
                                erkennen Sie daran, dass die Adresszeile des Browsers von "http://" auf "https://"
                                wechselt und an dem Schloss-Symbol in Ihrer Browserzeile.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Changes */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Änderungen dieser Datenschutzerklärung</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">
                                Wir behalten uns vor, diese Datenschutzerklärung gelegentlich anzupassen, damit sie
                                stets den aktuellen rechtlichen Anforderungen entspricht oder um Änderungen unserer
                                Leistungen umzusetzen. Für Ihren erneuten Besuch gilt dann die neue
                                Datenschutzerklärung.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Back Link */}
                <div className="mt-8">
                    <a
                        href="/"
                        className="inline-flex items-center text-sm text-primary hover:underline"
                    >
                        ← Zurück zur Startseite
                    </a>
                </div>
            </div>
        </div>
    );
}
