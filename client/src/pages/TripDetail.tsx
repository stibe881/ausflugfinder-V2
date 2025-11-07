import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Heart, Share2, Copy, Mail, Phone, MessageCircle, FileText, Loader2, MapPin, Euro, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { toast } from "sonner";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function TripDetail() {
  const params = useParams();
  const tripId = params.id ? parseInt(params.id) : 0;
  const [isFavorite, setIsFavorite] = useState(false);
  const [shareDialog, setShareDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const { data: trip, isLoading: tripLoading } = trpc.trips.getById.useQuery({ id: tripId });
  const updateTripMutation = trpc.trips.update.useMutation({
    onSuccess: () => {
      toast.success("Ausflug aktualisiert!");
      setEditDialog(false);
    },
    onError: (error) => {
      toast.error(error.message || "Fehler beim Aktualisieren des Ausflugs");
    },
  });
  const deleteTripMutation = trpc.trips.delete.useMutation({
    onSuccess: () => {
      toast.success("Ausflug gelöscht!");
      navigate("/explore");
    },
    onError: (error) => {
      toast.error(error.message || "Fehler beim Löschen des Ausflugs");
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
    free: "Kostenlos",
    low: "€",
    medium: "€€",
    high: "€€€",
    very_high: "€€€€",
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
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
        cost: (trip.cost || "free") as const,
        image: trip.image || "",
      });
      setImagePreview(trip.image || "");
      setEditDialog(true);
    }
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
  };

  const handleDeleteTrip = () => {
    if (!trip) return;
    if (confirm("Möchten Sie diesen Ausflug wirklich löschen? Dies kann nicht rückgängig gemacht werden.")) {
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
        <h1 className="text-2xl font-bold mb-4">Ausflug nicht gefunden</h1>
        <Link href="/explore">
          <Button>Zurück zur Übersicht</Button>
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/explore">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Zurück
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative w-full h-96 bg-gradient-to-b from-primary/20 to-background overflow-hidden">
        {trip.image ? (
          <img
            src={trip.image}
            alt={trip.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/20 flex items-center justify-center">
            <span className="text-muted-foreground text-lg">Kein Bild vorhanden</span>
          </div>
        )}

        {/* Title Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
          <div className="w-full p-8">
            <h1 className="text-4xl font-bold text-white mb-2">{trip.title}</h1>
            <div className="flex items-center gap-2 text-white/90">
              <MapPin className="w-5 h-5" />
              <span>{trip.destination}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-card border-b sticky top-16 z-10">
        <div className="container mx-auto px-4 py-4 flex gap-2 flex-wrap">
          <Button
            variant={isFavorite ? "default" : "outline"}
            size="sm"
            onClick={() => setIsFavorite(!isFavorite)}
            className="gap-2"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
            Favorit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShareDialog(true)}
            className="gap-2"
          >
            <Share2 className="w-4 h-4" />
            Teilen
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-2"
          >
            <FileText className="w-4 h-4" />
            Drucken
          </Button>
          {canEdit && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditOpen}
                className="gap-2"
              >
                <Edit className="w-4 h-4" />
                Bearbeiten
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteTrip}
                className="gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
                Löschen
              </Button>
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
                <h2 className="text-2xl font-bold">Beschreibung</h2>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {trip.description}
                </p>
              </CardContent>
            </Card>

            {/* Nice to Know Section */}
            {trip.category || trip.region ? (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-bold">Wissenswert</h2>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {trip.category && (
                      <Badge variant="secondary">{trip.category}</Badge>
                    )}
                    {trip.region && (
                      <Badge variant="outline">{trip.region}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Information Card */}
            <Card>
              <CardHeader>
                <h3 className="font-bold text-lg">Informationen</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cost */}
                <div className="flex items-center justify-between pb-4 border-b">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Euro className="w-5 h-5" />
                    <span className="text-sm">Kosten</span>
                  </div>
                  <Badge variant="default" className="bg-primary">
                    {COST_LABELS[trip.cost] || "K.A."}
                  </Badge>
                </div>

                {/* Category */}
                {trip.category && (
                  <div className="pb-4 border-b">
                    <div className="text-sm text-muted-foreground mb-1">Kategorie</div>
                    <div className="font-medium">{trip.category}</div>
                  </div>
                )}

                {/* Region */}
                {trip.region && (
                  <div className="pb-4 border-b">
                    <div className="text-sm text-muted-foreground mb-1">Region</div>
                    <div className="font-medium">{trip.region}</div>
                  </div>
                )}

                {/* Destination */}
                {trip.destination && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Zielort</div>
                    <div className="font-medium">{trip.destination}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card>
              <CardHeader>
                <h3 className="font-bold text-lg">Kontakt</h3>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    const subject = `Anfrage zu: ${trip?.title}`;
                    const body = `Hallo,\n\nIch habe eine Anfrage zum Ausflug "${trip?.title}":\n\n`;
                    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                  }}
                >
                  <Mail className="w-4 h-4" />
                  E-Mail
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    const text = `Ich interessiere mich für: ${trip?.title}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
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
            <DialogTitle>Ausflug teilen</DialogTitle>
            <DialogDescription>
              Teile diesen Ausflug mit Freunden und Familie
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => {
                const url = window.location.href;
                const text = `Schau dir diesen Ausflug an: ${trip?.title}`;
                window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
              }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              WhatsApp
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => {
                const url = window.location.href;
                const subject = `Ausflug: ${trip?.title}`;
                const body = `Hallo,\n\nschau dir diesen Ausflug an:\n\n${trip?.title}\n${trip?.description}\n\n${url}`;
                window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
              }}
            >
              <Mail className="w-5 h-5" />
              E-Mail
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
                  toast.success("Link kopiert!");
                }}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ausflug bearbeiten</DialogTitle>
            <DialogDescription>
              Aktualisiere die Details dieses Ausflugs
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Titel</label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="Ausflugstitel"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Zielort</label>
              <Input
                value={editForm.destination}
                onChange={(e) => setEditForm({ ...editForm, destination: e.target.value })}
                placeholder="Zielort"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Region</label>
                <Input
                  value={editForm.region}
                  onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                  placeholder="Region"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Kategorie</label>
                <Input
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  placeholder="Kategorie"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kosten</label>
              <Select value={editForm.cost} onValueChange={(value: any) => setEditForm({ ...editForm, cost: value })}>
                <SelectTrigger>
                  <SelectValue />
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
            <div>
              <label className="block text-sm font-medium mb-1">Beschreibung</label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Beschreibung des Ausflugs"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Titelbild hochladen</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Unterstützte Formate: JPG, PNG, WebP (max. ~5 MB empfohlen)
              </p>
              {imagePreview && (
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-2">Vorschau:</p>
                  <img
                    src={imagePreview}
                    alt="Titelbild Vorschau"
                    className="w-full h-32 object-cover rounded-md border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>
              Abbrechen
            </Button>
            <Button
              onClick={handleEditSave}
              disabled={updateTripMutation.isPending}
            >
              {updateTripMutation.isPending ? "Speichern..." : "Speichern"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
