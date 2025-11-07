import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Calendar, Users, Heart, CheckCircle2, Euro, Filter, Grid, List, Map as MapIcon, ArrowLeft, Edit, Trash2, Plus, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { APP_TITLE } from "@/const";
import { MapView } from "@/components/Map";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const CATEGORIES = [
  "Action",
  "Water park",
  "Amusement park",
  "Indoor playground",
  "Culture",
  "Pumptrack",
  "Restaurant",
  "Scavenger hunt",
  "Playground",
  "Animal park/Zoo",
  "Hiking",
];

const REGIONS = [
  "Aargau",
  "Basel",
  "Bern",
  "Zürich",
  "Luzern",
  "St. Gallen",
  "Graubünden",
  "Tessin",
];

const COST_LABELS: Record<string, string> = {
  free: "Kostenlos",
  low: "€",
  medium: "€€",
  high: "€€€",
  very_high: "€€€€",
};

export default function Explore() {
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState<"trips" | "destinations">("trips");
  const [keyword, setKeyword] = useState("");
  const [region, setRegion] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [cost, setCost] = useState<string>("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyOnly, setNearbyOnly] = useState(false);
  const [maxDistance, setMaxDistance] = useState(50); // km
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"name" | "date" | "cost">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Destination form state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDestId, setEditingDestId] = useState<number | null>(null);
  const [destFormData, setDestFormData] = useState({
    name: "",
    description: "",
    location: "",
    imageUrl: "",
  });

  // Read query parameters on mount and when location changes
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const costParam = params.get('cost');
    if (costParam) {
      setCost(costParam);
    } else {
      setCost("");
    }
  }, [location]);

  const { data: trips, isLoading } = trpc.trips.search.useQuery({
    keyword: keyword || undefined,
    region: region || undefined,
    category: category || undefined,
    cost: cost || undefined,
    isPublic: true,
  });

  const { data: stats } = trpc.trips.statistics.useQuery();

  // Destinations queries
  const { data: allDestinations, isLoading: destLoading, refetch: refetchDestinations } = trpc.destinations.list.useQuery();
  const createDestMutation = trpc.destinations.create.useMutation({
    onSuccess: () => {
      toast.success("Destination erfolgreich erstellt!");
      refetchDestinations();
      setIsDialogOpen(false);
      resetDestForm();
    },
    onError: (error) => {
      toast.error("Fehler beim Erstellen: " + error.message);
    },
  });
  const updateDestMutation = trpc.destinations.update.useMutation({
    onSuccess: () => {
      toast.success("Destination erfolgreich aktualisiert!");
      refetchDestinations();
      setIsDialogOpen(false);
      resetDestForm();
    },
    onError: (error) => {
      toast.error("Fehler beim Aktualisieren: " + error.message);
    },
  });
  const deleteDestMutation = trpc.destinations.delete.useMutation({
    onSuccess: () => {
      toast.success("Destination gelöscht!");
      refetchDestinations();
    },
    onError: (error) => {
      toast.error("Fehler beim Löschen: " + error.message);
    },
  });

  const resetDestForm = () => {
    setDestFormData({ name: "", description: "", location: "", imageUrl: "" });
    setEditingDestId(null);
  };

  const handleDestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDestId) {
      updateDestMutation.mutate({ id: editingDestId, ...destFormData });
    } else {
      createDestMutation.mutate(destFormData);
    }
  };

  const handleEditDest = (destination: any) => {
    setEditingDestId(destination.id);
    setDestFormData({
      name: destination.name,
      description: destination.description || "",
      location: destination.location,
      imageUrl: destination.imageUrl || "",
    });
    setIsDialogOpen(true);
  };

  const handleDeleteDest = (id: number) => {
    if (confirm("Möchten Sie diese Destination wirklich löschen?")) {
      deleteDestMutation.mutate({ id });
    }
  };

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Geolocation error:", error);
        }
      );
    }
  }, []);

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Filter trips by distance and attributes
  const filteredTrips = (trips?.filter(trip => {
    // Distance filter
    if (nearbyOnly && userLocation) {
      if (!trip.latitude || !trip.longitude) return false;
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        parseFloat(trip.latitude),
        parseFloat(trip.longitude)
      );
      if (distance > maxDistance) return false;
    }
    // Attribute filter (not implemented in backend yet, would need trip attributes)
    // if (selectedAttributes.length > 0) {
    //   return selectedAttributes.some(attr => trip.attributes?.includes(attr));
    // }
    return true;
  }) || []).sort((a, b) => {
    let comparison = 0;
    if (sortBy === "name") {
      comparison = a.title.localeCompare(b.title);
    } else if (sortBy === "date") {
      comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    } else if (sortBy === "cost") {
      const costOrder = { free: 0, low: 1, medium: 2, high: 3, very_high: 4 };
      comparison = (costOrder[a.cost as keyof typeof costOrder] || 0) - (costOrder[b.cost as keyof typeof costOrder] || 0);
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const handleReset = () => {
    setKeyword("");
    setRegion("");
    setCategory("");
    setCost("");
    setNearbyOnly(false);
    setSelectedAttributes([]);
    setSortBy("date");
    setSortOrder("desc");
  };

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
              {APP_TITLE}
            </h1>
            <Link href="/trips">
              <Button variant="outline">Meine Ausflüge</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
        <div className="container">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Ausflüge entdecken und Destinationen
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-8">
            Finde das perfekte Abenteuer und inspiriere dich für deine nächste Reise
          </p>

          {/* Tabs */}
          <div className="flex justify-center gap-4 mb-8">
            <Button
              variant={activeTab === "trips" ? "default" : "outline"}
              size="lg"
              onClick={() => setActiveTab("trips")}
              className="px-6"
            >
              Ausflüge
            </Button>
            <Button
              variant={activeTab === "destinations" ? "default" : "outline"}
              size="lg"
              onClick={() => setActiveTab("destinations")}
              className="px-6"
            >
              Destinationen
            </Button>
          </div>

          {/* Statistics */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-primary">{stats.totalActivities}</div>
                  <div className="text-sm text-muted-foreground">Aktivitäten</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-secondary">{stats.freeActivities}</div>
                  <div className="text-sm text-muted-foreground">Kostenlos</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-accent">{stats.totalCategories}</div>
                  <div className="text-sm text-muted-foreground">Kategorien</div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Search and Filter Section - Trips Tab */}
      {activeTab === "trips" && (
      <section className="py-8 bg-card border-b">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Keyword Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Suche nach Ausflügen..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Region Filter */}
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger>
                <SelectValue placeholder="Alle Regionen" />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Alle Kategorien" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Cost Filter */}
            <Select value={cost} onValueChange={setCost}>
              <SelectTrigger>
                <SelectValue placeholder="Alle Kosten" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Kostenlos</SelectItem>
                <SelectItem value="low">€</SelectItem>
                <SelectItem value="medium">€€</SelectItem>
                <SelectItem value="high">€€€</SelectItem>
                <SelectItem value="very_high">€€€€</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Nearby Filter */}
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="nearby"
                checked={nearbyOnly}
                onChange={(e) => setNearbyOnly(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <label htmlFor="nearby" className="text-sm font-medium">
                Nur Ausflüge in der Nähe ({maxDistance} km)
              </label>
            </div>
            {nearbyOnly && (
              <div className="flex items-center gap-2 flex-1 max-w-xs">
                <input
                  type="range"
                  min="5"
                  max="200"
                  step="5"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-16">{maxDistance} km</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset}>
                <Filter className="w-4 h-4 mr-2" />
                Filter zurücksetzen
              </Button>
              
              {/* Sort Options */}
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as "name" | "date" | "cost")}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sortieren nach" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Datum</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="cost">Kosten</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                title={sortOrder === "asc" ? "Aufsteigend" : "Absteigend"}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "map" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("map")}
              >
                <MapIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Results Section - Trips Tab */}
      {activeTab === "trips" && (
      <section className="py-12">
        <div className="container">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Lade Ausflüge...</p>
            </div>
          ) : trips && trips.length > 0 ? (
            <>
              <p className="text-muted-foreground mb-6">{trips.length} Ergebnisse gefunden</p>
              {viewMode === "map" ? (
                <div className="h-[600px] w-full rounded-lg overflow-hidden border">
                  <MapView
                    onMapReady={(map) => {
                      const bounds = new window.google.maps.LatLngBounds();
                      
                      trips.forEach((trip) => {
                        if (trip.latitude && trip.longitude) {
                          const lat = parseFloat(trip.latitude);
                          const lng = parseFloat(trip.longitude);
                          const position = { lat, lng };
                          
                          const marker = new window.google.maps.Marker({
                            position,
                            map,
                            title: trip.title,
                          });
                          
                          const infoWindow = new window.google.maps.InfoWindow({
                            content: `
                              <div style="padding: 8px; max-width: 250px;">
                                <h3 style="font-weight: bold; margin-bottom: 4px;">${trip.title}</h3>
                                <p style="color: #666; font-size: 14px; margin-bottom: 8px;">${trip.description?.substring(0, 100) || ''}...</p>
                                <p style="font-size: 12px; color: #888;">
                                  <strong>${trip.destination}</strong> • ${COST_LABELS[trip.cost]}
                                </p>
                                <a href="/trips/${trip.id}" style="color: #22c55e; text-decoration: none; font-size: 14px;">Details ansehen →</a>
                              </div>
                            `,
                          });
                          
                          marker.addListener("click", () => {
                            infoWindow.open(map, marker);
                          });
                          
                          bounds.extend(position);
                        }
                      });
                      
                      if (!bounds.isEmpty()) {
                        map.fitBounds(bounds);
                      }
                    }}
                  />
                </div>
              ) : (
              <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                {filteredTrips.map((trip) => (
                  <Link key={trip.id} href={`/trips/${trip.id}`}>
                    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer h-full overflow-hidden flex flex-col">
                      {trip.image && (
                        <div className="relative w-full h-48 bg-muted overflow-hidden">
                          <img
                            src={trip.image}
                            alt={trip.title}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex justify-between items-start mb-2">
                          <CardTitle className="text-xl">{trip.title}</CardTitle>
                          {trip.isFavorite === 1 && <Heart className="w-5 h-5 fill-red-500 text-red-500" />}
                        </div>
                        <CardDescription className="line-clamp-2">{trip.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{trip.destination}</span>
                          </div>
                          {trip.region && (
                            <Badge variant="outline">{trip.region}</Badge>
                          )}
                          {trip.category && (
                            <Badge variant="secondary">{trip.category}</Badge>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Euro className="w-4 h-4" />
                          <span className="text-sm font-medium">{COST_LABELS[trip.cost]}</span>
                        </div>
                        {trip.isDone === 1 && (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Erledigt
                          </Badge>
                        )}
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Keine Ausflüge gefunden. Versuche andere Filter!</p>
            </div>
          )}
        </div>
      </section>
      )}

      {/* Destinations Section - Destinations Tab */}
      {activeTab === "destinations" && (
      <section className="py-12">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Meine Destinationen</h2>
              <p className="text-muted-foreground">
                Speichere deine Lieblingsorte für zukünftige Ausflüge
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetDestForm();
            }}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                  <Plus className="w-5 h-5" />
                  Neue Destination
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleDestSubmit}>
                  <DialogHeader>
                    <DialogTitle>
                      {editingDestId ? "Destination bearbeiten" : "Neue Destination"}
                    </DialogTitle>
                    <DialogDescription>
                      Füge einen neuen Lieblingsort hinzu
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={destFormData.name}
                        onChange={(e) => setDestFormData({ ...destFormData, name: e.target.value })}
                        required
                        placeholder="z.B. Schwarzwald"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Ort *</Label>
                      <Input
                        id="location"
                        value={destFormData.location}
                        onChange={(e) => setDestFormData({ ...destFormData, location: e.target.value })}
                        required
                        placeholder="z.B. Baden-Württemberg, Deutschland"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Beschreibung</Label>
                      <Textarea
                        id="description"
                        value={destFormData.description}
                        onChange={(e) => setDestFormData({ ...destFormData, description: e.target.value })}
                        placeholder="Was macht diesen Ort besonders?"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="imageUrl">Bild-URL (optional)</Label>
                      <Input
                        id="imageUrl"
                        value={destFormData.imageUrl}
                        onChange={(e) => setDestFormData({ ...destFormData, imageUrl: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Abbrechen
                    </Button>
                    <Button type="submit" disabled={createDestMutation.isPending || updateDestMutation.isPending}>
                      {(createDestMutation.isPending || updateDestMutation.isPending) && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      {editingDestId ? "Aktualisieren" : "Erstellen"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {destLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : allDestinations && allDestinations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allDestinations.map((destination) => (
                <Card key={destination.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                  {destination.imageUrl && (
                    <div className="h-48 bg-muted overflow-hidden">
                      <img
                        src={destination.imageUrl}
                        alt={destination.name}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      {destination.name}
                    </CardTitle>
                    <CardDescription>{destination.location}</CardDescription>
                  </CardHeader>
                  {destination.description && (
                    <CardContent className="flex-grow">
                      <p className="text-sm text-muted-foreground">{destination.description}</p>
                    </CardContent>
                  )}
                  <CardFooter className="gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditDest(destination)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Bearbeiten
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteDest(destination.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-6">Keine Destinationen vorhanden. Erstelle deine erste Destination!</p>
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetDestForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-5 h-5" />
                    Erste Destination erstellen
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          )}
        </div>
      </section>
      )}
    </div>
  );
}
