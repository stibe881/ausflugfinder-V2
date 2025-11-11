import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Plane, MapPin, Users, Compass, Mountain, Sun, Moon, Globe } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useTheme } from "@/contexts/ThemeContext";
import { useI18n, type Language } from "@/contexts/i18nContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);
  const { data: stats } = trpc.trips.statistics.useQuery();

  const languages: { code: Language; name: string }[] = [
    { code: "de", name: "Deutsch" },
    { code: "en", name: "English" },
    { code: "fr", name: "Français" },
    { code: "it", name: "Italiano" },
  ];

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

  // Load Mascot Widget on Home page
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const loadMascotWidget = () => {
        try {
          // Check if mascot div exists
          const mascotDiv = document.getElementById('ausflugfinder-mascot');
          if (!mascotDiv) {
            console.warn('✗ Mascot container div not found');
            return;
          }

          // Load CSS to document head (check if not already loaded)
          const existingCss = document.querySelector('link[href="/assets/mascot/mascot-widget.css"]');
          if (!existingCss) {
            const cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = '/assets/mascot/mascot-widget.css';
            cssLink.onload = () => {
              console.log('✓ Mascot CSS loaded');
            };
            cssLink.onerror = () => {
              console.error('✗ Failed to load mascot CSS');
            };
            document.head.appendChild(cssLink);
          } else {
            console.log('✓ Mascot CSS already loaded');
          }

          // Load mascot-widget.js script
          const existingScript = document.querySelector('script[src="/assets/mascot/mascot-widget.js"]');
          if (!existingScript) {
            const widgetScript = document.createElement('script');
            widgetScript.src = '/assets/mascot/mascot-widget.js';
            widgetScript.async = false; // Load synchronously
            widgetScript.onload = () => {
              console.log('✓ Mascot widget script loaded');
              // Manually initialize since DOMContentLoaded already fired
              if ((window as any).AusflugFinderMascot) {
                try {
                  const mascot = new (window as any).AusflugFinderMascot('ausflugfinder-mascot', {
                    basePath: '/assets/mascot/'
                  });
                  console.log('✓ Mascot widget initialized');
                } catch (initError) {
                  console.error('✗ Error initializing mascot:', initError);
                }
              } else {
                console.error('✗ AusflugFinderMascot class not found');
              }
            };
            widgetScript.onerror = () => {
              console.error('✗ Failed to load mascot widget script');
            };
            document.body.appendChild(widgetScript);
            console.log('→ Loading mascot widget script...');
          } else {
            console.log('✓ Mascot script already loaded');
            // If script was already loaded, try to initialize if not already done
            if ((window as any).AusflugFinderMascot && mascotDiv.innerHTML.trim() === '') {
              try {
                new (window as any).AusflugFinderMascot('ausflugfinder-mascot', {
                  basePath: '/assets/mascot/'
                });
                console.log('✓ Mascot widget initialized (already loaded script)');
              } catch (initError) {
                console.error('✗ Error initializing mascot:', initError);
              }
            }
          }
        } catch (error) {
          console.error('✗ Error loading mascot widget:', error);
        }
      };

      loadMascotWidget();
    }, 100); // 100ms delay to ensure DOM is fully ready

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Header with Theme and Language Toggle */}
      <header className="fixed top-0 right-0 z-40 p-4 flex gap-2">
        {/* Theme Toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="rounded-lg"
          title={theme === "light" ? "Dark Mode" : "Light Mode"}
        >
          {theme === "light" ? (
            <Moon className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <Sun className="h-[1.2rem] w-[1.2rem]" />
          )}
        </Button>

        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-lg" title="Select Language">
              <Globe className="h-[1.2rem] w-[1.2rem]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Sprache / Language</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={language === lang.code ? "bg-accent" : ""}
              >
                {lang.name}
                {language === lang.code && (
                  <span className="ml-2 text-primary font-bold">✓</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

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
              AusflugFinder
            </h1>
            <p className="text-xl md:text-2xl text-foreground/80 max-w-2xl mx-auto font-medium">
              {t("app.tagline")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-delayed">
            {loading ? (
              <Button size="lg" disabled className="text-lg px-8 py-6 shadow-lg">
                Loading...
              </Button>
            ) : isAuthenticated ? (
              <>
                <Link href="/explore">
                  <Button size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    {t("nav.explore")}
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 border-secondary/50 hover:border-secondary hover:bg-secondary/10 transition-all duration-300 hover:scale-105">
                    {t("nav.profile")}
                  </Button>
                </Link>
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  {t("nav.signIn")}
                </Button>
              </a>
            )}
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
            {t("home.featuresTitle")}
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            {t("home.featuresSubtitle")}
          </p>
          
          {/* Statistics */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-16">
              <Link href="/explore">
                <div className="bg-primary/10 rounded-2xl p-6 text-center border-2 border-primary/20 hover:border-primary/40 transition-all cursor-pointer hover:scale-105">
                  <div className="text-4xl font-bold text-primary mb-2">{stats.totalActivities}</div>
                  <div className="text-sm text-muted-foreground">{t("home.activities")}</div>
                </div>
              </Link>
              <Link href="/explore?cost=free">
                <div className="bg-secondary/10 rounded-2xl p-6 text-center border-2 border-secondary/20 hover:border-secondary/40 transition-all cursor-pointer hover:scale-105">
                  <div className="text-4xl font-bold text-secondary mb-2">{stats.freeActivities}</div>
                  <div className="text-sm text-muted-foreground">{t("home.freeActivities")}</div>
                </div>
              </Link>
              <Link href="/explore?cost=free">
                <div className="bg-accent/10 rounded-2xl p-6 text-center border-2 border-accent/20 hover:border-accent/40 transition-all cursor-pointer hover:scale-105">
                  <div className="text-4xl font-bold text-accent mb-2">{stats.totalCategories}</div>
                  <div className="text-sm text-muted-foreground">{t("home.categories")}</div>
                </div>
              </Link>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: MapPin,
                titleKey: "home.destinations",
                descKey: "home.destinationsDesc",
                color: "text-accent",
                bgColor: "bg-accent/10",
                link: "/explore"
              },
              {
                icon: Plane,
                titleKey: "home.planTrips",
                descKey: "home.planTripsDesc",
                color: "text-primary",
                bgColor: "bg-primary/10",
                link: "/planner"
              },
              {
                icon: Users,
                titleKey: "home.friends",
                descKey: "home.friendsDesc",
                color: "text-secondary",
                bgColor: "bg-secondary/10",
                link: "/friends"
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
                    <h3 className="text-xl font-semibold mb-2 text-card-foreground">{t(feature.titleKey)}</h3>
                    <p className="text-muted-foreground">{t(feature.descKey)}</p>
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
            {t("home.ctaTitle")}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("home.ctaSubtitle")}
          </p>
          {!isAuthenticated && !loading && (
            <a href={getLoginUrl()}>
              <Button size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                {t("home.registerBtn")}
              </Button>
            </a>
          )}
        </div>
      </section>

      {/* Mascot Widget Container */}
      <div id="ausflugfinder-mascot"></div>
    </div>
  );
}
