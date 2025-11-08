import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import MarmotMascot from '@/components/MarmotMascot';

export default function Home() {
  const [copied, setCopied] = useState(false);
  const [position, setPosition] = useState<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'>('bottom-right');
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('medium');

  const integrationCode = `<!-- Murmeltier-Maskottchen Integration -->
<!-- Schritt 1: Bilder in Ihr Projekt kopieren -->
<!-- Kopieren Sie alle marmot_family_*.png Dateien in Ihr public/images/ Verzeichnis -->

<!-- Schritt 2: Komponenten-Dateien hinzufügen -->
<!-- Kopieren Sie folgende Dateien in Ihr Projekt: -->
<!-- - components/MarmotMascot.tsx -->
<!-- - components/SpeechBubble.tsx -->
<!-- - lib/uselessFacts.ts -->

<!-- Schritt 3: Komponente in Ihre Seite einbinden -->
<script>
import MarmotMascot from './components/MarmotMascot';

// In Ihrer Hauptkomponente:
function App() {
  return (
    <div>
      {/* Ihr bestehender Inhalt */}
      
      {/* Murmeltier-Maskottchen */}
      <MarmotMascot 
        position="bottom-right"  // oder: bottom-left, top-right, top-left
        size="medium"            // oder: small, large
      />
    </div>
  );
}
</script>

<!-- Alternative: Standalone HTML/JS Integration -->
<!-- Für nicht-React Projekte: Kontaktieren Sie uns für eine Vanilla JS Version -->`;

  const handleCopy = () => {
    navigator.clipboard.writeText(integrationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-2xl">
                🦫
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Murmeltier-Maskottchen</h1>
                <p className="text-sm text-gray-600">Für ausflugfinder.ch</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Interaktives Murmeltier-Maskottchen
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            Klicken Sie auf die Murmeltier-Familie unten rechts, um Kunststücke zu sehen und unnützes Wissen über Natur, Ausflüge und die Schweiz zu erfahren! Die Murmeltiere passen sich automatisch der Jahreszeit an.
          </p>
          <div className="bg-orange-100 border-2 border-orange-300 rounded-lg p-6 inline-block">
            <p className="text-lg font-semibold text-orange-900">
              👉 Probieren Sie es aus! Klicken Sie auf die Murmeltiere! 👈
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Funktionen</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200">
              <div className="text-4xl mb-4">🎭</div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Kunststücke</h4>
              <p className="text-gray-700">
                Die Murmeltiere zeigen verschiedene Animationen: Winken, Springen, Tanzen und mehr!
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200">
              <div className="text-4xl mb-4">💬</div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Unnützes Wissen</h4>
              <p className="text-gray-700">
                Über 65 interessante Fakten über Natur, Ausflüge, Geschichte und die Schweiz!
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200">
              <div className="text-4xl mb-4">🌿</div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Saisonal</h4>
              <p className="text-gray-700">
                Die Murmeltiere passen sich automatisch der Jahreszeit an - Winter, Frühling, Sommer und Herbst!
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200">
              <div className="text-4xl mb-4">🔄</div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Keine Wiederholungen</h4>
              <p className="text-gray-700">
                Intelligente Animation - es wird nie zweimal hintereinander dasselbe Kunststück gezeigt!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customization Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Anpassung testen</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Position</label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={position === 'bottom-right' ? 'default' : 'outline'}
                  onClick={() => setPosition('bottom-right')}
                  className="w-full"
                >
                  Unten Rechts
                </Button>
                <Button
                  variant={position === 'bottom-left' ? 'default' : 'outline'}
                  onClick={() => setPosition('bottom-left')}
                  className="w-full"
                >
                  Unten Links
                </Button>
                <Button
                  variant={position === 'top-right' ? 'default' : 'outline'}
                  onClick={() => setPosition('top-right')}
                  className="w-full"
                >
                  Oben Rechts
                </Button>
                <Button
                  variant={position === 'top-left' ? 'default' : 'outline'}
                  onClick={() => setPosition('top-left')}
                  className="w-full"
                >
                  Oben Links
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Größe</label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant={size === 'small' ? 'default' : 'outline'}
                  onClick={() => setSize('small')}
                  className="w-full"
                >
                  Klein
                </Button>
                <Button
                  variant={size === 'medium' ? 'default' : 'outline'}
                  onClick={() => setSize('medium')}
                  className="w-full"
                >
                  Mittel
                </Button>
                <Button
                  variant={size === 'large' ? 'default' : 'outline'}
                  onClick={() => setSize('large')}
                  className="w-full"
                >
                  Groß
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Code Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-gray-900">Integrationscode</h3>
            <Button
              onClick={handleCopy}
              variant="outline"
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Kopiert!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Kopieren
                </>
              )}
            </Button>
          </div>
          <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto text-sm border border-gray-200">
            <code className="text-gray-800">{integrationCode}</code>
          </pre>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            Erstellt für <a href="https://dev.ausflugfinder.ch" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300">ausflugfinder.ch</a>
          </p>
        </div>
      </footer>

      {/* Murmeltier-Maskottchen */}
      <MarmotMascot position={position} size={size} />
    </div>
  );
}
