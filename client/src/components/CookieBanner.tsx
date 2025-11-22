
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Cookie } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

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
    <motion.div
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: "0%", opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="fixed bottom-0 left-0 right-0 z-50 p-4"
    >
      <Card className="mx-auto max-w-md bg-background/95 backdrop-blur-sm border-t border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cookie className="h-6 w-6 text-primary" /> Cookie-Einwilligung
          </CardTitle>
          <CardDescription>
            Wir verwenden Cookies, um Ihre Erfahrung zu verbessern und die Funktionalität unserer Website zu gewährleisten.
            Durch die weitere Nutzung der Website stimmen Sie der Verwendung von Cookies zu.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-end gap-2">
          <Button onClick={handleAccept} size="sm">
            Alle Cookies akzeptieren
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/privacy-policy">
              Mehr erfahren
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
