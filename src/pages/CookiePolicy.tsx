import { Cookie, Shield, Clock, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function CookiePolicy() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <Cookie className="h-8 w-8 text-primary" />
                        <h1 className="text-3xl font-bold">Cookie-Richtlinie</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Letzte Aktualisierung: {new Date().toLocaleDateString('de-DE')}
                    </p>
                </div>

                <div className="space-y-6">
                    {/* What are Cookies */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Info className="h-5 w-5" />
                                Was sind Cookies?
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm">
                                Cookies sind kleine Textdateien, die auf Ihrem Gerät gespeichert werden, wenn Sie
                                eine Website besuchen. Sie werden verwendet, um Websites funktionsfähig zu machen,
                                die Benutzererfahrung zu verbessern und Informationen über die Nutzung der Website
                                zu sammeln.
                            </p>
                            <p className="text-sm">
                                Wir verwenden verschiedene Arten von Cookies auf unserer Website. Sie können Ihre
                                Cookie-Einstellungen jederzeit über den Cookie-Banner oder im Footer unserer Website
                                anpassen.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Cookie Types */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Arten von Cookies, die wir verwenden</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Necessary Cookies */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Shield className="h-5 w-5 text-green-600" />
                                    <h3 className="font-semibold">Notwendige Cookies</h3>
                                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                        Immer aktiv
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">
                                    Diese Cookies sind für die Grundfunktionen der Website absolut notwendig und können
                                    nicht deaktiviert werden.
                                </p>
                                <div className="bg-muted/50 rounded-lg p-4">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left pb-2">Cookie-Name</th>
                                                <th className="text-left pb-2">Zweck</th>
                                                <th className="text-left pb-2">Dauer</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-muted-foreground">
                                            <tr className="border-b">
                                                <td className="py-2">
                                                    <code className="text-xs bg-background px-1 py-0.5 rounded">
                                                        cookieConsent
                                                    </code>
                                                </td>
                                                <td className="py-2">Speichert Ihre Cookie-Einstellungen</td>
                                                <td className="py-2">1 Jahr</td>
                                            </tr>
                                            <tr className="border-b">
                                                <td className="py-2">
                                                    <code className="text-xs bg-background px-1 py-0.5 rounded">
                                                        session
                                                    </code>
                                                </td>
                                                <td className="py-2">Verwaltet Ihre Anmeldesitzung</td>
                                                <td className="py-2">Session</td>
                                            </tr>
                                            <tr>
                                                <td className="py-2">
                                                    <code className="text-xs bg-background px-1 py-0.5 rounded">
                                                        auth_token
                                                    </code>
                                                </td>
                                                <td className="py-2">Authentifizierung und Zugriffskontrolle</td>
                                                <td className="py-2">7 Tage</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <Separator />

                            {/* Analytics Cookies */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Cookie className="h-5 w-5 text-blue-600" />
                                    <h3 className="font-semibold">Analyse-Cookies</h3>
                                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                        Optional
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">
                                    Diese Cookies helfen uns zu verstehen, wie Besucher mit unserer Website
                                    interagieren. Alle Informationen werden anonym gesammelt.
                                </p>
                                <div className="bg-muted/50 rounded-lg p-4">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left pb-2">Cookie-Name</th>
                                                <th className="text-left pb-2">Anbieter</th>
                                                <th className="text-left pb-2">Zweck</th>
                                                <th className="text-left pb-2">Dauer</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-muted-foreground">
                                            <tr>
                                                <td className="py-2">
                                                    <code className="text-xs bg-background px-1 py-0.5 rounded">
                                                        _analytics
                                                    </code>
                                                </td>
                                                <td className="py-2">[IHR ANALYTICS-ANBIETER]</td>
                                                <td className="py-2">Erfasst anonyme Nutzungsstatistiken</td>
                                                <td className="py-2">12 Monate</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <p className="text-xs text-muted-foreground mt-3">
                                        <strong>Anbieter:</strong> [ANALYTICS-ANBIETER-NAME UND STANDORT]<br />
                                        <strong>Datenschutzerklärung:</strong>{" "}
                                        <a
                                            href="[LINK ZUR DATENSCHUTZERKLÄRUNG DES ANBIETERS]"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline"
                                        >
                                            [LINK]
                                        </a>
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            {/* Marketing Cookies */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Cookie className="h-5 w-5 text-purple-600" />
                                    <h3 className="font-semibold">Marketing-Cookies</h3>
                                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                                        Optional
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">
                                    Diese Cookies werden verwendet, um Werbung anzuzeigen, die für Sie relevant ist.
                                </p>
                                <div className="bg-muted/50 rounded-lg p-4">
                                    <p className="text-sm text-muted-foreground italic">
                                        Aktuell verwenden wir keine Marketing-Cookies. Sollte sich dies ändern, werden
                                        wir Sie informieren und Ihre Zustimmung einholen.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* How to Control Cookies */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Cookie-Verwaltung
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2 text-sm">Über unsere Website</h3>
                                <p className="text-sm text-muted-foreground">
                                    Sie können Ihre Cookie-Einstellungen jederzeit über den Cookie-Banner (beim ersten
                                    Besuch) oder über den Link "Cookie-Einstellungen" im Footer unserer Website
                                    anpassen.
                                </p>
                            </div>

                            <Separator />

                            <div>
                                <h3 className="font-semibold mb-2 text-sm">Über Ihren Browser</h3>
                                <p className="text-sm text-muted-foreground mb-3">
                                    Die meisten Browser ermöglichen es Ihnen, Cookies zu kontrollieren. Sie können:
                                </p>
                                <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground ml-4">
                                    <li>Alle Cookies anzeigen und einzeln löschen</li>
                                    <li>Cookies von Drittanbietern blockieren</li>
                                    <li>Alle Cookies blockieren</li>
                                    <li>Alle Cookies beim Schließen des Browsers löschen</li>
                                </ul>
                                <p className="text-sm text-muted-foreground mt-3">
                                    <strong>Hinweis:</strong> Wenn Sie alle Cookies blockieren, funktionieren einige
                                    Teile unserer Website möglicherweise nicht korrekt.
                                </p>
                            </div>

                            <Separator />

                            <div>
                                <h3 className="font-semibold mb-2 text-sm">Browser-Anleitungen</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                    <a
                                        href="https://support.google.com/chrome/answer/95647"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline flex items-center gap-1"
                                    >
                                        Chrome
                                        <Info className="h-3 w-3" />
                                    </a>
                                    <a
                                        href="https://support.mozilla.org/de/kb/cookies-erlauben-und-ablehnen"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline flex items-center gap-1"
                                    >
                                        Firefox
                                        <Info className="h-3 w-3" />
                                    </a>
                                    <a
                                        href="https://support.apple.com/de-de/guide/safari/sfri11471/mac"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline flex items-center gap-1"
                                    >
                                        Safari
                                        <Info className="h-3 w-3" />
                                    </a>
                                    <a
                                        href="https://support.microsoft.com/de-de/microsoft-edge/cookies-in-microsoft-edge-l%C3%B6schen-63947406-40ac-c3b8-57b9-2a946a29ae09"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline flex items-center gap-1"
                                    >
                                        Edge
                                        <Info className="h-3 w-3" />
                                    </a>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Updates */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Änderungen dieser Richtlinie
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">
                                Wir können diese Cookie-Richtlinie von Zeit zu Zeit aktualisieren, um Änderungen in
                                unseren Praktiken oder aus anderen betrieblichen, rechtlichen oder regulatorischen
                                Gründen zu reflektieren. Bitte überprüfen Sie diese Seite regelmäßig, um über unsere
                                Verwendung von Cookies informiert zu bleiben.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Contact */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Kontakt</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">
                                Wenn Sie Fragen zu unserer Verwendung von Cookies haben, kontaktieren Sie uns bitte:
                            </p>
                            <p className="text-sm mt-3">
                                <strong>E-Mail:</strong> [IHRE E-MAIL]<br />
                                <strong>Adresse:</strong> [IHRE ADRESSE]
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
