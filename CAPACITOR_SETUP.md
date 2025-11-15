# Capacitor Setup Guide: iOS & Android Native Apps

Dieser Guide erklärt, wie du die AusflugFinder App als native iOS und Android App buildest und deployest.

---

## **Quick Start Overview**

```
1. Web Build (auf Docker Server)
   ↓
2. iOS Setup (auf Mac mit Xcode)
   ↓
3. Android Setup (Windows/Linux/Mac mit Android Studio)
   ↓
4. Push Notifications konfigurieren
   ↓
5. In App Stores hochladen
```

---

## **Phase 1: Web Build (Docker Server)**

### Schritt 1: Code pullen
```bash
cd ~/ausflug-manager
git pull
pnpm install
```

### Schritt 2: Web Build
```bash
pnpm run build:web
```

**Output:** `dist/public/` ist jetzt fertig zum deployen!

Dieser Build wird auch für iOS und Android verwendet.

---

## **Phase 2: iOS Setup (Mac mit Xcode)**

### Voraussetzungen
- ✅ macOS 12+ (Monterey oder neuer)
- ✅ Xcode 14+ (kostenlos aus App Store)
- ✅ Apple Developer Account (optional, für App Store: $99/Jahr)

### Schritt 1: Repository auf Mac clonen
```bash
cd ~/projects  # oder wo du willst
git clone https://github.com/stibe881/ausflugfinder-V2.git
cd ausflugfinder-V2
```

### Schritt 2: Dependencies installieren
```bash
pnpm install
```

### Schritt 3: Web Build
```bash
pnpm run build:web
```

### Schritt 4: iOS Projekt öffnen
```bash
pnpm run cap:build:ios
```

**Was passiert:**
- Web wird gebaut
- Capacitor synchronisiert den Web Build zu iOS
- Xcode öffnet sich automatisch mit dem iOS Projekt

### Schritt 5: Im Xcode
1. Linke Seite: Wähle "App" unter "Targets"
2. Oben: Wähle dein iPhone aus (wenn verbunden)
3. Play Button drücken → App wird auf iPhone installiert!

### Alternativ: Ohne physisches iPhone
- Xcode öffnet auch Simulator
- Simulator im Play Button Dropdown wählen
- App läuft dann im Simulator

---

## **Phase 3: Android Setup**

### Voraussetzungen
- ✅ Android Studio (kostenlos von android.com)
- ✅ Java JDK 11+ (meist mit Android Studio installiert)
- ✅ Android SDK (wird mit Studio installiert)

### Schritt 1: Repository auf Entwicklungs-PC
```bash
cd ~/projects
git clone https://github.com/stibe881/ausflugfinder-V2.git
cd ausflugfinder-V2
```

### Schritt 2: Dependencies
```bash
npm install
# oder
pnpm install
```

### Schritt 3: Web Build
```bash
npm run build:web
# oder
pnpm run build:web
```

### Schritt 4: Android Projekt öffnen
```bash
npm run cap:build:android
# oder
pnpm run cap:build:android
```

**Was passiert:**
- Web wird gebaut
- Capacitor synced zu Android
- Android Studio öffnet sich

### Schritt 5: Im Android Studio
1. Rechts oben: "Device Manager" → Emulator starten (oder Handy verbinden)
2. Play Button drücken → App wird installiert!

---

## **Phase 4: Push Notifications Konfigurieren**

### iOS Push (APNs)

#### Was ist APNs?
Apple Push Notification Service - die offizielle iOS Push Methode

#### Schritt 1: Apple Developer Account
- Gehe zu developer.apple.com
- Login oder erstelle Account ($99/Jahr)
- Certificates, IDs & Profiles → Certificates → +

#### Schritt 2: Certificate erstellen
- Wähle "Apple Push Notification service SSL (Sandbox & Production)"
- Folge dem Wizard
- Download das `.cer` file

#### Schritt 3: Im Xcode
- Wähle "App" unter Targets
- Gehe zu "Signing & Capabilities"
- + Capability → "Push Notifications"

#### Schritt 4: APNs Setup im Backend
In `server/_core/pushNotifications.ts`:
```typescript
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY!;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;
// Diese bleiben gleich - funktionieren auch für Capacitor!
```

Für echte APNs braucht man noch:
```bash
export APPLE_PUSH_P8_KEY="<dein-apns-key>"
export APPLE_TEAM_ID="<dein-team-id>"
```

