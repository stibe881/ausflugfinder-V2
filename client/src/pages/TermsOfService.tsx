import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfService() {
  return (
    <div className="container mx-auto py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Allgemeine Geschäftsbedingungen (AGB)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Geltungsbereich</h2>
            <p className="text-muted-foreground">
              Diese Allgemeinen Geschäftsbedingungen (nachfolgend "AGB") gelten für alle Nutzer der Web-Applikation "AusflugFinder".
              Mit der Nutzung der Applikation erklären Sie sich mit diesen Bedingungen einverstanden.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">2. Leistungen</h2>
            <p className="text-muted-foreground">
              AusflugFinder bietet eine Plattform zur Entdeckung, Planung und Verwaltung von Familienausflügen.
              Die Nutzung der Grundfunktionen ist kostenlos. Zukünftige Premium-Funktionen können kostenpflichtig sein.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">3. Registrierung und Nutzerkonto</h2>
            <p className="text-muted-foreground">
              Für die Nutzung bestimmter Funktionen ist eine Registrierung erforderlich. Sie sind verpflichtet, bei der Registrierung wahrheitsgemässe Angaben zu machen.
              Sie sind für die Sicherheit Ihres Passworts selbst verantwortlich.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">4. Nutzerinhalte</h2>
            <p className="text-muted-foreground">
              Sie sind für alle Inhalte (wie z.B. Ausflugsdetails, Fotos, Kommentare), die Sie auf der Plattform veröffentlichen, selbst verantwortlich.
              Sie gewähren AusflugFinder eine nicht-exklusive, weltweite Lizenz zur Nutzung, Anzeige und Verbreitung Ihrer öffentlichen Inhalte im Rahmen des Betriebs der Plattform.
              Sie dürfen keine Inhalte hochladen, die gegen geltendes Recht oder die Rechte Dritter verstossen.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">5. Datenschutz</h2>
            <p className="text-muted-foreground">
              Der Schutz Ihrer Daten ist uns wichtig. Unsere Datenschutzpraktiken sind in unserer separaten <a href="/privacy-policy" className="text-primary hover:underline">Datenschutzerklärung</a> detailliert beschrieben.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">6. Haftungsausschluss</h2>
            <p className="text-muted-foreground">
              AusflugFinder übernimmt keine Gewähr für die Richtigkeit, Vollständigkeit oder Aktualität der von Nutzern bereitgestellten Informationen.
              Die Nutzung der auf der Plattform vorgeschlagenen Ausflüge und Aktivitäten erfolgt auf eigene Gefahr. AusflugFinder haftet nicht für Schäden, die im Zusammenhang mit der Durchführung eines Ausflugs entstehen.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">7. Änderungen der AGB</h2>
            <p className="text-muted-foreground">
              AusflugFinder behält sich das Recht vor, diese AGB jederzeit zu ändern. Über wesentliche Änderungen werden die Nutzer in geeigneter Form informiert.
              Wenn Sie die Plattform nach einer Änderung weiter nutzen, gilt dies als Ihre Zustimmung zu den geänderten AGB.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">8. Schlussbestimmungen</h2>
            <p className="text-muted-foreground">
              Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die Gültigkeit der übrigen Bestimmungen unberührt.
              Es gilt schweizerisches Recht. Gerichtsstand ist der Sitz von AusflugFinder.
            </p>
          </section>
          <p className="text-sm text-muted-foreground pt-4">Stand: 22. November 2025</p>
        </CardContent>
      </Card>
    </div>
  );
}
