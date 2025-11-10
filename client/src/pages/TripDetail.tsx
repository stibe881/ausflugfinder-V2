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
    category: "",
    cost: "free" as const,
    image: "",
  });
  const [imagePreview, setImagePreview] = useState<string>("");

  const canEdit = user && trip && (user.id === trip.userId || user.role === "admin");

  const COST_LABELS: Record<string, string> = {
    free: t("tripDetail.costFree"),
    low: "CHF 🪙",
    medium: "CHF 🪙🪙",
    high: "CHF 🪙🪙🪙",
    very_high: "CHF 🪙🪙🪙🪙",
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = (event.target?.result as string).replace(/\s+/g, '');
        setEditForm({ ...editForm, image: base64 });
        setImagePreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditOpen = () => {
    if (trip) {
      setEditForm({
        title: trip.title || "",
        description: trip.description || "",
        destination: trip.destination || "",
        region: trip.region || "",
        category: trip.category || "",
        cost: (trip.cost as "free" | "low" | "medium" | "high" | "very_high") || "free",
        image: trip.image || "",
      });
      setImagePreview(trip.image || "");
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
      category: "",
      cost: "free" as const,
      image: "",
    });
    setImagePreview("");
  };

  const handleEditSave = () => {
    if (!trip) return;
    updateTripMutation.mutate({
      id: trip.id,
      title: editForm.title,
      description: editForm.description,
      destination: editForm.destination,
      region: editForm.region,
      category: editForm.category,
      cost: editForm.cost,
      image: editForm.image || undefined,
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
              canEdit={canEdit}
              isLoading={userLoading}
            />

            {/* Nice to Know Section */}
            {trip.category || trip.region || isEditMode ? (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-bold">{t("tripDetail.niceToKnow")}</h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditMode ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-2">{t("tripDetail.category")}</label>
                        <Input
                          value={editForm.category}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                          placeholder={t("tripDetail.categoryPlaceholder")}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">{t("tripDetail.region")}</label>
                        <Input
                          value={editForm.region}
                          onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                          placeholder={t("tripDetail.regionPlaceholder")}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {trip.category && (
                        <Badge variant="secondary">{trip.category}</Badge>
                      )}
                      {trip.region && (
                        <Badge variant="outline">{trip.region}</Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : null}
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
                    {/* Editable Cost */}
                    <div>
                      <label className="block text-sm font-medium mb-2">{t("tripDetail.cost")}</label>
                      <Select value={editForm.cost} onValueChange={(value: any) => setEditForm({ ...editForm, cost: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">{t("tripDetail.costFree")}</SelectItem>
                          <SelectItem value="low">CHF •</SelectItem>
                          <SelectItem value="medium">CHF ••</SelectItem>
                          <SelectItem value="high">CHF •••</SelectItem>
                          <SelectItem value="very_high">CHF ••••</SelectItem>
                        </SelectContent>
                      </Select>
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

                    {/* Category */}
                    {trip.category && (
                      <div className="pb-4 border-b">
                        <div className="text-sm text-muted-foreground mb-1">{t("tripDetail.category")}</div>
                        <div className="font-medium">{trip.category}</div>
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
                      <div>
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

      {/* Inline Edit Form - shown when isEditMode is true */}
      {isEditMode && (
        <div className="bg-card border-b">
          <div className="container mx-auto px-4 py-6 max-w-2xl">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t("tripDetail.uploadImage")}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t("tripDetail.imageFormats")}
                </p>
                {imagePreview && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-2">{t("tripDetail.preview")}:</p>
                    <img
                      src={imagePreview}
                      alt={t("tripDetail.imagePreview")}
                      className="w-full h-32 object-cover rounded-md border"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
