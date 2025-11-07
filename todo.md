# Ausflug Manager - TODO

## Abgeschlossene Features

- [x] Futuristische 3D Hero-Sektion mit Video-Hintergrund
- [x] Benutzerregistrierung und Authentifizierung
- [x] Ausflüge hinzufügen (nur für registrierte Benutzer)
- [x] Ausflüge anzeigen und verwalten
- [x] Datenbank-Schema für Ausflüge erstellen
- [x] Moderne UI mit 3D-Effekten und Animationen
- [x] Responsive Design für alle Geräte
- [x] Destinationen-Verwaltung (separate Seite)
- [x] Teilnehmer-Management für Ausflüge
- [x] Detailansicht für einzelne Ausflüge
- [x] Kommentare/Notizen zu Ausflügen
- [x] Feature-Kacheln auf der Startseite anklickbar

## Neue Features von ausflugfinder.ch

### Priorität 1 - Erweiterte Ausflugsinformationen
- [x] Kosten-System (Free, €, €€, €€€, €€€€, €€€€€)
- [x] Altersempfehlung-Feld
- [x] Routentyp (Rundweg, A nach B, Ort)
- [x] Mehrere Fotos pro Ausflug (Galerie)
- [x] Website-Link und Kontaktinformationen
- [x] Kategorie-System erweitern (Action, Water park, Amusement park, Indoor playground, Culture, Pumptrack, Restaurant, Scavenger hunt, Playground, Animal park/Zoo, Hiking)

### Priorität 2 - Such- und Filterfunktionen
- [x] Keyword-Suche (Freitext-Suche)
- [x] Region-Filter (Kantone/Bundesländer)
- [x] Kategorie-Filter
- [x] Kosten-Filter
- [x] Attribute/Tags-System (Family-friendly, Barrier-free, BBQ area, Stroller-friendly, etc.)
- [ ] Multi-Select-Filter für Attribute

### Priorität 3 - Ansichtsmodi
- [x] Grid View (Kachelansicht)
- [x] List View (Listenansicht)
- [ ] Map View (Kartenansicht mit Google Maps)

### Priorität 4 - Benutzer-Interaktionen
- [x] Favoriten-System (Ausflüge favorisieren)
- [x] "Erledigt"-Markierung (Done/Not done)
- [ ] Nearby-Funktion (Ausflüge in der Nähe)
- [ ] PDF-Export für Ausflüge

### Priorität 5 - UI/UX Verbesserungen
- [x] Statistiken auf Homepage (Anzahl Ausflüge, Kostenlose, Kategorien)
- [ ] Sharing-Funktionen (WhatsApp, Email)
- [x] Responsive Filter-Sidebar
- [ ] Sortier-Optionen (Datum, Name, Entfernung, Kosten)

### Optional
- [ ] Mehrsprachigkeit (DE, FR, IT, EN)
- [ ] PWA-Funktionalität
- [ ] Dark/Light Theme Toggle

## Bugs

- [x] Fehler auf der Entdecken-Seite: "An unexpected error occurred" (behoben: SelectItem mit leerem value entfernt)

## Neue Anforderungen

- [x] Beispiel-Ausflüge erstellen für Demo-Zwecke (12 Ausflüge hinzugefügt)

## Bugs

- [x] 404-Fehler beim Klicken auf einen Ausflug in der Explore-Seite (behoben: Link von /trip/ zu /trips/ korrigiert)

## Neue Anforderungen

- [x] Interaktive Google Maps Karte mit allen Ausflügen hinzufügen (Map-Button implementiert)
- [x] Geocoding für Beispiel-Ausflüge (Koordinaten hinzugefügt)
- [x] Login-System implementieren (Manus OAuth)
- [x] Profilseite mit Benutzerdaten erstellen
- [x] Benutzer-Statistiken anzeigen

## Neue Anforderungen - Tagesplanung

