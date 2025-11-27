
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Cookie } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'cookie_consent';

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (consent !== 'true') {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/40 p-4 z-50">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Cookie className="h-5 w-5" />
            <span>
                Wir verwenden Cookies, um Ihre Erfahrung zu verbessern. Durch die weitere Nutzung der Website stimmen Sie der Verwendung von Cookies zu.
            </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button onClick={handleAccept} size="sm">
            Akzeptieren
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/privacy-policy">
              Mehr erfahren
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
