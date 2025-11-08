# Murmeltier-Maskottchen - Standalone Integration

Diese Anleitung zeigt, wie Sie das Murmeltier-Maskottchen in **jede beliebige Webseite** integrieren können - ohne React, ohne Build-Tools, einfach per HTML und JavaScript.

## Schritt 1: Dateien herunterladen

Laden Sie folgende Dateien von der Demo-Seite herunter und laden Sie sie auf Ihren Webserver hoch:

```
mascot-widget.css
mascot-widget.js
facts_data.json

# Saisonale Varianten (automatisch je nach Jahreszeit)
marmot_winter.png      # Dezember-Februar (mit Mütze und Schal)
marmot_spring.png      # März-Mai (mit Blumen)
marmot_summer.png      # Juni-August (mit Sonnenbrille)
marmot_autumn.png      # September-November (mit Herbstblättern)

# Animations-Posen
marmot_family_jumping.png
marmot_family_dancing.png
marmot_family_surprised.png
```

**Wichtig**: Alle Dateien sollten im gleichen Verzeichnis liegen (z.B. `/assets/mascot/`).

## Schritt 2: Integration in Ihre Webseite

Fügen Sie folgende Zeilen in den `<head>` Bereich Ihrer HTML-Seite ein:

```html
<link rel="stylesheet" href="/assets/mascot/mascot-widget.css">
```

Fügen Sie dann vor dem schließenden `</body>` Tag ein:

```html
<div id="ausflugfinder-mascot"></div>
<script src="/assets/mascot/mascot-widget.js"></script>
```

**Das war's!** Das Maskottchen erscheint jetzt unten rechts auf Ihrer Webseite.

## Schritt 3: Anpassung (Optional)

### Position ändern

Fügen Sie **vor** dem `mascot-widget.js` Script ein:

```html
<script>
  window.MarmotMascotConfig = function(config) {
    config.position = 'bottom-left'; // bottom-right, bottom-left, top-right, top-left
  };
</script>
<script src="/assets/mascot/mascot-widget.js"></script>
```

### Größe ändern

```html
<script>
  window.MarmotMascotConfig = function(config) {
    config.size = 'large'; // small, medium, large
  };
</script>
<script src="/assets/mascot/mascot-widget.js"></script>
```

### Pfad zu den Dateien anpassen

Falls die Bilder in einem anderen Verzeichnis liegen:

```html
<script>
  window.MarmotMascotConfig = function(config) {
    config.basePath = '/pfad/zu/bildern';
    config.factsPath = '/pfad/zu/facts_data.json';
  };
</script>
<script src="/assets/mascot/mascot-widget.js"></script>
```

### Anzeigedauer der Sprechblase ändern

```html
<script>
  window.MarmotMascotConfig = function(config) {
    config.bubbleDisplayTime = 10000; // 10 Sekunden (Standard: 8000)
  };
</script>
<script src="/assets/mascot/mascot-widget.js"></script>
```

## Vollständiges Beispiel

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meine Webseite</title>
  
  <!-- Maskottchen CSS -->
  <link rel="stylesheet" href="/assets/mascot/mascot-widget.css">
</head>
<body>
  
  <!-- Ihr bestehender Inhalt -->
  <h1>Willkommen auf meiner Webseite</h1>
  <p>Hier ist mein Inhalt...</p>
  
  <!-- Maskottchen Container -->
  <div id="ausflugfinder-mascot"></div>
  
  <!-- Optional: Konfiguration -->
  <script>
    window.MarmotMascotConfig = function(config) {
      config.position = 'bottom-right';
      config.size = 'medium';
      config.basePath = '/assets/mascot';
      config.factsPath = '/assets/mascot/facts_data.json';
    };
  </script>
  
  <!-- Maskottchen JavaScript -->
  <script src="/assets/mascot/mascot-widget.js"></script>
  
</body>
</html>
```

## Features

- ✅ **Saisonale Anpassung**: Die Murmeltiere ändern automatisch ihr Aussehen je nach Jahreszeit
- ✅ **65+ Fakten**: Über Natur, Ausflüge, Geschichte und die Schweiz
- ✅ **Keine Wiederholungen**: Es wird nie zweimal hintereinander dasselbe Kunststück gezeigt
- ✅ **Responsive**: Passt sich automatisch an mobile Geräte an
- ✅ **Leichtgewichtig**: Keine externen Abhängigkeiten, minimale Dateigröße
- ✅ **Einfache Integration**: Funktioniert mit jeder Webseite (WordPress, Joomla, statisches HTML, etc.)

## Eigene Fakten hinzufügen

Bearbeiten Sie die Datei `facts_data.json`:

```json
{
  "facts": [
    {
      "text": "Ihr eigener Fakt hier!",
      "category": "natur"
    },
    {
      "text": "Noch ein interessanter Fakt!",
      "category": "ausflug"
    }
  ]
}
```

Verfügbare Kategorien: `natur`, `ausflug`, `geschichte`, `schweiz`

## Browser-Kompatibilität

- ✅ Chrome/Edge (neueste Versionen)
- ✅ Firefox (neueste Versionen)
- ✅ Safari (neueste Versionen)
- ✅ Mobile Browser (iOS Safari, Chrome Mobile)
- ✅ Internet Explorer 11+ (mit Polyfills)

## Fehlerbehebung

### Maskottchen wird nicht angezeigt

1. Überprüfen Sie die Browser-Konsole auf Fehler (F12)
2. Stellen Sie sicher, dass das Element `<div id="ausflugfinder-mascot"></div>` vorhanden ist
3. Prüfen Sie, ob die CSS- und JS-Dateien korrekt geladen werden
4. Überprüfen Sie die Pfade zu den Bildern

### Fakten werden nicht geladen

1. Überprüfen Sie den Pfad zur `facts_data.json` Datei
2. Stellen Sie sicher, dass die JSON-Datei valide ist
3. Prüfen Sie CORS-Einstellungen auf Ihrem Server

### Bilder werden nicht angezeigt

1. Überprüfen Sie die Pfade in der Konfiguration
2. Stellen Sie sicher, dass alle PNG-Dateien hochgeladen wurden
3. Prüfen Sie die Dateiberechtigungen auf dem Server

## Support

Bei Fragen oder Problemen öffnen Sie ein Issue im Repository oder kontaktieren Sie das Entwicklungsteam.

## Changelog

### Version 2.0 (2025-01-08)
- Saisonale Anpassung hinzugefügt
- 65+ Fakten (erweitert von 35+)
- Keine Wiederholungen bei Animationen
- Verbesserte Performance

### Version 1.0 (2025-01-08)
- Initiale Standalone-Version
- Grundlegende Animationen
- Sprechblasen-System
- Responsive Design
