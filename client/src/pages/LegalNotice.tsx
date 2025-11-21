
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useLocation } from "wouter";

export default function LegalNotice() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 py-8">
      <Card className="w-full max-w-4xl mx-4 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-slate-900">Impressum</CardTitle>
        </CardHeader>
        <CardContent className="text-slate-700 space-y-4">
          <h2 className="text-xl font-semibold">Angaben gemäß § 5 TMG</h2>
          <p>
            Max Mustermann
            <br />
            Musterstraße 111
            <br />
            90210 Musterstadt
          </p>

          <h2 className="text-xl font-semibold">Kontakt</h2>
          <p>
            Telefon: +49 (0) 123 44 55 66
            <br />
            E-Mail: max@mustermann.de
          </p>

          <h2 className="text-xl font-semibold">Haftungsausschluss</h2>
          <p>
            Inhaltlich verantwortlich: Max Mustermann (Anschrift wie oben)
          </p>
          <p>
            Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links. 
            Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.
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
