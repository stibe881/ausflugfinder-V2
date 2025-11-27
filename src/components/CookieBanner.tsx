import { useEffect, useState } from "react";
import { getConsent, setConsent, getAllAcceptedConsent, getDefaultConsent } from "@/lib/cookieConsent";

export function CookieBanner() {
    const [show, setShow] = useState(true);

    // useEffect(() => {
    //     // Check localStorage for consent
    //     const hasConsent = getConsent() !== null;
    //     setShow(!hasConsent);
    // }, []);

    if (!show) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm">
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                <h3 className="text-lg font-bold mb-2">🍪 Cookie-Einstellungen</h3>
                <p className="text-sm text-gray-700 mb-4">
                    Wir verwenden Cookies, um Ihre Erfahrung zu verbessern.
                    Lesen Sie unsere{" "}
                    <a href="/privacy" className="underline text-blue-600 hover:text-blue-800">
                        Datenschutzerklärung
                    </a>{" "}
                    und{" "}
                    <a href="/cookie-policy" className="underline text-blue-600 hover:text-blue-800">
                        Cookie-Richtlinie
                    </a>.
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setConsent(getAllAcceptedConsent());
                            setShow(false);
                        }}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Alle akzeptieren
                    </button>
                    <button
                        onClick={() => {
                            setConsent(getDefaultConsent());
                            setShow(false);
                        }}
                        className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                    >
                        Nur notwendige
                    </button>
                </div>
            </div>
        </div>
    );
}
