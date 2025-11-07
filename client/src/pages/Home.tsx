import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Plane, MapPin, Users, Calendar, Compass, Mountain, Sun } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);
  const { data: stats } = trpc.trips.statistics.useQuery();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Simple play attempt
    const playVideo = () => {
      video.play().catch((err) => {
        console.log('Autoplay blocked:', err);
        // Try again on any user interaction
        const retry = () => {
          video.play().catch(e => console.log('Retry failed:', e));
          document.removeEventListener('click', retry);
          document.removeEventListener('touchstart', retry);
        };
        document.addEventListener('click', retry, { once: true });
        document.addEventListener('touchstart', retry, { once: true });
      });
    };

    // Play when ready
    if (video.readyState >= 3) {
      playVideo();
    } else {
      video.addEventListener('canplay', playVideo, { once: true });
    }

    // Handle errors
    const handleError = () => {
      console.error('Video failed to load');
      setVideoError(true);
    };
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Hero Section with Video Background */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          {!videoError ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="w-full h-full object-cover opacity-60"
              >
                <source src="/hero-video.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0" style={{ pointerEvents: 'auto' }} />
            </>
          ) : (
            <div 
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: 'url(/hero-bg.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background"></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-40 right-20 w-40 h-40 bg-secondary/10 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute bottom-20 left-1/4 w-48 h-48 bg-accent/10 rounded-full blur-3xl animate-float-slow"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container text-center space-y-8 px-4">
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Mountain className="w-12 h-12 text-primary animate-pulse" />
              <Sun className="w-10 h-10 text-secondary animate-pulse" style={{ animationDelay: '0.5s' }} />
              <Compass className="w-12 h-12 text-accent animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent drop-shadow-lg">
              Ausflug Manager
            </h1>
            <p className="text-xl md:text-2xl text-foreground/80 max-w-2xl mx-auto font-medium">
              Entdecke, plane und verwalte unvergessliche Familienausflüge und Abenteuer
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-delayed">
            {loading ? (
              <Button size="lg" disabled className="text-lg px-8 py-6 shadow-lg">
                Laden...
              </Button>
            ) : isAuthenticated ? (
              <Link href="/trips">
                <Button size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  Meine Ausflüge
                </Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  Jetzt starten
                </Button>
              </a>
            )}
            {isAuthenticated && (
              <Link href="/profile">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 border-secondary/50 hover:border-secondary hover:bg-secondary/10 transition-all duration-300 hover:scale-105">
                  Mein Profil
                </Button>
              </Link>
            )}
            <Link href="/explore">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 border-primary/50 hover:border-primary hover:bg-primary/10 transition-all duration-300 hover:scale-105">
                Ausflüge entdecken
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-primary rounded-full animate-scroll"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative bg-gradient-to-b from-background to-muted/30">
        <div className="container">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Alles für deine Ausflüge
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Plane deine nächsten Abenteuer mit allen wichtigen Funktionen an einem Ort
          </p>
          
          {/* Statistics */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-16">
              <div className="bg-primary/10 rounded-2xl p-6 text-center border-2 border-primary/20 hover:border-primary/40 transition-all">
                <div className="text-4xl font-bold text-primary mb-2">{stats.totalActivities}</div>
                <div className="text-sm text-muted-foreground">Aktivitäten</div>
              </div>
              <div className="bg-secondary/10 rounded-2xl p-6 text-center border-2 border-secondary/20 hover:border-secondary/40 transition-all">
                <div className="text-4xl font-bold text-secondary mb-2">{stats.freeActivities}</div>
                <div className="text-sm text-muted-foreground">Kostenlos</div>
              </div>
              <div className="bg-accent/10 rounded-2xl p-6 text-center border-2 border-accent/20 hover:border-accent/40 transition-all">
                <div className="text-4xl font-bold text-accent mb-2">{stats.totalCategories}</div>
                <div className="text-sm text-muted-foreground">Kategorien</div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Plane,
                title: "Ausflüge planen",
                description: "Erstelle und organisiere deine Reisen mit allen wichtigen Details",
                color: "text-primary",
                bgColor: "bg-primary/10",
                link: "/trips"
              },
              {
                icon: MapPin,
                title: "Destinationen",
                description: "Entdecke spannende Orte und speichere deine Lieblingsziele",
                color: "text-accent",
                bgColor: "bg-accent/10",
                link: "/destinations"
              },
              {
                icon: Users,
                title: "Teilnehmer",
                description: "Verwalte Gruppengröße und halte alle auf dem Laufenden",
                color: "text-secondary",
                bgColor: "bg-secondary/10",
                link: "/trips"
              },
              {
                icon: Calendar,
                title: "Zeitplanung",
                description: "Behalte den Überblick über alle wichtigen Termine",
                color: "text-chart-2",
                bgColor: "bg-blue-500/10",
                link: "/trips"
              }
            ].map((feature, index) => (
              <Link key={index} href={feature.link}>
                <div
                  className="group relative bg-card border-2 border-border rounded-2xl p-8 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
                  style={{
                    animation: `fade-in-up 0.6s ease-out ${index * 0.1}s both`
                  }}
                >
                  <div className={`absolute inset-0 ${feature.bgColor} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  <div className="relative z-10">
                    <div className={`w-16 h-16 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className={`w-8 h-8 ${feature.color}`} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-card-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(34,197,94,0.1),transparent_50%),radial-gradient(circle_at_70%_50%,rgba(249,115,22,0.1),transparent_50%)]"></div>
        
        <div className="container relative z-10 text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Bereit für dein nächstes Abenteuer?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Starte jetzt und plane unvergessliche Ausflüge mit Familie und Freunden
          </p>
          {!isAuthenticated && !loading && (
            <a href={getLoginUrl()}>
              <Button size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                Kostenlos registrieren
              </Button>
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
