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
import { MapPin, Calendar, Users, Plus, Trash2, ArrowLeft, Loader2, Mountain, DollarSign, Flame, Eye, Share2, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useI18n } from "@/contexts/i18nContext";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";

export default function Trips() {
  const { t } = useI18n();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTripIndex, setSelectedTripIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Swipe navigation for mobile
  useSwipeNavigation({
    onSwipeLeft: () => {
      setSelectedTripIndex((prev) => Math.min(prev + 1, (trips?.length || 1) - 1));
    },
    onSwipeRight: () => {
      setSelectedTripIndex((prev) => Math.max(prev - 1, 0));
    },
  });
  
  const { data: trips, isLoading, refetch } = trpc.trips.myTrips.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  const utils = trpc.useUtils();
  const createMutation = trpc.trips.create.useMutation({
    onSuccess: () => {
      refetch();
      utils.trips.search.invalidate();
      setIsCreateOpen(false);
      // Reset form
      const form = document.querySelector('form');
      if (form) form.reset();
      toast.success(t("trips.createSuccess"));
    },
    onError: (error) => {
      toast.error(t("trips.createError") + error.message);
    },
  });

  const deleteMutation = trpc.trips.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success(t("trips.deleteSuccess"));
    },
    onError: (error) => {
      toast.error(t("trips.deleteError") + error.message);
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
      isFavorite: formData.get("isFavorite") ? 1 : 0,
      isPublic: formData.get("isPublic") ? 1 : 0,
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
        return t("trips.statusPlanned");
      case "ongoing":
        return t("trips.statusOngoing");
      case "completed":
        return t("trips.statusCompleted");
      case "cancelled":
        return t("trips.statusCancelled");
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
            <CardTitle>{t("trips.loginRequired")}</CardTitle>
            <CardDescription>
              {t("trips.loginRequiredDesc")}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex gap-2">
            <Link href="/">
              <Button variant="outline">{t("trips.back")}</Button>
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
                  {t("trips.back")}
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Mountain className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {t("trips.myTrips")}
                </h1>
              </div>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-md">
                  <Plus className="w-4 h-4" />
                  {t("trips.newPlan")}
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-2 border-border max-w-3xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle className="text-card-foreground text-2xl">{t("trips.createNew")}</DialogTitle>
                    <DialogDescription>
                      {t("trips.createNewDesc")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {/* Basic Information */}
                    <div className="border-b border-border pb-4">
                      <h3 className="font-semibold text-sm mb-3">{t("trips.basicInfo")}</h3>
                      <div className="grid gap-2">
                        <Label htmlFor="title">{t("trips.title")} *</Label>
                        <Input
                          id="title"
                          name="title"
                          placeholder={t("trips.titlePlaceholder")}
                          required
                          className="bg-background border-input"
                        />
                      </div>
                      <div className="grid gap-2 mt-3">
                        <Label htmlFor="destination">{t("trips.destination")} *</Label>
                        <Input
                          id="destination"
                          name="destination"
                          placeholder={t("trips.destinationPlaceholder")}
                          required
                          className="bg-background border-input"
                        />
                      </div>
                      <div className="grid gap-2 mt-3">
                        <Label htmlFor="description">{t("trips.description")}</Label>
                        <Textarea
                          id="description"
                          name="description"
                          placeholder={t("trips.descriptionPlaceholder")}
                          rows={3}
                          className="bg-background border-input"
                        />
                      </div>
                    </div>

                    {/* Date & Participants */}
                    <div className="border-b border-border pb-4">
                      <h3 className="font-semibold text-sm mb-3">{t("trips.timePlanParticipants")}</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="startDate">{t("trips.startDate")} *</Label>
                          <Input
                            id="startDate"
                            name="startDate"
                            type="date"
                            required
                            className="bg-background border-input"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="endDate">{t("trips.endDate")} *</Label>
                          <Input
                            id="endDate"
                            name="endDate"
                            type="date"
                            required
                            className="bg-background border-input"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div className="grid gap-2">
                          <Label htmlFor="participants">{t("trips.participants")} *</Label>
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
                          <Label htmlFor="status">{t("trips.status")}</Label>
                          <Select name="status" defaultValue="planned">
                            <SelectTrigger className="bg-background border-input">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="planned">{t("trips.statusPlanned")}</SelectItem>
                              <SelectItem value="ongoing">{t("trips.statusOngoing")}</SelectItem>
                              <SelectItem value="completed">{t("trips.statusCompleted")}</SelectItem>
                              <SelectItem value="cancelled">{t("trips.statusCancelled")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Additional Options */}
                    <div>
                      <h3 className="font-semibold text-sm mb-3">{t("trips.additionalOptions")}</h3>
                      <div className="grid gap-3">
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <input
                            type="checkbox"
                            id="isFavorite"
                            name="isFavorite"
                            className="w-4 h-4 rounded border-input cursor-pointer"
                          />
                          <Label htmlFor="isFavorite" className="cursor-pointer flex-1 mb-0">
                            <Flame className="w-4 h-4 inline mr-2 text-yellow-500" />
                            <span>{t("trips.markFavorite")}</span>
                          </Label>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <input
                            type="checkbox"
                            id="isPublic"
                            name="isPublic"
                            className="w-4 h-4 rounded border-input cursor-pointer"
                          />
                          <Label htmlFor="isPublic" className="cursor-pointer flex-1 mb-0">
                            <Share2 className="w-4 h-4 inline mr-2 text-blue-500" />
                            <span>{t("trips.sharePublic")}</span>
                          </Label>
                        </div>
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
                      {t("trips.cancel")}
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t("trips.creating")}
                        </>
                      ) : (
                        t("trips.create")
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
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="bg-card border-border overflow-hidden">
                {/* Image Skeleton */}
                <div className="h-32 bg-gradient-to-r from-muted via-muted-foreground/10 to-muted animate-pulse"></div>

                <CardHeader>
                  {/* Title Skeleton */}
                  <div className="space-y-3 mb-3">
                    <div className="h-5 bg-muted rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Meta Info Skeleton */}
                  <div className="space-y-3 mb-4">
                    <div className="h-4 bg-muted rounded w-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                    <div className="h-4 bg-muted rounded w-5/6 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="h-4 bg-muted rounded w-4/6 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                  </div>
                </CardContent>

                <CardFooter>
                  {/* Action Buttons Skeleton */}
                  <div className="flex gap-2 w-full">
                    <div className="h-9 bg-muted rounded flex-1 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    <div className="h-9 bg-muted rounded flex-1 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : trips && trips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips?.map((trip) => (
              <Card
                key={trip.id}
                className="bg-card border-2 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl group overflow-hidden"
              >
                {/* Optional: Trip Image Placeholder */}
                <div className="h-32 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
                    <Mountain className="w-16 h-16" />
                  </div>
                </div>

                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-card-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {trip.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 text-muted-foreground mt-1">
                        <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="line-clamp-1">{trip.destination}</span>
                      </CardDescription>
                    </div>
                    <Badge className={`${getStatusColor(trip.status)} flex-shrink-0`}>
                      {getStatusLabel(trip.status)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {trip.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {trip.description}
                    </p>
                  )}

                  {/* Trip Details Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-secondary flex-shrink-0" />
                      <span className="text-muted-foreground text-xs">
                        {formatDate(trip.startDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-accent flex-shrink-0" />
                      <span className="text-muted-foreground text-xs">
                        {trip.participants} <span className="hidden sm:inline">Pers.</span>
                      </span>
                    </div>
                  </div>

                  {/* Trip Duration */}
                  <div className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1.5">
                    <span className="font-medium">
                      {Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} {t("trips.days")}
                    </span>
                  </div>

                  {/* Trip Status Indicators */}
                  <div className="flex gap-2 flex-wrap">
                    {trip.isFavorite && (
                      <Badge variant="outline" className="text-xs">
                        <Flame className="w-3 h-3 mr-1" />
                        {t("trips.favorite")}
                      </Badge>
                    )}
                    {trip.isPublic && (
                      <Badge variant="outline" className="text-xs">
                        <Share2 className="w-3 h-3 mr-1" />
                        {t("trips.public")}
                      </Badge>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="gap-2">
                  <Link href={`/trips/${trip.id}`} className="flex-1">
                    <Button variant="default" size="sm" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      {t("trips.open")}
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (confirm(t("trips.confirmDelete"))) {
                        deleteMutation.mutate({ id: trip.id });
                      }
                    }}
                    title={t("trips.delete")}
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
                {t("trips.noTrips")}
              </p>
              <p className="text-muted-foreground mb-4">
                {t("trips.noTripsDesc")}
              </p>
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t("trips.createFirst")}
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