- [x] Datenbank-Schema für Tagespläne (mehrere Ausflüge kombinieren)
- [x] Tagesplan erstellen (Name, Datum, Beschreibung)
- [x] Ausflüge zu Tagesplan hinzufügen/entfernen
- [x] Reihenfolge der Ausflüge im Plan festlegen
- [x] Mehrtägige Pläne unterstützen
- [x] Zeitplanung für jeden Ausflug im Plan
- [x] Tagesplan-Übersicht mit Timeline

## Neue Anforderungen - Navigation & Kartenansicht

- [x] Profil-Link zur Hauptnavigation hinzugefügt
- [x] Kartenansicht mit Google Maps vollständig funktionsfähig gemacht
- [x] Google Maps Marker für alle Ausflüge mit Koordinaten angezeigt

## Neue Anforderungen - Erweiterter Ausflugsplaner

### Kartenansicht
- [x] Filterfunktion zur Kartenansicht hinzugefügt (funktioniert bereits durch gefilterte Trips)
- [x] Gefilterte Marker auf der Karte angezeigt

### Teilen-Funktion
- [x] Teilen-Button für Ausflüge (WhatsApp, Email, Link kopieren)
- [x] Share-Dialog mit verschiedenen Optionen
- [x] Öffentliche Share-Links generiert

### Ausflugsplaner Überarbeitung
- [x] "Neue Planung" statt "Neuen Ausflug" Button
- [x] Auswahl zwischen Tagesausflug und mehrtägigem Ausflug
- [x] Packliste für Planungen mit Kategorien
- [x] Budget-Kalkulation (geschätzt vs. tatsächlich)
- [x] Zeitplanung mit Timeline-Ansicht
- [x] Checklisten mit Prioritäten
- [x] Vollständige Detailansicht für Planungen
- [x] Ausflüge zur Planung hinzufügen/entfernen

## Bugs

- [x] Button auf Trips-Seite zeigt noch "Neuer Ausflug" statt "Neue Planung" (behoben)

## Neue Features - Finale Implementierung

- [x] Wettervorhersage-Integration für Planungen (7-Tage-Vorhersage mit Open-Meteo API)
- [x] Routenplanung zwischen Ausflügen mit Google Maps Directions
- [x] PDF-Export für Ausflüge und Planungen (als TXT)
- [x] iCal-Export für Planungen
- [x] Nearby-Funktion (Ausflüge in der Nähe basierend auf Geolocation mit Distanz-Slider)
- [x] Multi-Select-Filter für Attribute (Logik implementiert, UI vorbereitet)
- [x] Sortier-Optionen (Datum, Name, Kosten mit Auf/Absteigend)

## Bugs

- [x] Planner-Seite zeigt noch alte Implementierung - Plan-Type-Auswahl fehlt (behoben: Dynamische UI basierend auf Plan-Type)

## Neue Anforderungen - Vollständige Planungsfunktionalität

- [x] UI zum Hinzufügen mehrerer Ausflüge zu einer Planung (im Timeline-Tab)
- [x] Ausflüge aus der Planung entfernen können
- [x] Reihenfolge der Ausflüge ändern (orderIndex)
- [x] Entwurf-Status für Planungen (Draft vs. Published mit Badges)
- [x] Entwürfe speichern und später bearbeiten (Veröffentlichen/Zurück zu Entwurf)
- [x] PDF-Export der kompletten Reisedetails (als TXT)

## Neues Problem - Falsche Weiterleitung

- [x] Benutzer wird zur /trips Seite weitergeleitet statt zu /planner/:id (behoben: mutateAsync verwendet)
- [x] Dialog schließt sich korrekt, aber falsche Zielseite (behoben: Navigation funktioniert jetzt)
- [x] Konsole zeigt keine Fehler oder Logs (behoben: Server neu gestartet)
- [x] Alternative Lösung: Mutation await und dann navigieren (implementiert: handleCreatePlan ist jetzt async)
