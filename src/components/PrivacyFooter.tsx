import { Cookie, FileText, Info } from "lucide-react";
import { useState } from "react";
import { CookieSettings } from "./CookieSettings";

export function PrivacyFooter() {
    const [showSettings, setShowSettings] = useState(false);

    return (
        <>
            <footer className="mt-auto border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                        {/* Legal Links */}
                        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground md:justify-start">
                            <a
                                href="/privacy"
                                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                            >
                                <FileText className="h-4 w-4" />
                                <span>Datenschutz</span>
                            </a>
                            <span className="text-muted-foreground/50">•</span>
                            <a
                                href="/cookie-policy"
                                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                            >
                                <Cookie className="h-4 w-4" />
                                <span>Cookie-Richtlinie</span>
                            </a>
                            <span className="text-muted-foreground/50">•</span>
                            <a
                                href="/imprint"
                                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                            >
                                <Info className="h-4 w-4" />
                                <span>Impressum</span>
                            </a>
                        </div>

                        {/* Cookie Settings Button */}
                        <button
                            onClick={() => setShowSettings(true)}
                            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Cookie className="h-4 w-4" />
                            <span>Cookie-Einstellungen</span>
                        </button>
                    </div>

                    {/* Copyright */}
                    <div className="mt-4 text-center text-xs text-muted-foreground">
                        © {new Date().getFullYear()} Ausflug Manager. Alle Rechte vorbehalten.
                    </div>
                </div>
            </footer>

            {showSettings && (
                <CookieSettings
                    isOpen={showSettings}
                    onClose={() => setShowSettings(false)}
                    onSave={() => setShowSettings(false)}
                />
            )}
        </>
    );
}
