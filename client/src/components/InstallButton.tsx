import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { Button } from "./ui/button";
import { Download } from "lucide-react";
import { useState } from "react";

export const InstallButton = () => {
  const { installPrompt, showInstallPrompt, isAppInstalled } = useInstallPrompt();
  const [showManualInstall, setShowManualInstall] = useState(false);

  // Wenn App bereits installiert ist, Button verstecken
  if (isAppInstalled) {
    return null;
  }

  // Wenn beforeinstallprompt Event augelöst wurde, den normalen Button zeigen
  if (installPrompt) {
    return (
      <Button
        onClick={showInstallPrompt}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        title="App auf diesem Gerät installieren"
      >
        <Download className="w-4 h-4" />
        Installieren
      </Button>
    );
  }

  // Fallback: Zeige einen Button mit Anleitung nach 5 Sekunden, falls beforeinstallprompt nicht augelöst wird
  // (z.B. auf localhost oder in Entwicklungsumgebung)
  return (
    <Button
      onClick={() => setShowManualInstall(!showManualInstall)}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
      title="Installationsanleitung"
    >
      <Download className="w-4 h-4" />
      Installieren
    </Button>
  );
};
