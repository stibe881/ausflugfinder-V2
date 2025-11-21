import { Cookie } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "./ui/card";
import { CookieSettings } from "./CookieSettings";
import {
    getAllAcceptedConsent,
    getConsent,
    getDefaultConsent,
    setConsent,
} from "@/lib/cookieConsent";

export function CookieBanner() {
    const [isMounted, setIsMounted] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        // Check if user has already made a choice (only run on client)
        const hasConsent = getConsent() !== null;
        setIsVisible(!hasConsent);
        setIsMounted(true);
    }, []);

    // Don't render until mounted (client-side only)
    if (!isMounted) {
        return null;
    }

    if (!isVisible) {
        return null;
    }

    const handleAcceptAll = () => {
        setConsent(getAllAcceptedConsent());
        setIsVisible(false);
    };

    const handleRejectAll = () => {
        setConsent(getDefaultConsent());
        setIsVisible(false);
    };

    const handleCustomize = () => {
        setShowSettings(true);
    };

    const handleSettingsSaved = () => {
        setShowSettings(false);
        setIsVisible(false);
    };

    return (
        <>
            <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:max-w-md">
                <Card className="shadow-lg border-2">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <Cookie className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">Cookie-Einstellungen</CardTitle>
                        </div>
                        <CardDescription className="text-sm">
                            Wir verwenden Cookies, um Ihre Erfahrung zu verbessern und unsere
                            Website zu analysieren. Sie können Ihre Einstellungen jederzeit
                            anpassen.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                        <p className="text-xs text-muted-foreground">
                            Durch Klicken auf "Alle akzeptieren" stimmen Sie der Verwendung
                            aller Cookies zu. Mit "Nur notwendige" werden nur essenzielle
                            Cookies verwendet. Weitere Informationen finden Sie in unserer{" "}
                            <a
                                href="/privacy"
                                className="underline hover:text-primary"
                                onClick={(e) => {
                                    e.preventDefault();
                                    window.location.href = "/privacy";
                                }}
                            >
                                Datenschutzerklärung
                            </a>{" "}
                            und{" "}
                            <a
                                href="/cookie-policy"
                                className="underline hover:text-primary"
                                onClick={(e) => {
                                    e.preventDefault();
                                    window.location.href = "/cookie-policy";
                                }}
                            >
                                Cookie-Richtlinie
                            </a>
                            .
                        </p>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2 sm:flex-row">
                        <Button
                            onClick={handleAcceptAll}
                            className="w-full sm:w-auto"
                            size="sm"
                        >
                            Alle akzeptieren
                        </Button>
                        <Button
                            onClick={handleRejectAll}
                            variant="outline"
                            className="w-full sm:w-auto"
                            size="sm"
                        >
                            Nur notwendige
                        </Button>
                        <Button
                            onClick={handleCustomize}
                            variant="ghost"
                            className="w-full sm:w-auto"
                            size="sm"
                        >
                            Einstellungen
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {showSettings && (
                <CookieSettings
                    isOpen={showSettings}
                    onClose={() => setShowSettings(false)}
                    onSave={handleSettingsSaved}
                />
            )}
        </>
    );
}
