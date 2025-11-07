import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Calendar, MapPin, Heart, CheckCircle2, Plane, LogOut, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { APP_TITLE, getLoginUrl } from "@/const";
import { toast } from "sonner";

export default function Profile() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const { data: trips } = trpc.trips.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: dayPlans } = trpc.dayPlans.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: destinations } = trpc.destinations.list.useQuery(undefined, { enabled: isAuthenticated });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-orange-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Anmeldung erforderlich</CardTitle>
            <CardDescription>Bitte melden Sie sich an, um Ihr Profil zu sehen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>Jetzt anmelden</a>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zurück zur Startseite
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const favoriteTrips = trips?.filter(t => t.isFavorite === 1) || [];
  const completedTrips = trips?.filter(t => t.isDone === 1) || [];
  const initials = user.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U";

  const handleLogout = () => {
    logout();
    toast.success("Erfolgreich abgemeldet");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zurück
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-800">{APP_TITLE}</h1>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Abmelden
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="w-24 h-24">
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-green-500 to-orange-500 text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-2xl">{user.name || "Benutzer"}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
                <Badge variant="secondary" className="mt-2">
                  {user.role === "admin" ? "Administrator" : "Benutzer"}
                </Badge>
                {user.role === "admin" && (
                  <Link href="/admin">
                    <Button variant="default" size="sm" className="mt-4">
                      Admin Portal
                    </Button>
                  </Link>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{user.email || "Keine E-Mail"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Mitglied seit {new Date(user.createdAt).toLocaleDateString("de-DE")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>Login: {user.loginMethod || "Standard"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistics */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Meine Statistiken</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Ausflüge</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Plane className="w-8 h-8 text-blue-500" />
                      <span className="text-3xl font-bold">{trips?.length || 0}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Favoriten</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Heart className="w-8 h-8 text-red-500" />
                      <span className="text-3xl font-bold">{favoriteTrips.length}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Erledigt</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                      <span className="text-3xl font-bold">{completedTrips.length}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Destinationen</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-8 h-8 text-orange-500" />
                      <span className="text-3xl font-bold">{destinations?.length || 0}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Letzte Aktivitäten</CardTitle>
                <CardDescription>Ihre neuesten Ausflüge und Pläne</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trips && trips.length > 0 ? (
                    trips.slice(0, 5).map((trip) => (
                      <Link key={trip.id} href={`/trips/${trip.id}`}>
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                          <div className="flex-1">
                            <h4 className="font-medium">{trip.title}</h4>
                            <p className="text-sm text-muted-foreground">{trip.destination}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {trip.isFavorite === 1 && <Heart className="w-4 h-4 fill-red-500 text-red-500" />}
                            {trip.isDone === 1 && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                            <Badge variant="outline">{trip.status}</Badge>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Noch keine Ausflüge vorhanden. Erstellen Sie Ihren ersten Ausflug!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Day Plans */}
            {dayPlans && dayPlans.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Meine Tagespläne</CardTitle>
                  <CardDescription>{dayPlans.length} Plan{dayPlans.length !== 1 ? "e" : ""}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {dayPlans.slice(0, 5).map((plan) => (
                      <div key={plan.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div>
                          <h4 className="font-medium">{plan.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(plan.startDate).toLocaleDateString("de-DE")} - {new Date(plan.endDate).toLocaleDateString("de-DE")}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/planner">Ansehen</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
