import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Users, Activity, MapPin, BarChart3, Trash2, Edit, Lock, Unlock } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      setLocation('/');
    }
  }, [authLoading, user, setLocation]);

  const { data: stats } = trpc.trips.statistics.useQuery();
  const { data: allTrips } = trpc.trips.publicTrips.useQuery();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Lock className="w-6 h-6" />
              Zugriff verweigert
            </CardTitle>
            <CardDescription>Sie haben keine Admin-Berechtigung</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zurück zur Startseite
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Zurück
              </Button>
            </Link>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Admin Portal
            </h1>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-red-500">Admin</Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="py-12">
        <div className="container">
          {/* Dashboard Stats */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Activity className="w-4 h-4 text-primary" />
                      Gesamt Ausflüge
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">{stats.totalActivities}</div>
                    <p className="text-xs text-muted-foreground mt-1">Alle registrierten Ausflüge</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-secondary" />
                      Kategorien
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-secondary">{stats.totalCategories}</div>
                    <p className="text-xs text-muted-foreground mt-1">Verfügbare Kategorien</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-accent" />
                      Kostenlos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-accent">{stats.freeActivities}</div>
                    <p className="text-xs text-muted-foreground mt-1">Kostenlose Aktivitäten</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-500" />
                      Benutzerkonto
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-500">{user.username}</div>
                    <p className="text-xs text-muted-foreground mt-1">Admin-Benutzer</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Trips Management */}
          <div>
            <h2 className="text-3xl font-bold mb-6">Ausflug-Verwaltung</h2>
            {allTrips && allTrips.length > 0 ? (
              <div className="space-y-4">
                {allTrips.map((trip) => (
                  <Card key={trip.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl flex items-center gap-2">
                            {trip.title}
                            {trip.isFavorite === 1 && (
                              <Badge variant="secondary" className="bg-red-500/20 text-red-600">Favorit</Badge>
                            )}
                            {trip.isPublic === 1 && (
                              <Badge variant="secondary" className="bg-blue-500/20 text-blue-600">Öffentlich</Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="mt-1">{trip.description}</CardDescription>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Link href={`/trips/${trip.id}`}>
                            <Button variant="outline" size="sm" className="gap-2">
                              <Edit className="w-4 h-4" />
                              Ansehen
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Zielort:</span>
                          <p className="font-medium">{trip.destination}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Kategorie:</span>
                          <p className="font-medium">{trip.category || "—"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Region:</span>
                          <p className="font-medium">{trip.region || "—"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Kosten:</span>
                          <p className="font-medium">
                            {trip.cost === 'free' ? 'Kostenlos' :
                             trip.cost === 'low' ? '€' :
                             trip.cost === 'medium' ? '€€' :
                             trip.cost === 'high' ? '€€€' : '€€€€'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Keine Ausflüge gefunden</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