#### Alternativ: Web Push auch in nativer App nutzen
Die `capacitorPush.ts` funktioniert mit nativen APIs, aber du kannst auch Web Push im Hintergrund nutzen!

### Android Push (FCM)

#### Was ist FCM?
Firebase Cloud Messaging - Google's Push Service

#### Schritt 1: Firebase Projekt
- Gehe zu console.firebase.google.com
- Login mit Google Account
- + Neues Projekt erstellen
- Füge Android App hinzu

#### Schritt 2: Firebase Config
Firebase gibt dir `google-services.json` zum Download
- Speichern in `android/app/google-services.json`

#### Schritt 3: Server Setup
```bash
export FIREBASE_PROJECT_ID="<dein-project-id>"
export FIREBASE_PRIVATE_KEY="<dein-private-key>"
export FIREBASE_CLIENT_EMAIL="<dein-email>"
```

#### Schritt 4: Im Android Studio
- Folge dem Firebase Setup Wizard
- Google Services Plugin wird automatisch eingebunden

---

## **Phase 5: Testen auf Geräten**

### iOS Gerät
1. iPhone mit Mac verbinden
2. Xcode: Gerät auswählen
3. Play drücken
4. App öffnet sich
5. Klick "📬 Test Push"
6. **Benachrichtigung sollte sofort kommen!** 🎉

### Android Gerät
1. Handy mit USB verbinden
2. Android Studio: Gerät auswählen
3. Play drücken
4. App öffnet sich
5. Klick "📬 Test Push"
6. **Benachrichtigung sollte sofort kommen!** 🎉

---

## **Phase 6: In App Stores hochladen**

### iOS App Store

#### Voraussetzungen
- Apple Developer Account ($99/Jahr)
- Xcode Zertifikat (erstellt im Developer Portal)
- App ID und Bundle Identifier

#### Schritt 1: Build archivieren
- Xcode: Product → Archive
- Organizer öffnet sich
- Distribute App → App Store Connect

#### Schritt 2: App Store Connect
- Gehe zu appstoreconnect.apple.com
- My Apps → App erstellen
- Folge dem Wizard
- Build hochladen

#### Schritt 3: Einreichen
- Test Flight (optional für Betatests)
- Submission zur Apple Review

### Google Play Store

#### Voraussetzungen
- Google Play Developer Account ($25 einmalig)
- Signed APK

#### Schritt 1: APK signieren
```bash
# Im Android Studio
Build → Generate Signed APK
```

#### Schritt 2: Google Play Console
- Gehe zu play.google.com/console
- App erstellen
- APK hochladen
- Content Rating, Pricing, etc. ausfüllen

#### Schritt 3: Veröffentlichen
- Alpha/Beta Test (optional)
- Production Release

---

## **Häufige Fehler**

### iOS: "Bundle Identifier mismatch"
**Lösung:** In Xcode → General → Bundle Identifier muss `ch.ausflugfinder.app` sein

### Android: "google-services.json not found"
**Lösung:** Datei muss in `android/app/` sein (nicht in Root)

### Push funktioniert nicht
**Debug:**
1. Konsole in App prüfen (Xcode Debugger oder Android Logcat)
2. Backend Log prüfen: `npm run dev` und auf Fehler schauen
3. Test Push Button klicken und Fehler notieren

### App crasht nach Installation
**Lösung:**
1. Xcode/Android Studio öffnen
2. Build Logs prüfen
3. Fehler googeln oder fragen!

---

## **Nächste Schritte**

1. ✅ Web Build (jetzt!)
2. ✅ iOS auf Mac bauen
3. ✅ Android auf anderem PC bauen
4. ⏳ Push Notifications testen
5. ⏳ In App Stores hochladen (später)

---

## **Befehle Quick Reference**

```bash
# Web Build
pnpm run build:web

# iOS
pnpm run cap:build:ios      # Build + Xcode öffnen
pnpm run cap:open:ios       # Nur Xcode öffnen (ohne Build)
pnpm run cap:sync           # Web zu iOS synchen

# Android
pnpm run cap:build:android  # Build + Android Studio öffnen
pnpm run cap:open:android   # Nur Studio öffnen
pnpm run cap:sync           # Web zu Android synchen
```

---

**Viel Spaß beim Bauen! 🎉**

Falls du Fragen hast, schreib mir!
