import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { Button } from "./ui/button";
import { Download } from "lucide-react";

export const InstallButton = () => {
  const { isAppInstalled, showInstallPrompt } = useInstallPrompt();

  // Wenn App bereits installiert ist, Button verstecken
  if (isAppInstalled) {
    return null;
  }

  // Button wird immer angezeigt (mit oder ohne beforeinstallprompt Event)
  // Die showInstallPrompt Funktion kümmert sich selbst darum
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
};
