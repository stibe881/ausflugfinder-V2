import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { CookieConsent, getConsent, setConsent, getDefaultConsent } from "@/lib/cookieConsent";

interface CookieSettingsProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

export function CookieSettings({ isOpen, onClose, onSave }: CookieSettingsProps) {
    const [consent, setConsentState] = useState<CookieConsent>(() => {
        return getConsent() || getDefaultConsent();
    });

    const handleSave = () => {
        setConsent(consent);
        onSave();
    };

    const handleToggle = (category: keyof CookieConsent) => {
        if (category === 'necessary') return; // Necessary cookies cannot be disabled

        setConsentState((prev) => ({
            ...prev,
            [category]: !prev[category],
        }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Cookie-Einstellungen</DialogTitle>
                    <DialogDescription>
                        Verwalten Sie Ihre Cookie-Präferenzen. Sie können Ihre Auswahl jederzeit ändern.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Necessary Cookies */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5 flex-1">
                                <Label className="text-base font-semibold">Notwendige Cookies</Label>
                                <p className="text-sm text-muted-foreground">
                                    Diese Cookies sind für die Grundfunktionen der Website erforderlich und können
                                    nicht deaktiviert werden.
                                </p>
                            </div>
                            <Switch
                                checked={consent.necessary}
                                disabled
                                aria-label="Notwendige Cookies (immer aktiviert)"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground pl-0">
                            Beispiele: Sitzungsverwaltung, Authentifizierung, Cookie-Einstellungen
                        </p>
                    </div>

                    <Separator />

                    {/* Analytics Cookies */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5 flex-1">
                                <Label className="text-base font-semibold">Analyse-Cookies</Label>
                                <p className="text-sm text-muted-foreground">
                                    Diese Cookies helfen uns zu verstehen, wie Besucher mit unserer Website
                                    interagieren, indem sie Informationen anonym sammeln und melden.
                                </p>
                            </div>
                            <Switch
                                checked={consent.analytics}
                                onCheckedChange={() => handleToggle('analytics')}
                                aria-label="Analyse-Cookies"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground pl-0">
                            Beispiele: Google Analytics, Umami Analytics, Besucherstatistiken
                        </p>
                    </div>

                    <Separator />

                    {/* Marketing Cookies */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5 flex-1">
                                <Label className="text-base font-semibold">Marketing-Cookies</Label>
                                <p className="text-sm text-muted-foreground">
                                    Diese Cookies werden verwendet, um Werbung anzuzeigen, die für Sie und Ihre
                                    Interessen relevant ist.
                                </p>
                            </div>
                            <Switch
                                checked={consent.marketing}
                                onCheckedChange={() => handleToggle('marketing')}
                                aria-label="Marketing-Cookies"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground pl-0">
                            Beispiele: Werbenetzwerke, Social Media-Integration, Remarketing
                        </p>
                    </div>
                </div>

                <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Abbrechen
                    </Button>
                    <Button onClick={handleSave}>
                        Einstellungen speichern
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
