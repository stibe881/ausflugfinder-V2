import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { Button } from "./ui/button";
import { Download } from "lucide-react";

export const InstallButton = () => {
  const { installPrompt, showInstallPrompt } = useInstallPrompt();

  if (!installPrompt) {
    return null;
  }

  return (
    <Button
      onClick={showInstallPrompt}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <Download className="w-4 h-4" />
      Installieren
    </Button>
  );
};
