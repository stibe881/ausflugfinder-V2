import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useI18n } from '@/contexts/i18nContext';

interface InstallPromptDialogProps {
  open: boolean;
  onInstall: () => void;
  onDismiss: () => void;
}

export function InstallPromptDialog({ open, onInstall, onDismiss }: InstallPromptDialogProps) {
  const { t } = useI18n();
  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) onDismiss();
    }}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{t("install.dialogTitle")}</DialogTitle>
            <button
              onClick={onDismiss}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
          <DialogDescription>
            {t("install.dialogDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            {t("install.benefitsTitle")}
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">✓</span>
              <span>{t("install.benefit1")}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">✓</span>
              <span>{t("install.benefit2")}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">✓</span>
              <span>{t("install.benefit3")}</span>
            </li>
          </ul>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            onClick={onInstall}
            className="flex-1 gap-2"
          >
            <Download className="h-4 w-4" />
            {t("install.button")}
          </Button>
          <Button
            variant="outline"
            onClick={onDismiss}
            className="flex-1"
          >
            {t("install.laterButton")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
