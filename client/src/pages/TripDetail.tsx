import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Heart, Share2, Copy, Mail, Phone, MessageCircle, FileText, Loader2, MapPin, DollarSign, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { toast } from "sonner";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/contexts/i18nContext";
import { WeatherWidget } from "@/components/WeatherWidget";
import { PhotoGallery } from "@/components/PhotoGallery";

export default function TripDetail() {
  const { t } = useI18n();
  const params = useParams();
  const tripId = params.id ? parseInt(params.id) : 0;
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);
  const [shareDialog, setShareDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [mapDialog, setMapDialog] = useState(false);
  const [mapUrl, setMapUrl] = useState("");
  const [, navigate] = useLocation();
  const { user, loading: userLoading } = useAuth();

  const { data: trip, isLoading: tripLoading, refetch: refetchTrip } = trpc.trips.getById.useQuery({ id: tripId });
  const { data: photos = [], refetch: refetchPhotos } = trpc.photos.list.useQuery({ tripId }, { enabled: !!tripId });
  const updateTripMutation = trpc.trips.update.useMutation({
    onSuccess: () => {
      toast.success(t("tripDetail.updateSuccess"));
      setIsEditMode(false);
    },
    onError: (error) => {
      toast.error(error.message || t("tripDetail.updateError"));
    },
  });
  const deleteTripMutation = trpc.trips.delete.useMutation({
    onSuccess: () => {
      toast.success(t("tripDetail.deleteSuccess"));
      navigate("/explore");
    },
    onError: (error) => {
      toast.error(error.message || t("tripDetail.deleteError"));
    },
  });

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    destination: "",
    region: "",
    categories: [] as string[],
    cost: "free" as const,
    image: "",
    websiteUrl: "",
    ageRecommendationMin: "",
    ageRecommendationMax: "",
    routeType: "location" as const,
  });

  // Determine edit permissions
  // canEditTrip: Only trip owner or admin can edit/delete trip details
  const canEditTrip = user && trip && (user.id === trip.userId || user.role === "admin");
  // canUploadPhotos: Any authenticated user can upload photos (collaborative trips)
  const canUploadPhotos = !!user;

  // For backward compatibility
  const canEdit = canEditTrip;

  const COST_LABELS: Record<string, string> = {
    free: "Kostenlos",
    low: "CHF 🪙",
    medium: "CHF 🪙🪙",
    high: "CHF 🪙🪙🪙",
    very_high: "CHF 🪙🪙🪙🪙",
  };


  const handleEditOpen = () => {
    if (trip) {
      const ageRec = trip.ageRecommendation ? trip.ageRecommendation.split("-") : ["", ""];
      setEditForm({
        title: trip.title || "",
        description: trip.description || "",
        destination: trip.destination || "",
        region: trip.region || "",
        categories: trip.categories || [],
        cost: (trip.cost as "free" | "low" | "medium" | "high" | "very_high") || "free",
        image: trip.image || "",
        websiteUrl: trip.websiteUrl || "",
        ageRecommendationMin: ageRec[0] || "",
        ageRecommendationMax: ageRec[1] || "",
        routeType: (trip.routeType as "round_trip" | "one_way" | "location") || "location",
      });
      setIsEditMode(true);
    }
  };

  const handleEditCancel = () => {
    setIsEditMode(false);
    setEditForm({
      title: "",
      description: "",
      destination: "",
      region: "",
      categories: [],
      cost: "free" as const,
      image: "",
      websiteUrl: "",
      ageRecommendationMin: "",
      ageRecommendationMax: "",
      routeType: "location" as const,
    });
  };

  const handleEditSave = () => {
    if (!trip) return;

    // Combine age recommendation if both min and max are provided
    const ageRecommendation = editForm.ageRecommendationMin && editForm.ageRecommendationMax
      ? `${editForm.ageRecommendationMin}-${editForm.ageRecommendationMax}`
      : undefined;

    updateTripMutation.mutate({
      id: trip.id,
      title: editForm.title,
      description: editForm.description,
      destination: editForm.destination,
      region: editForm.region,
      categories: editForm.categories,
      cost: editForm.cost,
      image: editForm.image || undefined,
      websiteUrl: editForm.websiteUrl || undefined,
      ageRecommendation: ageRecommendation,
      routeType: editForm.routeType,
    });
    setIsEditMode(false);
  };

  const handleDeleteTrip = () => {
    if (!trip) return;
    if (confirm(t("tripDetail.confirmDelete"))) {
      deleteTripMutation.mutate({ id: trip.id });
    }
  };

  if (tripLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">{t("tripDetail.notFound")}</h1>
        <Link href="/explore">
          <Button>{t("tripDetail.backToOverview")}</Button>
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    try {
      // Add print class to body to enable print-specific styling
      document.body.classList.add('is-printing');

      // Wait for all images and resources to load before printing
      let imageCount = 0;
      let loadedImages = 0;

      const images = document.querySelectorAll('img');
      imageCount = images.length;

      if (imageCount === 0) {
        // No images, print immediately
        setTimeout(() => {
          window.print();
          document.body.classList.remove('is-printing');
        }, 500);
        return;
      }

      // Wait for all images to load
      images.forEach((img) => {
        if (img.complete) {
          loadedImages++;
        } else {
          img.addEventListener('load', () => {
            loadedImages++;
            if (loadedImages === imageCount) {
              setTimeout(() => {
                window.print();
                document.body.classList.remove('is-printing');
              }, 300);
            }
          }, { once: true });

          img.addEventListener('error', () => {
            loadedImages++;
            if (loadedImages === imageCount) {
              setTimeout(() => {
                window.print();
                document.body.classList.remove('is-printing');
              }, 300);
            }
          }, { once: true });
        }
      });

      // Fallback timeout in case images don't load
      setTimeout(() => {
        if (loadedImages < imageCount) {
          window.print();
          document.body.classList.remove('is-printing');
        }
      }, 3000);
    } catch (error) {
      console.error('Print error:', error);
      document.body.classList.remove('is-printing');
    }
  };

  const handleLocationClick = (destination: string) => {
    if (!destination) return;
    setMapDialog(true);
    setMapUrl(destination);
  };

  const handleMapSelection = (mapType: 'google' | 'apple') => {
    const encodedLocation = encodeURIComponent(mapUrl);
    const url = mapType === 'google'
      ? `https://www.google.com/maps/search/${encodedLocation}`
      : `https://maps.apple.com/?q=${encodedLocation}`;
    window.open(url, '_blank');
    setMapDialog(false);
  };

  // Get the primary photo for the hero section
  const primaryPhoto = photos.find((p) => p.isPrimary === 1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/explore">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {t("tripDetail.back")}
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative w-full h-96 bg-gradient-to-b from-primary/20 to-background overflow-hidden">
        {primaryPhoto ? (
          <img
            src={primaryPhoto.photoUrl}
            alt={trip.title}
            className="w-full h-full object-cover"
          />
        ) : trip.image ? (
          <img
            src={trip.image}
            alt={trip.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/20 flex items-center justify-center">
            <span className="text-muted-foreground text-lg">{t("tripDetail.noImage")}</span>
          </div>
        )}

        {/* Title Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
          <div className="w-full p-8">
            {isEditMode ? (
              <>
                <Input
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder={t("tripDetail.titlePlaceholder")}
                  className="text-4xl font-bold text-white mb-2 bg-black/40 border-white/30 placeholder-white/50"
                />
              </>
            ) : (
              <>
                <h1 className="text-4xl font-bold text-white mb-2">{trip.title}</h1>
                <div
                  className="flex items-center gap-2 text-white/90 cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleLocationClick(trip.destination)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleLocationClick(trip.destination);
                    }
                  }}
                >
                  <MapPin className="w-5 h-5" />
                  <span>{trip.destination}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-card border-b sticky top-16 z-10">
        <div className="container mx-auto px-4 py-4 flex gap-2 flex-wrap">
          <Button
            variant={isFavorite ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setIsFavorite(!isFavorite);
              setIsHeartAnimating(true);
              setTimeout(() => setIsHeartAnimating(false), 600);
            }}
            className="gap-2"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""} ${isHeartAnimating ? "animate-heart-beat" : ""}`} />
            {t("tripDetail.favorite")}
          </Button>
          <Button
            variant={trip?.isDone ? "default" : "outline"}
            size="sm"
            onClick={() => {
              if (canEdit && trip) {
                updateTripMutation.mutate({
                  id: trip.id,
                  isDone: trip.isDone ? 0 : 1,
                });
              }
            }}
            disabled={updateTripMutation.isPending || !canEdit}
            className="gap-2"
          >
            ✓ {trip?.isDone ? "Erledigt" : "Als erledigt markieren"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShareDialog(true)}
            className="gap-2"
          >
            <Share2 className="w-4 h-4" />
            {t("tripDetail.share")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-2"
          >
            <FileText className="w-4 h-4" />
            {t("tripDetail.print")}
          </Button>
          {canEdit && (
            <>
              {isEditMode ? (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleEditSave}
                    disabled={updateTripMutation.isPending}
                    className="gap-2"
                  >
                    {updateTripMutation.isPending ? t("tripDetail.saving") : t("tripDetail.save")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditCancel}
                    className="gap-2"
                  >
                    {t("tripDetail.cancel")}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditOpen}
                    className="gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    {t("tripDetail.edit")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteTrip}
                    className="gap-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t("tripDetail.delete")}
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-bold">{t("tripDetail.description")}</h2>
              </CardHeader>
              <CardContent>
                {isEditMode ? (
                  <Textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder={t("tripDetail.descriptionPlaceholder")}
                    rows={4}
                  />
                ) : (
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {trip.description}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Weather Widget */}
            {trip.latitude && trip.longitude && (
              <WeatherWidget latitude={parseFloat(trip.latitude)} longitude={parseFloat(trip.longitude)} />
            )}

            {/* Photo Gallery */}
            <PhotoGallery
              tripId={trip.id}
              photos={photos}
              onRefresh={() => refetchPhotos()}
              canEdit={canUploadPhotos}
              isLoading={userLoading}
            />

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Information Card */}
            <Card>
              <CardHeader>
                <h3 className="font-bold text-lg">{t("tripDetail.info")}</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditMode ? (
                  <>
                    {/* Editable Title */}
                    <div>
                      <label className="block text-sm font-medium mb-2">{t("tripDetail.titleLabel")}</label>
                      <Input
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        placeholder={t("tripDetail.titlePlaceholder")}
                      />
                    </div>

                    {/* Editable Destination */}
                    <div>
                      <label className="block text-sm font-medium mb-2">{t("tripDetail.destination")}</label>
                      <Input
                        value={editForm.destination}
                        onChange={(e) => setEditForm({ ...editForm, destination: e.target.value })}
                        placeholder={t("tripDetail.destinationPlaceholder")}
                      />
                    </div>

                    {/* Editable Cost */}
                    <div>
                      <label className="block text-sm font-medium mb-2">{t("tripDetail.cost")}</label>
                      <Select value={editForm.cost} onValueChange={(value: any) => setEditForm({ ...editForm, cost: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Kostenlos</SelectItem>
                          <SelectItem value="low">CHF •</SelectItem>
                          <SelectItem value="medium">CHF ••</SelectItem>
                          <SelectItem value="high">CHF •••</SelectItem>
                          <SelectItem value="very_high">CHF ••••</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Editable Categories (Multiple Selection) */}
                    <div>
                      <label className="block text-sm font-medium mb-2">{t("tripDetail.category")} (Mehrfachauswahl)</label>
                      <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                        {["Aktion & Sport", "Badewelt", "Freizeitpark", "Innenspielplatz", "Kultur", "Pumptrack", "Restaurant", "Schnitzeljagd", "Spielplatz", "Tierpark/Zoo", "Wanderweg", "Abenteuerweg", "Kugelbahn", "Museum"].map((cat) => (
                          <div key={cat} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`cat-edit-${cat}`}
                              checked={editForm.categories.includes(cat)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setEditForm((prev) => ({
                                    ...prev,
                                    categories: [...prev.categories, cat],
                                  }));
                                } else {
                                  setEditForm((prev) => ({
                                    ...prev,
                                    categories: prev.categories.filter((c) => c !== cat),
                                  }));
                                }
                              }}
                              className="rounded"
                            />
                            <label htmlFor={`cat-edit-${cat}`} className="text-sm cursor-pointer">
                              {cat}
                            </label>
                          </div>
                        ))}
                      </div>
                      {editForm.categories.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {editForm.categories.map((cat) => (
                            <div
                              key={cat}
                              className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs flex items-center gap-1"
                            >
                              {cat}
                              <button
                                onClick={() => {
                                  setEditForm((prev) => ({
                                    ...prev,
                                    categories: prev.categories.filter((c) => c !== cat),
                                  }));
                                }}
                                className="font-bold hover:opacity-75"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Editable Region */}
                    <div>
                      <label className="block text-sm font-medium mb-2">{t("tripDetail.region")}</label>
                      <Select value={editForm.region} onValueChange={(value) => setEditForm({ ...editForm, region: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("tripDetail.regionPlaceholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          {["Aargau", "Appenzell Ausserrhoden", "Appenzell Innerrhoden", "Basel-Landschaft", "Basel-Stadt", "Bern", "Fribourg", "Genève", "Glarus", "Graubünden", "Jura", "Luzern", "Neuchâtel", "Nidwalden", "Obwalden", "Schaffhausen", "Schwyz", "Solothurn", "St. Gallen", "Tessin", "Thurgau", "Uri", "Valais", "Vaud", "Zug", "Zürich", "Deutschland", "Österreich", "Frankreich", "Italien"].map((reg) => (
                            <SelectItem key={reg} value={reg}>
                              {reg}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Editable Route Type (only for Wanderweg/Abenteuerweg) */}
                    {(editForm.category === "Wanderweg" || editForm.category === "Abenteuerweg") && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Routentyp</label>
                        <Select
                          value={editForm.routeType}
                          onValueChange={(value: any) => setEditForm({ ...editForm, routeType: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Wähle Routentyp" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="location">Standort</SelectItem>
                            <SelectItem value="round_trip">Rundtour</SelectItem>
                            <SelectItem value="one_way">Von-zu</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Editable Website URL */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Website URL</label>
                      <Input
                        placeholder="https://example.com"
                        type="url"
                        value={editForm.websiteUrl}
                        onChange={(e) => setEditForm({ ...editForm, websiteUrl: e.target.value })}
                      />
                    </div>

                    {/* Editable Age Recommendation */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Altersempfehlung</label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Alter von"
                          type="number"
                          min="0"
                          max="100"
                          value={editForm.ageRecommendationMin}
                          onChange={(e) => setEditForm({ ...editForm, ageRecommendationMin: e.target.value })}
                        />
                        <Input
                          placeholder="Alter bis"
                          type="number"
                          min="0"
                          max="100"
                          value={editForm.ageRecommendationMax}
                          onChange={(e) => setEditForm({ ...editForm, ageRecommendationMax: e.target.value })}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Cost */}
                    <div className="flex items-center justify-between pb-4 border-b">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="w-5 h-5" />
                        <span className="text-sm">{t("tripDetail.cost")}</span>
                      </div>
                      <Badge variant="default" className="bg-primary">
                        {COST_LABELS[trip.cost] || t("tripDetail.costNA")}
                      </Badge>
                    </div>

                    {/* Categories */}
                    {trip.categories && trip.categories.length > 0 && (
                      <div className="pb-4 border-b">
                        <div className="text-sm text-muted-foreground mb-2">{t("tripDetail.category")}</div>
                        <div className="flex flex-wrap gap-1">
                          {trip.categories.map((cat) => (
                            <Badge key={cat} variant="secondary">{cat}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Region */}
                    {trip.region && (
                      <div className="pb-4 border-b">
                        <div className="text-sm text-muted-foreground mb-1">{t("tripDetail.region")}</div>
                        <div className="font-medium">{trip.region}</div>
                      </div>
                    )}

                    {/* Destination */}
                    {trip.destination && (
                      <div className="pb-4 border-b">
                        <div className="text-sm text-muted-foreground mb-1">{t("tripDetail.destination")}</div>
                        <div
                          className="font-medium cursor-pointer hover:text-primary transition-colors"
                          onClick={() => handleLocationClick(trip.destination)}
                          role="button"
                          tabIndex={0}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              handleLocationClick(trip.destination);
                            }
                          }}
                        >
                          {trip.destination}
                        </div>
                      </div>
                    )}

                    {/* Website URL */}
                    {trip.websiteUrl && (
                      <div className="pb-4 border-b">
                        <div className="text-sm text-muted-foreground mb-1">Website</div>
                        <a href={trip.websiteUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                          {trip.websiteUrl}
                        </a>
                      </div>
                    )}

                    {/* Age Recommendation */}
                    {trip.ageRecommendation && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Altersempfehlung</div>
                        <div className="font-medium">{trip.ageRecommendation} Jahre</div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card>
              <CardHeader>
                <h3 className="font-bold text-lg">{t("tripDetail.contact")}</h3>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    const subject = `${t("tripDetail.requestFor")}: ${trip?.title}`;
                    const body = `${t("tripDetail.requestBody1")}${trip?.title}":\n\n`;
                    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                  }}
                >
                  <Mail className="w-4 h-4" />
                  {t("tripDetail.email")}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    const text = `${t("tripDetail.interestedIn")}: ${trip?.title}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                >
                  <MessageCircle className="w-4 h-4" />
                  {t("tripDetail.whatsapp")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={shareDialog} onOpenChange={setShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("tripDetail.shareTrip")}</DialogTitle>
            <DialogDescription>
              {t("tripDetail.shareTripDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => {
                const url = window.location.href;
                const text = `${t("tripDetail.checkOutTrip")}: ${trip?.title}`;
                window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
              }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              {t("tripDetail.whatsapp")}
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => {
                const url = window.location.href;
                const subject = `${t("tripDetail.tripLabel")}: ${trip?.title}`;
                const body = `${t("tripDetail.emailBody1")}\n\n${t("tripDetail.emailBody2")}:\n\n${trip?.title}\n${trip?.description}\n\n${url}`;
                window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
              }}
            >
              <Mail className="w-5 h-5" />
              {t("tripDetail.email")}
            </Button>
            <div className="flex gap-2">
              <Input
                value={window.location.href}
                readOnly
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success(t("tripDetail.linkCopied"));
                }}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>


      {/* Map Selection Dialog */}
      <Dialog open={mapDialog} onOpenChange={setMapDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Standort öffnen</DialogTitle>
            <DialogDescription>
              Wähle eine Karten-App für den Standort: {mapUrl}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setMapDialog(false)}
            >
              Abbrechen
            </Button>
            <Button
              onClick={() => handleMapSelection('google')}
              className="gap-2"
            >
              <MapPin className="w-4 h-4" />
              Google Maps
            </Button>
            <Button
              onClick={() => handleMapSelection('apple')}
              className="gap-2"
            >
              <MapPin className="w-4 h-4" />
              Apple Maps
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
