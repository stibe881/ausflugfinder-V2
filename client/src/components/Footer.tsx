
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-background/95 backdrop-blur-sm border-t border-border/40 py-4 mt-8">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Ausflug Manager. All rights reserved.</p>
        <nav className="flex gap-4 mt-2 sm:mt-0">
          <Link href="/legal-notice" className="hover:text-foreground transition-colors">
            Impressum
          </Link>
          <Link href="/privacy-policy" className="hover:text-foreground transition-colors">
            Datenschutz
          </Link>
        </nav>
      </div>
    </footer>
  );
}
