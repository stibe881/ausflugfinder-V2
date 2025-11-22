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
import { useIsMobile } from "@/hooks/useMobile";
import { FilterBottomSheet } from "@/components/FilterBottomSheet";
import { CreateTripWizard } from "@/components/CreateTripWizard";
import { useAuth } from "@/_core/hooks/useAuth";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";


const CATEGORIES = [
  "Abenteuerweg",
  "Aktion & Sport",
  "Badewelt",
  "Freizeitpark",
  "Innenspielplatz",
  "Kugelbahn",
  "Kultur",
  "Museum",
  "Pumptrack",
  "Restaurant",
  "Schnitzeljagd",
  "Spielplatz",
  "Tierpark/Zoo",
  "Wanderweg",
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
  "Frankreich",
  "Italien",
  "Österreich",
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
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isCreateTripOpen, setIsCreateTripOpen] = useState(false);
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
  const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
  const [destinationToDeleteId, setDestinationToDeleteId] = useState<number | null>(null);

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
    setDestinationToDeleteId(id);
    setShowConfirmDeleteDialog(true);
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

  // Filter trips - only apply client-side filters (distance/nearby) since other filters are done server-side
  // Server handles: keyword, region, category, cost
  // Client handles: distance, sorting
  const filteredTrips = (trips?.data?.filter(trip => {
    // Distance filter (only remaining client-side filter)
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
            <div className="flex items-center gap-3">
              <img src="/icon-mountain.png" alt="Mountain" className="w-6 h-6" />
              <img src="/icon-sun.png" alt="Sun" className="w-6 h-6" />
              <img src="/icon-compass.png" alt="Compass" className="w-6 h-6" />
            </div>
            {user && (
              <Button
                onClick={() => setIsCreateTripOpen(true)}
                size="sm"
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                {isMobile ? "" : "Neuer Ausflug"}
              </Button>
            )}
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
          {isMobile ? (
            // Mobile Filter Button
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder={t("explore.search")}
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => setIsFilterSheetOpen(true)}
              >
                <Filter className="w-4 h-4" />
                {t("explore.filters")}
              </Button>
            </div>
          ) : (
            // Desktop Grid Filters
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
          )}

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
              <p className="text-muted-foreground mb-6">{filteredTrips.length} {t("explore.resultsFound")}</p>
              {viewMode === "map" ? (
                <div className="h-[600px] w-full rounded-lg overflow-hidden border">
                  <MapView
                    onMapReady={async (map) => {
                      const bounds = new window.google.maps.LatLngBounds();
                      let userLocation: { lat: number; lng: number } | null = null;
                      const markers: google.maps.Marker[] = [];

                      // Add user location marker
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            userLocation = {
                              lat: position.coords.latitude,
                              lng: position.coords.longitude,
                            };

                            // Create a pulsating effect for the user location marker
                            const pulseMarker = new window.google.maps.Marker({
                              position: userLocation,
                              map,
                              icon: {
                                path: window.google.maps.SymbolPath.CIRCLE,
                                scale: 15,
                                fillColor: "#3b82f6",
                                fillOpacity: 0.3,
                                strokeColor: "#3b82f6",
                                strokeWeight: 1,
                              },
                              zIndex: 999, // Lower zIndex than the main marker
                            });

                            let pulseDirection = 1;
                            setInterval(() => {
                              const currentOpacity = pulseMarker.get("opacity") || 0.3;
                              const currentScale = pulseMarker.get("scale") || 15;

                              if (pulseDirection === 1) {
                                if (currentScale >= 25) {
                                  pulseDirection = -1;
                                } else {
                                  pulseMarker.set("opacity", currentOpacity + 0.05);
                                  pulseMarker.set("scale", currentScale + 1);
                                }
                              } else {
                                if (currentScale <= 15) {
                                  pulseDirection = 1;
                                } else {
                                  pulseMarker.set("opacity", currentOpacity - 0.05);
                                  pulseMarker.set("scale", currentScale - 1);
                                }
                              }
                            }, 100);

                            // Create modern user location marker
                            new window.google.maps.Marker({
                              position: userLocation,
                              map,
                              title: "Dein Standort",
                              icon: {
                                path: window.google.maps.SymbolPath.CIRCLE,
                                scale: 10,
                                fillColor: "#3b82f6",
                                fillOpacity: 1,
                                strokeColor: "#ffffff",
                                strokeWeight: 3,
                              },
                              zIndex: 1000,
                            });

                            // Center map on user location
                            map.setCenter(userLocation);
                            map.setZoom(11);
                            bounds.extend(userLocation);
                          },
                          (error) => {
                            console.log("Geolocation permission denied or unavailable:", error.code);
                          }
                        );
                      }

                      // Create markers for each trip
                      (trips.data || []).forEach((trip) => {
                        // Skip if no coordinates or if coordinates are the string 'NULL'
                        if (!trip.latitude || !trip.longitude || trip.latitude === 'NULL' || trip.longitude === 'NULL') return;

                        const lat = parseFloat(trip.latitude);
                        const lng = parseFloat(trip.longitude);

                        // Skip if parsing failed or coordinates are invalid
                        if (isNaN(lat) || isNaN(lng)) return;

                        const position = { lat, lng };

                        // Create modern marker with custom styling
                        const marker = new window.google.maps.Marker({
                          position,
                          title: trip.title,
                          icon: {
                            path: window.google.maps.SymbolPath.CIRCLE,
                            scale: 11,
                            fillColor: "#10b981",
                            fillOpacity: 0.95,
                            strokeColor: "#ffffff",
                            strokeWeight: 2.5,
                          },
                        });

                        // Create info window with image and map selection
                        const infoWindow = new window.google.maps.InfoWindow({
                          content: `
                            <div style="padding: 0; max-width: 320px; font-family: system-ui; border-radius: 8px; overflow: hidden;">
                              ${trip.image ? `<img src="${trip.image}" alt="${trip.title}" style="width: 100%; height: 150px; object-fit: cover; display: block;">` : `<div style="width: 100%; height: 150px; background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); display: flex; align-items: center; justify-content: center;"><span style="color: #9ca3af; font-size: 12px;">Kein Bild vorhanden</span></div>`}
                              <div style="padding: 12px; background: white;">
                                <h3 style="font-weight: 600; margin: 0 0 8px 0; font-size: 15px; color: #1f2937;">${trip.title}</h3>
                                <p style="color: #6b7280; font-size: 13px; margin: 0 0 10px 0; line-height: 1.5;">${trip.description?.substring(0, 120) || 'Keine Beschreibung'}...</p>
                                <div style="display: flex; gap: 8px; margin-bottom: 12px; font-size: 12px;">
                                  <span style="color: #6b7280;">📍 ${trip.destination}</span>
                                  <span style="color: #6b7280;">•</span>
                                  <span style="color: #6b7280;">${COST_LABELS[trip.cost]}</span>
                                </div>
                                <a href="/trips/${trip.id}" style="display: inline-block; color: #fff; background: #10b981; text-decoration: none; font-size: 13px; font-weight: 500; padding: 6px 12px; border-radius: 4px; margin-bottom: 12px;">Details →</a>
                                <div style="display: flex; gap: 8px;">
                                  <button class="map-button-apple" data-lat="${trip.latitude}" data-lng="${trip.longitude}" data-name="${trip.destination}" style="flex: 1; color: #fff; background: #000; border: none; font-size: 12px; font-weight: 500; padding: 6px 8px; border-radius: 4px; cursor: pointer;">Apple Maps</button>
                                  <button class="map-button-google" data-lat="${trip.latitude}" data-lng="${trip.longitude}" data-name="${trip.destination}" style="flex: 1; color: #fff; background: #4285f4; border: none; font-size: 12px; font-weight: 500; padding: 6px 8px; border-radius: 4px; cursor: pointer;">Google Maps</button>
                                </div>
                              </div>
                            </div>
                          `,
                        });

                        marker.addListener("click", () => {
                          infoWindow.open(map, marker);
                          // Attach map button listeners after infoWindow opens
                          setTimeout(() => {
                            const appleBtn = document.querySelector(`.map-button-apple[data-lat="${trip.latitude}"]`);
                            const googleBtn = document.querySelector(`.map-button-google[data-lat="${trip.latitude}"]`);

                            if (appleBtn) {
                              appleBtn.addEventListener('click', () => {
                                const lat = appleBtn.getAttribute('data-lat');
                                const lng = appleBtn.getAttribute('data-lng');
                                const name = appleBtn.getAttribute('data-name');
                                const mapsUrl = `maps://maps.apple.com/?address=${encodeURIComponent(name)}&q=${encodeURIComponent(name)}&sll=${lat},${lng}`;
                                window.location.href = mapsUrl;
                              });
                            }

                            if (googleBtn) {
                              googleBtn.addEventListener('click', () => {
                                const lat = googleBtn.getAttribute('data-lat');
                                const lng = googleBtn.getAttribute('data-lng');
                                const name = googleBtn.getAttribute('data-name');
                                const mapsUrl = `https://maps.google.com/?q=${lat},${lng}(${encodeURIComponent(name)})`;
                                window.open(mapsUrl, '_blank');
                              });
                            }
                          }, 100);
                        });

                        markers.push(marker);
                        bounds.extend(position);
                      });

                      // Initialize MarkerClusterer with modern styling
                      console.log('[MapDebug] Starting MarkerClusterer initialization...');
                      console.log('[MapDebug] Number of markers:', markers.length);
                      console.log('[MapDebug] Map object:', map);

                        try {
                        console.log('[MapDebug] Importing MarkerClusterer...');
                        const { MarkerClusterer } = await import('@googlemaps/markerclusterer');
                        console.log('[MapDebug] MarkerClusterer imported:', MarkerClusterer);

                        // Custom renderer function for modern cluster icons
                        const renderer = {
                          render: ({ count, position }: { count: number; position: google.maps.LatLngLiteral }) => {
                            const scale = 20 + Math.min(count, 100) / 5; // Scale up to a certain point
                            const fontSize = 12 + Math.min(count, 100) / 10;

                            return new window.google.maps.Marker({
                              label: {
                                text: String(count),
                                color: "white",
                                fontSize: `${fontSize}px`,
                                fontWeight: "bold",
                              },
                              position,
                              icon: {
                                path: window.google.maps.SymbolPath.CIRCLE,
                                scale: scale,
                                fillColor: "#10b981", // Primary color, consistent with individual markers
                                fillOpacity: 0.95,
                                strokeColor: "#ffffff",
                                strokeWeight: 2.5,
                              },
                              zIndex: Number(window.google.maps.Marker.MAX_ZINDEX) + count,
                            });
                          },
                        };

                        console.log('[MapDebug] Creating MarkerClusterer with gridSize=80, maxZoom=15...');
                        const clusterer = new MarkerClusterer({
                          map,
                          markers,
                          renderer,
                        });
                        console.log('[MapDebug] MarkerClusterer instance created successfully:', clusterer);
                        console.log('[MapDebug] Clusterer has', markers.length, 'total markers');
                      } catch (err) {
                        console.error('[MapDebug] MarkerClusterer Library Error:', err);
                        console.log('[MapDebug] Falling back to non-clustered markers. Adding', markers.length, 'markers to map...');
                        // Fallback: just add all markers without clustering
                        markers.forEach(marker => marker.setMap(map));
                        console.log('[MapDebug] Fallback markers added to map');
                      }

                      // Fit map to bounds with padding
                      if (!bounds.isEmpty() && markers.length > 0) {
                        map.fitBounds(bounds, 80);

                        // Adjust zoom to reasonable level
                        google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
                          const zoom = map.getZoom();
                          if (zoom !== undefined && zoom > 15) {
                            map.setZoom(15);
                          }
                        });
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
                          {trip.destination && (
                            <Badge variant="outline" className="text-xs bg-background/40 hover:bg-background/60 border-border/60">
                              {trip.destination}
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
                    <Card
                      className="overflow-visible cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm group flex flex-row gap-4 p-4"
                    >
                      {/* Image Section - Top Third */}
                      <div className="w-40 h-40 flex-shrink-0 relative overflow-hidden bg-gradient-to-br from-muted to-muted/50 rounded-lg">
                        {trip.image ? (
                          <>
                            <img
                              src={trip.image}
                              alt={trip.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                            <MapPin className="w-8 h-8 text-muted-foreground/40" />
                          </div>
                        )}

                        {/* Favorite Badge - Top Left */}
                        {trip.isFavorite === 1 && (
                          <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm p-1.5 rounded-full shadow-md">
                            <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                          </div>
                        )}

                        {/* Cost Badge - Bottom Right */}
                        <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full shadow-md">
                          <span className="text-xs font-bold text-primary">{COST_LABELS[trip.cost]}</span>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="flex-1 flex flex-col justify-between">
                        {/* Header */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1">
                              <h3 className="font-bold text-base line-clamp-2 group-hover:text-primary transition-colors">
                                {trip.title}
                              </h3>
                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                                <MapPin className="w-4 h-4 flex-shrink-0 text-primary/70" />
                                <span className="line-clamp-1">{trip.destination}</span>
                              </div>
                            </div>
                          </div>

                          {trip.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1 leading-relaxed">
                              {trip.description}
                            </p>
                          )}
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 pt-2">
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

      {/* Filter Bottom Sheet for Mobile */}
      <FilterBottomSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        keyword={keyword}
        onKeywordChange={setKeyword}
        region={region}
        onRegionChange={setRegion}
        category={category}
        onCategoryChange={setCategory}
        cost={cost}
        onCostChange={setCost}
        onReset={handleReset}
        regions={REGIONS}
        categories={CATEGORIES}
      />

      {/* Create Trip Wizard */}
      <CreateTripWizard
        open={isCreateTripOpen}
        onOpenChange={setIsCreateTripOpen}
      />
      <ConfirmationDialog
        isOpen={showConfirmDeleteDialog}
        onConfirm={() => {
          if (destinationToDeleteId !== null) {
            deleteDestMutation.mutate(destinationToDeleteId); // Assuming this mutation exists and takes the ID
            toast.success(t("explore.destDeleted")); // Placeholder for success message
            setShowConfirmDeleteDialog(false);
            setDestinationToDeleteId(null);
          }
        }}
        onCancel={() => setShowConfirmDeleteDialog(false)}
        title={t("explore.destDeleteConfirmTitle") || "Confirm Destination Deletion"} // Assuming new translation key
        message={t("explore.destDeleteConfirm")}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        isDestructive
      />
    </div>
  );
}
