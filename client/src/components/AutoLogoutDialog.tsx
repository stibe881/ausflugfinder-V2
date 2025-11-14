import { AlertCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

interface AutoLogoutDialogProps {
  open: boolean;
  onLogout: () => void;
  onStayLoggedIn: () => void;
  isAppInstalled: boolean;
  onDisableAutoLogout?: (disable: boolean) => void;
}

export function AutoLogoutDialog({
  open,
  onLogout,
  onStayLoggedIn,
  isAppInstalled,
  onDisableAutoLogout,
}: AutoLogoutDialogProps) {
  const handleStayLoggedIn = (disableAutoLogout: boolean) => {
    if (disableAutoLogout && onDisableAutoLogout) {
      onDisableAutoLogout(true);
    }
    onStayLoggedIn();
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) handleStayLoggedIn(false);
    }}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <DialogTitle>Inaktivität erkannt</DialogTitle>
          </div>
          <DialogDescription>
            Du warst 15 Minuten lang inaktiv. Deine Sitzung wird in Kürze beendet.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Zum Schutz deiner Daten werden inaktive Sitzungen automatisch beendet.
          </p>

          {isAppInstalled && (
            <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <Checkbox
                id="disable-logout"
                onCheckedChange={(checked) => {
                  handleStayLoggedIn(!!checked);
                }}
              />
              <label
                htmlFor="disable-logout"
                className="text-sm cursor-pointer flex-1 pt-0.5"
              >
                <span className="font-medium">Nie abmelden (diese App)</span>
                <p className="text-xs text-muted-foreground mt-1">
                  Du wirst nicht automatisch abgemeldet, wenn diese App installiert ist
                </p>
              </label>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            onClick={onLogout}
            variant="destructive"
            className="flex-1 gap-2"
          >
            <LogOut className="h-4 w-4" />
            Abmelden
          </Button>
          <Button
            onClick={() => handleStayLoggedIn(false)}
            className="flex-1"
          >
            Angemeldet bleiben
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
