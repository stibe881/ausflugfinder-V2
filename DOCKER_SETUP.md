# Docker Setup für AusflugFinder

## Voraussetzungen
- Docker & Docker Compose installiert
- Portainer (optional, zur Verwaltung)
- MySQL Datenbank beim Hoster vorhanden
- Subdomain konfiguriert (DNS eingestellt)

## Schritt 1: Dateistruktur vorbereiten

```bash
# Navigiere zum Projektverzeichnis
cd /path/to/ausflug-manager

# Erstelle das Zertifikats-Verzeichnis
mkdir -p certs
```

## Schritt 2: Umgebungsvariablen konfigurieren

Öffne `.env.docker` und ersetze die Platzhalter:

```env
DATABASE_URL=mysql://dein_username:dein_password@dein_host:3306/dein_database
JWT_SECRET=ein-sehr-langes-zufaelliges-geheimnis-hier
```

Dann kopiere die Datei:
```bash
cp .env.docker .env
```

## Schritt 3: SSL-Zertifikate einrichten

### Option A: Let's Encrypt mit Certbot (empfohlen)

```bash
# Zertifikat generieren
docker run -it --rm -v "$(pwd)/certs:/etc/letsencrypt" \
  certbot/certbot certonly --standalone \
  -d deine.subdomain.com
```

Dann kopiere die Zertifikate:
```bash
# Linux/Mac
sudo cp /etc/letsencrypt/live/deine.subdomain.com/fullchain.pem certs/cert.pem
sudo cp /etc/letsencrypt/live/deine.subdomain.com/privkey.pem certs/key.pem
sudo chmod 644 certs/*
```

### Option B: Self-Signed Zertifikat (für Testing)

```bash
openssl req -x509 -newkey rsa:4096 -keyout certs/key.pem \
  -out certs/cert.pem -days 365 -nodes
```

## Schritt 4: Docker Compose starten

```bash
# Starte die Container
docker-compose up -d

# Oder mit Portainer:
# 1. Öffne Portainer Web-Interface
# 2. Gehe zu "Stacks"
# 3. Erstelle neuen Stack
# 4. Kopiere den Inhalt von docker-compose.yml
# 5. Klicke "Deploy"
```

## Schritt 5: Verifikation

```bash
# Zeige die Logs
docker-compose logs -f app

# Prüfe ob der Container läuft
docker ps

# Teste die App
curl https://deine.subdomain.com
```

## Portainer Verwaltung

Im Portainer Dashboard kannst du:
- Container starten/stoppen
- Logs anschauen
- Ressourcennutzung monitoren
- Environment Variablen bearbeiten

## DNS-Einstellungen

Stelle sicher, dass deine Subdomain auf die IP deines Docker-Servers zeigt:

```
A Record:
Name: ausflugfinder (oder dein Subdomain-Name)
Value: deine.ip.adresse
TTL: 3600
```

## Troubleshooting

### Container starten nicht
```bash
docker-compose logs
```

### Datenbank-Verbindung fehlgeschlagen
- Prüfe DATABASE_URL in .env
- Verifiziere MySQL-Credentials
- Prüfe Firewall-Regeln

### SSL-Fehler
- Zertifikate im `certs/` Verzeichnis prüfen
- Zertifikat erneuern mit Certbot

### Port 80/443 schon belegt
Ändere in docker-compose.yml:
```yaml
ports:
  - "8080:80"      # Ändere 80 auf 8080
  - "8443:443"     # Ändere 443 auf 8443
```

Dann Nginx konfigurieren:
```bash
# Nicht vergessen: Portweiterleitung im Router!
```

## Update durchführen

```bash
# Pull latest from GitHub
git pull origin main

# Rebuild und restart
docker-compose up -d --build

# Prüfe Logs
docker-compose logs -f app
```

## Sicherheit

- Ändere JWT_SECRET zu einem zufälligen String
- Verwende Let's Encrypt Zertifikate
- Setze regelmäßige Backups auf
- Monitore die Logs regelmäßig

## Weitere Informationen

- Docker Docs: https://docs.docker.com/
- Nginx Docs: https://nginx.org/
- Let's Encrypt: https://letsencrypt.org/
