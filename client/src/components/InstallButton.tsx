import { Button } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react";
import React from "react";
import { useI18n } from "@/contexts/i18nContext";

interface InstallButtonProps {
  onInstall: () => void;
  disabled: boolean;
}

export function InstallButton({ onInstall, disabled }: InstallButtonProps) {
  const { t } = useI18n();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onInstall}
      disabled={disabled}
      className="relative text-lg p-3 h-auto"
      title={t("install.buttonTitle")}
    >
      <DownloadIcon className="w-5 h-5 mr-2" />
      {t("install.button")}
    </Button>
  );
}
