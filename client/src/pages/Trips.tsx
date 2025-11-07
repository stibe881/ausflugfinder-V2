import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { MapPin, Calendar, Users, Plus, Trash2, ArrowLeft, Loader2, Mountain } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function Trips() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: trips, isLoading, refetch } = trpc.trips.myTrips.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  const createMutation = trpc.trips.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsCreateOpen(false);
      toast.success("Ausflug erfolgreich erstellt! 🎉");
    },
    onError: (error) => {
      toast.error("Fehler beim Erstellen: " + error.message);
    },
  });

  const deleteMutation = trpc.trips.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Ausflug gelöscht!");
    },
    onError: (error) => {
      toast.error("Fehler beim Löschen: " + error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      destination: formData.get("destination") as string,
      startDate: new Date(formData.get("startDate") as string),
      endDate: new Date(formData.get("endDate") as string),
      participants: parseInt(formData.get("participants") as string),
      status: formData.get("status") as "planned" | "ongoing" | "completed" | "cancelled",
    };

    try {
      await createMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planned":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "ongoing":
        return "bg-green-100 text-green-700 border-green-300";
      case "completed":
        return "bg-purple-100 text-purple-700 border-purple-300";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "planned":
        return "Geplant";
      case "ongoing":
        return "Laufend";
      case "completed":
        return "Abgeschlossen";
      case "cancelled":
        return "Abgesagt";
      default:
        return status;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 border-2">
          <CardHeader>
            <CardTitle>Anmeldung erforderlich</CardTitle>
            <CardDescription>
              Du musst angemeldet sein, um deine Ausflüge zu verwalten.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex gap-2">
            <Link href="/">
              <Button variant="outline">Zurück</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border backdrop-blur-lg bg-card/80 sticky top-0 z-50 shadow-sm">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/10">
                  <ArrowLeft className="w-4 h-4" />
                  Zurück
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Mountain className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Meine Ausflüge
                </h1>
              </div>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-md">
                  <Plus className="w-4 h-4" />
                  Neue Planung
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-2 border-border max-w-2xl">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle className="text-card-foreground text-2xl">Neuen Ausflug erstellen</DialogTitle>
                    <DialogDescription>
                      Fülle die Details für deinen neuen Ausflug aus
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Titel *</Label>
                      <Input
                        id="title"
                        name="title"
                        placeholder="z.B. Wanderung in den Alpen"
                        required
                        className="bg-background border-input"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="destination">Ziel *</Label>
                      <Input
                        id="destination"
                        name="destination"
                        placeholder="z.B. Garmisch-Partenkirchen"
                        required
                        className="bg-background border-input"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Beschreibung</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Beschreibe deinen Ausflug..."
                        rows={3}
                        className="bg-background border-input"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="startDate">Startdatum *</Label>
                        <Input
                          id="startDate"
                          name="startDate"
                          type="date"
                          required
                          className="bg-background border-input"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="endDate">Enddatum *</Label>
                        <Input
                          id="endDate"
                          name="endDate"
                          type="date"
                          required
                          className="bg-background border-input"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="participants">Teilnehmer *</Label>
                        <Input
                          id="participants"
                          name="participants"
                          type="number"
                          min="1"
                          defaultValue="1"
                          required
                          className="bg-background border-input"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select name="status" defaultValue="planned">
                          <SelectTrigger className="bg-background border-input">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="planned">Geplant</SelectItem>
                            <SelectItem value="ongoing">Laufend</SelectItem>
                            <SelectItem value="completed">Abgeschlossen</SelectItem>
                            <SelectItem value="cancelled">Abgesagt</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateOpen(false)}
                      disabled={isSubmitting}
                    >
                      Abbrechen
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Erstellen...
                        </>
                      ) : (
                        "Erstellen"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-card border-border animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : trips && trips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <Card
                key={trip.id}
                className="bg-card border-2 border-border hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-xl group"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-xl text-card-foreground group-hover:text-primary transition-colors">
                      {trip.title}
                    </CardTitle>
                    <Badge className={getStatusColor(trip.status)}>
                      {getStatusLabel(trip.status)}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    {trip.destination}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {trip.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {trip.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 text-secondary" />
                    <span>
                      {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4 text-accent" />
                    <span>{trip.participants} Teilnehmer</span>
                  </div>
                </CardContent>
                <CardFooter className="gap-2">
                  <Link href={`/trips/${trip.id}`} className="flex-1">
                    <Button variant="default" size="sm" className="w-full">
                      Details
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (confirm("Möchtest du diesen Ausflug wirklich löschen?")) {
                        deleteMutation.mutate({ id: trip.id });
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card border-2 border-border">
            <CardContent className="py-12 text-center">
              <Mountain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg mb-2">
                Du hast noch keine Ausflüge erstellt
              </p>
              <p className="text-muted-foreground mb-4">
                Starte jetzt und plane dein erstes Abenteuer!
              </p>
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ersten Ausflug erstellen
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
