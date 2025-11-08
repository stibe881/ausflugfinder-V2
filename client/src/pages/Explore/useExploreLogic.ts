import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export interface ExploreFilters {
  keyword: string;
  region: string;
  category: string;
  cost: string;
  nearbyOnly: boolean;
  maxDistance: number;
}

export interface ExploreSortOptions {
  sortBy: "name" | "date" | "cost";
  sortOrder: "asc" | "desc";
}

/**
 * Custom Hook that encapsulates all Explore page logic
 * Handles filters, sorting, geolocation, and API calls
 */
export function useExploreLogic() {
  const [location] = useLocation();

  // Filter states
  const [keyword, setKeyword] = useState("");
  const [region, setRegion] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [cost, setCost] = useState<string>("");
  const [nearbyOnly, setNearbyOnly] = useState(false);
  const [maxDistance, setMaxDistance] = useState(50);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);

  // View and sort states
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const [sortBy, setSortBy] = useState<"name" | "date" | "cost">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [activeTab, setActiveTab] = useState<"trips" | "destinations">("trips");

  // Destination form states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [destFormData, setDestFormData] = useState({
    name: "",
    location: "",
    description: "",
    imageUrl: ""
  });
  const [editingDestId, setEditingDestId] = useState<number | null>(null);
  const [destLoading, setDestLoading] = useState(false);
  const [allDestinations, setAllDestinations] = useState<any[]>([]);

  // Geolocation state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // API Queries
  const { data: trips, isLoading } = trpc.trips.search.useQuery({
    keyword: keyword || undefined,
    region: region || undefined,
    category: category || undefined,
    cost: cost || undefined,
    isPublic: true,
  });

  const { data: stats } = trpc.trips.statistics.useQuery();

  // Mutations
  const toggleFavoriteMutation = trpc.trips.toggleFavorite.useMutation({
    onSuccess: () => toast.success("Favorit aktualisiert!"),
    onError: () => toast.error("Fehler beim Aktualisieren des Favorits"),
  });

  // Read query parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const costParam = params.get('cost');
    if (costParam) {
      setCost(costParam);
    }
  }, [location]);

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.log("Geolocation error:", error)
      );
    }
  }, []);

  // Calculate distance (Haversine formula)
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

  // Filter and sort trips
  const filteredTrips = (trips?.data?.filter(trip => {
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

  // Reset filters
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

  // Destination handlers
  const resetDestForm = () => {
    setDestFormData({ name: "", location: "", description: "", imageUrl: "" });
    setEditingDestId(null);
  };

  const handleDestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(editingDestId ? "Destination aktualisiert!" : "Destination erstellt!");
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
    if (confirm("Möchtest du diese Destination wirklich löschen?")) {
      toast.success("Destination gelöscht!");
    }
  };

  return {
    // Filter state
    keyword, setKeyword,
    region, setRegion,
    category, setCategory,
    cost, setCost,
    nearbyOnly, setNearbyOnly,
    maxDistance, setMaxDistance,
    selectedAttributes, setSelectedAttributes,

    // View/Sort state
    viewMode, setViewMode,
    sortBy, setSortBy,
    sortOrder, setSortOrder,
    activeTab, setActiveTab,

    // Location
    userLocation,

    // Data
    trips, isLoading, stats,
    filteredTrips,

    // Dialog state
    isDialogOpen, setIsDialogOpen,
    destFormData, setDestFormData,
    editingDestId, setEditingDestId,
    destLoading, setDestLoading,
    allDestinations, setAllDestinations,

    // Mutations
    toggleFavoriteMutation,

    // Handlers
    handleReset,
    resetDestForm,
    handleDestSubmit,
    handleEditDest,
    handleDeleteDest,
    calculateDistance,
  };
}
