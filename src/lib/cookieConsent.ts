/**
 * Cookie Consent Management
 * Handles user consent for different types of cookies (GDPR/revDSG compliant)
 */

export interface CookieConsent {
    necessary: boolean; // Always true, required for basic functionality
    analytics: boolean;
    marketing: boolean;
    timestamp: number;
}

const CONSENT_KEY = 'cookieConsent';
const CONSENT_VERSION = '1.0'; // Increment when privacy policy changes significantly

export interface StoredConsent extends CookieConsent {
    version: string;
}

/**
 * Get the current cookie consent from localStorage
 */
export function getConsent(): CookieConsent | null {
    try {
        const stored = localStorage.getItem(CONSENT_KEY);
        if (!stored) return null;

        const consent: StoredConsent = JSON.parse(stored);

        // Check if consent is from current version
        if (consent.version !== CONSENT_VERSION) {
            // Version mismatch, require new consent
            return null;
        }

        return {
            necessary: consent.necessary,
            analytics: consent.analytics,
            marketing: consent.marketing,
            timestamp: consent.timestamp,
        };
    } catch (error) {
        console.error('Error reading cookie consent:', error);
        return null;
    }
}

/**
 * Save cookie consent to localStorage
 */
export function setConsent(consent: CookieConsent): void {
    try {
        const stored: StoredConsent = {
            ...consent,
            version: CONSENT_VERSION,
            timestamp: Date.now(),
        };
        localStorage.setItem(CONSENT_KEY, JSON.stringify(stored));

        // Trigger custom event for other parts of the app
        window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: consent }));
    } catch (error) {
        console.error('Error saving cookie consent:', error);
    }
}

/**
 * Check if user has given consent for a specific category
 */
export function hasConsent(category: keyof CookieConsent): boolean {
    const consent = getConsent();
    if (!consent) return false;
    return consent[category] === true;
}

/**
 * Remove consent (useful for testing or reset)
 */
export function clearConsent(): void {
    try {
        localStorage.removeItem(CONSENT_KEY);
        window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: null }));
    } catch (error) {
        console.error('Error clearing cookie consent:', error);
    }
}

/**
 * Get default consent (only necessary cookies)
 */
export function getDefaultConsent(): CookieConsent {
    return {
        necessary: true,
        analytics: false,
        marketing: false,
        timestamp: Date.now(),
    };
}

/**
 * Get all-accepted consent
 */
export function getAllAcceptedConsent(): CookieConsent {
    return {
        necessary: true,
        analytics: true,
        marketing: true,
        timestamp: Date.now(),
    };
}
