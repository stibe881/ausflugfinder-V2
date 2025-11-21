
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useLocation } from "wouter";

export default function PrivacyPolicy() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 py-8">
      <Card className="w-full max-w-4xl mx-4 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-slate-900">Datenschutzerklärung</CardTitle>
        </CardHeader>
        <CardContent className="text-slate-700 space-y-4">
          <h2 className="text-xl font-semibold">Verantwortliche Stelle</h2>
          <p>
            Verantwortlicher im Sinne der Datenschutzgesetze ist:
            <br /><br />
            AusflugFinder.ch
            <br />
            Stefan Gross
            <br />
            Neuhushof 3
            <br />
            CH-6411 Zell LU
            <br />
            E-Mail: stefan.gross@hotmail.ch
          </p>

          <h2 className="text-xl font-semibold">Ihre Betroffenenrechte</h2>
          <p>
            Sie können jederzeit folgende Rechte ausüben:
            <ul>
              <li>Auskunft über Ihre bei uns gespeicherten Daten und deren Verarbeitung.</li>
              <li>Berichtigung unrichtiger personenbezogener Daten.</li>
              <li>Löschung Ihrer bei uns gespeicherten Daten.</li>
              <li>Einschränkung der Datenverarbeitung, sofern wir Ihre Daten aufgrund gesetzlicher Pflichten noch nicht löschen dürfen.</li>
              <li>Widerspruch gegen die Verarbeitung Ihrer Daten bei uns.</li>
            </ul>
            Für Anfragen zu Ihren Rechten oder zum Datenschutz wenden Sie sich bitte an die oben angegebene E-Mail-Adresse.
          </p>

          <h2 className="text-xl font-semibold">Erfassung allgemeiner Informationen</h2>
          <p>
            Wenn Sie auf unsere Website zugreifen, werden automatisch mittels eines Cookies Informationen allgemeiner Natur erfasst. Diese Informationen (Server-Logfiles) beinhalten etwa die Art des Webbrowsers, das verwendete Betriebssystem, den Domainnamen Ihres Internet-Service-Providers und ähnliches.
          </p>

          <h2 className="text-xl font-semibold">Cookies</h2>
          <p>
            Unsere Website verwendet Cookies, um die Benutzerfreundlichkeit zu erhöhen. Cookies sind kleine Textdateien, die auf Ihrem Endgerät gespeichert werden. Einige der von uns verwendeten Cookies werden nach Ende der Browser-Sitzung wieder gelöscht (sog. Sitzungs-Cookies). Andere Cookies verbleiben auf Ihrem Endgerät und ermöglichen es uns, Ihren Browser beim nächsten Besuch wiederzuerkennen (persistente Cookies). Weitere Informationen zu den von uns verwendeten Cookies finden Sie in unserem Cookie-Banner.
          </p>

          <h2 className="text-xl font-semibold">Registrierung und Benutzerkonto</h2>
          <p>
            Bei der Registrierung für die Nutzung unserer personalisierten Leistungen werden einige personenbezogene Daten erhoben. Um Ihnen den vollen Funktionsumfang der App zu bieten, speichern wir folgende Daten: Name, E-Mail, Passwort (als Hash), sowie von Ihnen erstellte Inhalte wie Standortdaten, Reisepläne und Fotos. Diese Daten werden ausschließlich zur Bereitstellung der App-Funktionen verwendet.
          </p>
          
          <h2 className="text-xl font-semibold">Push-Benachrichtigungen</h2>
          <p>
            Wenn Sie zustimmen, können wir Ihnen Push-Benachrichtigungen senden, um Sie über wichtige Ereignisse oder Updates zu informieren. Sie können Ihre Zustimmung jederzeit in den Einstellungen Ihres Geräts widerrufen.
          </p>

          <h2 className="text-xl font-semibold">Verwendung von Google Maps</h2>
          <p>
            Diese Webseite verwendet Google Maps, um geographische Informationen visuell darzustellen. Bei der Nutzung von Google Maps werden von Google auch Daten über die Nutzung der Kartenfunktionen durch Besucher erhoben, verarbeitet und genutzt. Nähere Informationen über die Datenverarbeitung durch Google können Sie den Google-Datenschutzhinweisen entnehmen. Dort können Sie im Datenschutzcenter auch Ihre persönlichen Datenschutz-Einstellungen verändern.
          </p>

          <h2 className="text-xl font-semibold">Serverstandort</h2>
          <p>
            Ihre Daten werden auf Servern in der Schweiz gehostet.
          </p>

          <h2 className="text-xl font-semibold">Datenlöschung und -aufbewahrung</h2>
          <p>
            Wir speichern Ihre personenbezogenen Daten nur so lange, wie dies zur Erreichung der hier genannten Zwecke erforderlich ist oder wie es die vom Gesetzgeber vorgesehenen vielfältigen Speicherfristen vorsehen. Um die Löschung Ihrer Daten zu beantragen, senden Sie bitte eine E-Mail an stefan.gross@hotmail.ch.
          </p>

          <h2 className="text-xl font-semibold">Änderung unserer Datenschutzbestimmungen</h2>
          <p>
            Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen in der Datenschutzerklärung umzusetzen, z.B. bei der Einführung neuer Services. Für Ihren erneuten Besuch gilt dann die neue Datenschutzerklärung.
          </p>
          
          <div className="pt-6 text-center">
            <Button
                onClick={handleGoHome}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
                <Home className="w-4 h-4 mr-2" />
                Zurück zur Startseite
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
