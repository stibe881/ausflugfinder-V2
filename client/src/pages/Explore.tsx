import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Calendar, Users, Heart, CheckCircle2, Filter, Grid, List, Map as MapIcon, ArrowLeft, Edit, Trash2, Plus, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { APP_TITLE } from "@/const";
import { MapView } from "@/components/Map";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useI18n } from "@/contexts/i18nContext";

const CATEGORIES = [
  "Aktion & Sport",
  "Badewelt",
  "Freizeitpark",
  "Innenspielplatz",
  "Kultur",
  "Pumptrack",
  "Restaurant",
  "Schnitzeljagd",
  "Spielplatz",
  "Tierpark/Zoo",
  "Wanderweg",
  "Abenteuerweg",
  "Kugelbahn",
  "Museum",
];

const REGIONS = [
  // Schweizer Kantone
  "Aargau",
  "Appenzell Ausserrhoden",
  "Appenzell Innerrhoden",
  "Basel-Landschaft",
  "Basel-Stadt",
  "Bern",
  "Fribourg",
  "Genève",
  "Glarus",
  "Graubünden",
  "Jura",
  "Luzern",
  "Neuchâtel",
  "Nidwalden",
  "Obwalden",
  "Schaffhausen",
  "Schwyz",
  "Solothurn",
  "St. Gallen",
  "Tessin",
  "Thurgau",
  "Uri",
  "Valais",
  "Vaud",
  "Zug",
  "Zürich",
  // Nachbarländer
  "Deutschland",
  "Österreich",
  "Frankreich",
  "Italien",
];

const COST_LABELS: Record<string, string> = {
  free: "Kostenlos",
  low: "CHF 🪙",
  medium: "CHF 🪙🪙",
  high: "CHF 🪙🪙🪙",
  very_high: "CHF 🪙🪙🪙🪙",
};

