
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
          <p>
            Verantwortlicher im Sinne der Datenschutzgesetze, insbesondere der EU-Datenschutzgrundverordnung (DSGVO), ist:
          </p>
          <p>
            Max Mustermann
            <br />
            Musterstraße 111
            <br />
            90210 Musterstadt
            <br />
            E-Mail: max@mustermann.de
          </p>

          <h2 className="text-xl font-semibold">Ihre Betroffenenrechte</h2>
          <p>
            Unter den angegebenen Kontaktdaten unseres Datenschutzbeauftragten können Sie jederzeit folgende Rechte ausüben:
            Auskunft über Ihre bei uns gespeicherten Daten und deren Verarbeitung, Berichtigung unrichtiger personenbezogener Daten,
            Löschung Ihrer bei uns gespeicherten Daten, Einschränkung der Datenverarbeitung, sofern wir Ihre Daten aufgrund gesetzlicher Pflichten noch nicht löschen dürfen,
            Widerspruch gegen die Verarbeitung Ihrer Daten bei uns und Datenübertragbarkeit, sofern Sie in die Datenverarbeitung eingewilligt haben oder einen Vertrag mit uns abgeschlossen haben.
          </p>

          <h2 className="text-xl font-semibold">Cookies</h2>
          <p>
            Wie viele andere Webseiten verwenden wir auch so genannte „Cookies“. Cookies sind kleine Textdateien, die auf Ihrem Endgerät (Laptop, Tablet, Smartphone o.ä.) gespeichert werden, wenn Sie unsere Webseite besuchen. 
            Hierdurch erhalten wir bestimmte Daten wie z. B. IP-Adresse, verwendeter Browser und Betriebssystem.
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