export default function Explore() {
  const { t } = useI18n();
  const [location] = useLocation();
  const [keyword, setKeyword] = useState("");
  const [region, setRegion] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [cost, setCost] = useState<string>("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyOnly, setNearbyOnly] = useState(false);
  const [maxDistance, setMaxDistance] = useState(50); // km
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"name" | "date" | "cost">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [activeTab, setActiveTab] = useState<"trips" | "destinations">("trips");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [destFormData, setDestFormData] = useState({ name: "", location: "", description: "", imageUrl: "" });
  const [editingDestId, setEditingDestId] = useState<number | null>(null);
  const [destLoading, setDestLoading] = useState(false);
  const [allDestinations, setAllDestinations] = useState<any[]>([]);

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

  // Toggle favorite mutation
  const toggleFavoriteMutation = trpc.trips.toggleFavorite.useMutation({
    onSuccess: () => {
      toast.success(t("explore.favoriteUpdated"));
    },
    onError: (error) => {
      toast.error(t("explore.favoriteError"));
    },
  });

  // Destination mutations (stubs - would need backend implementation)
  const createDestMutation = {
    isPending: false,
    mutate: () => {},
  };

  const updateDestMutation = {
    isPending: false,
    mutate: () => {},
  };

  const deleteDestMutation = {
    isPending: false,
    mutate: () => {},
  };

  const resetDestForm = () => {
    setDestFormData({ name: "", location: "", description: "", imageUrl: "" });
    setEditingDestId(null);
  };

  const handleDestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Stub implementation
    toast.success(editingDestId ? t("explore.destUpdated") : t("explore.destCreated"));
    setIsDialogOpen(false);
    resetDestForm();
  };

  const handleEditDest = (destination: any) => {
    setEditingDestId(destination.id);
    setDestFormData({
      name: destination.name,
      location: destination.location,
      description: destination.description || "",
      imageUrl: destination.imageUrl || "",
    });
    setIsDialogOpen(true);
  };

  const handleDeleteDest = (id: number) => {
    if (confirm(t("explore.destDeleteConfirm"))) {
      toast.success(t("explore.destDeleted"));
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
  const filteredTrips = (trips?.data?.filter(trip => {
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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 overflow-x-hidden">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                {t("explore.back")}
              </Button>
            </Link>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              {t("explore.header")}
            </h1>
            <div className="w-12"></div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
        <div className="container">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            {t("explore.title")}
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-8">
            {t("explore.subtitle")}
          </p>

          {/* Statistics */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
              <Card
                className="cursor-pointer transition-all hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
                onClick={handleReset}
              >
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-primary">{stats.totalActivities}</div>
                  <div className="text-sm text-muted-foreground">{t("explore.activities")}</div>
                </CardContent>
              </Card>
              <Card
                className="cursor-pointer transition-all hover:shadow-lg hover:shadow-secondary/10 hover:-translate-y-1"
                onClick={() => {
                  setCost("free");
                  setKeyword("");
                  setRegion("");
                  setCategory("");
                  setNearbyOnly(false);
                  setSelectedAttributes([]);
                  setSortBy("date");
                  setSortOrder("desc");
                }}
              >
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-secondary">{stats.freeActivities}</div>
                  <div className="text-sm text-muted-foreground">{t("explore.freeActivities")}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-accent">{stats.totalCategories}</div>
                  <div className="text-sm text-muted-foreground">{t("explore.categories")}</div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="border-b bg-card sticky top-16 z-10">
        <div className="container flex gap-4">
          <button
            onClick={() => setActiveTab("trips")}
            className={`px-6 py-4 font-medium border-b-2 transition-colors ${
              activeTab === "trips"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("explore.tabTrips")}
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      {activeTab === "trips" && (
      <section className="py-8 bg-card border-b">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-4 w-full">
            {/* Keyword Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder={t("explore.search")}
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Region Filter */}
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger>
                <SelectValue placeholder={t("explore.allRegions")} />
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
                <SelectValue placeholder={t("explore.allCategories")} />
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
                <SelectValue placeholder={t("explore.allCosts")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">{t("explore.costFree")}</SelectItem>
                <SelectItem value="low">CHF •</SelectItem>
                <SelectItem value="medium">CHF ••</SelectItem>
                <SelectItem value="high">CHF •••</SelectItem>
                <SelectItem value="very_high">CHF ••••</SelectItem>
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
                {t("explore.nearbyOnly")} ({maxDistance} km)
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

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mt-4">
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto">
                <Filter className="w-4 h-4 mr-2" />
                {t("explore.resetFilters")}
              </Button>

              {/* Sort Options */}
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as "name" | "date" | "cost")}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={t("explore.sortBy")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">{t("explore.sortDate")}</SelectItem>
                  <SelectItem value="name">{t("explore.sortName")}</SelectItem>
                  <SelectItem value="cost">{t("explore.sortCost")}</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                title={sortOrder === "asc" ? t("explore.sortAsc") : t("explore.sortDesc")}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </Button>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
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
              <p className="mt-4 text-muted-foreground">{t("explore.loading")}</p>
            </div>
          ) : trips?.data && trips.data.length > 0 ? (
            <>
              <p className="text-muted-foreground mb-6">{trips.data.length} {t("explore.resultsFound")}</p>
              {viewMode === "map" ? (
                <div className="h-[600px] w-full rounded-lg overflow-hidden border">
                  <MapView
                    onMapReady={(map) => {
                      const bounds = new window.google.maps.LatLngBounds();

                      trips.data.forEach((trip) => {
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
              ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTrips?.map((trip) => (
                  <Link key={trip.id} href={`/trips/${trip.id}`}>
                    <Card className="overflow-hidden cursor-pointer h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm group" style={{ padding: 0 }}>
                      {/* Image Container - NO PADDING, FULL BLEED */}
                      <div className="relative w-full h-56 bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
                        {trip.image ? (
                          <>
                            <img
                              src={trip.image}
                              alt={trip.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                            <MapPin className="w-12 h-12 text-muted-foreground/40" />
                          </div>
                        )}

                        {/* Cost Badge - Top Right */}
                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full shadow-md">
                          <span className="text-sm font-bold text-primary">{COST_LABELS[trip.cost]}</span>
                        </div>

                        {/* Favorite Badge - Top Left */}
                        {trip.isFavorite === 1 && (
                          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm p-1.5 rounded-full shadow-md">
                            <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                          </div>
                        )}

                        {/* Category Badge - Bottom Left */}
                        {trip.category && (
                          <div className="absolute bottom-3 left-3">
                            <Badge className="bg-primary/90 hover:bg-primary text-white text-xs font-medium">
                              {trip.category}
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Content - WITH PADDING */}
                      <div className="flex-grow flex flex-col pt-4 px-4">
                        <div className="space-y-2 pb-3">
                          <div className="text-lg font-bold line-clamp-2 group-hover:text-primary transition-colors">
                            {trip.title}
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 flex-shrink-0 text-primary/70" />
                            <span className="line-clamp-1">{trip.destination}</span>
                          </div>
                        </div>

                      <div className="flex-grow pb-3 space-y-3">
                        {trip.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {trip.description}
                          </p>
                        )}

                        {/* Badges Row */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          {trip.region && (
                            <Badge variant="outline" className="text-xs bg-background/40 hover:bg-background/60 border-border/60">
                              {trip.region}
                            </Badge>
                          )}
                          {trip.ageRecommendation && (
                            <Badge variant="outline" className="text-xs bg-background/40 hover:bg-background/60 border-border/60">
                              {trip.ageRecommendation}
                            </Badge>
                          )}
                          {trip.isDone === 1 && (
                            <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 text-xs gap-1 border border-green-500/30">
                              <CheckCircle2 className="w-3 h-3" />
                              {t("explore.visited")}
                            </Badge>
                          )}
                        </div>
                      </div>
                      </div>

                    </Card>
                  </Link>
                ))}
              </div>
              ) : (
              /* List View */
              <div className="space-y-4">
                {filteredTrips?.map((trip) => (
                  <Link key={trip.id} href={`/trips/${trip.id}`}>
                    <Card className="overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm group">
                      <div className="flex gap-0 h-auto">
                        {/* Image - Left Side */}
                        <div className="relative w-0 sm:w-48 flex-shrink-0 bg-gradient-to-br from-muted to-muted/50 overflow-hidden hidden sm:block rounded-xl m-4 sm:m-0">
                          {trip.image ? (
                            <>
                              <img
                                src={trip.image}
                                alt={trip.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                              <MapPin className="w-8 h-8 text-muted-foreground/40" />
                            </div>
                          )}
                        </div>

                        {/* Content - Right Side */}
                        <div className="flex-grow p-5 flex flex-col justify-between gap-4">
                          {/* Header */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-start gap-3">
                              <div className="flex-1">
                                <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                                  {trip.title}
                                </h3>
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1.5">
                                  <MapPin className="w-4 h-4 flex-shrink-0 text-primary/70" />
                                  <span className="line-clamp-1">{trip.destination}</span>
                                </div>
                              </div>
                              {trip.isFavorite === 1 && (
                                <Heart className="w-6 h-6 fill-red-500 text-red-500 flex-shrink-0 mt-0.5" />
                              )}
                            </div>

                            {trip.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                {trip.description}
                              </p>
                            )}
                          </div>

                          {/* Badges */}
                          <div className="flex flex-wrap gap-2">
                            {trip.category && (
                              <Badge className="bg-primary/90 hover:bg-primary text-white text-xs font-medium">
                                {trip.category}
                              </Badge>
                            )}
                            {trip.region && (
                              <Badge variant="outline" className="text-xs bg-background/40 hover:bg-background/60 border-border/60">
                                {trip.region}
                              </Badge>
                            )}
                            {trip.ageRecommendation && (
                              <Badge variant="outline" className="text-xs bg-background/40 hover:bg-background/60 border-border/60">
                                {trip.ageRecommendation}
                              </Badge>
                            )}
                            {trip.isDone === 1 && (
                              <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 text-xs gap-1 border border-green-500/30">
                                <CheckCircle2 className="w-3 h-3" />
                                {t("explore.visited")}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t("explore.noResults")}</p>
            </div>
          )}
        </div>
      </section>
      )}

    </div>
  );
}
