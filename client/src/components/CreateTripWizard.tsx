import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useI18n } from "@/contexts/i18nContext";
import { useLocation } from "wouter";

interface CreateTripWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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
  "Deutschland",
  "Österreich",
  "Frankreich",
  "Italien",
];

const COST_OPTIONS = [
  { value: "free", label: "Kostenlos" },
  { value: "low", label: "CHF 🪙" },
  { value: "medium", label: "CHF 🪙🪙" },
  { value: "high", label: "CHF 🪙🪙🪙" },
  { value: "very_high", label: "CHF 🪙🪙🪙🪙" },
];

export function CreateTripWizard({ open, onOpenChange }: CreateTripWizardProps) {
  const { t } = useI18n();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Form data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    destination: "",
    region: "",
    categories: [] as string[],
    cost: "free" as const,
    websiteUrl: "",
    ageRecommendationMin: "",
    ageRecommendationMax: "",
    routeType: "location" as const,
  });

  const uploadTripImageMutation = trpc.upload.tripImage.useMutation();

  const createTripMutation = trpc.trips.create.useMutation({
    onSuccess: () => {
      toast.success(t("tripDetail.createSuccess") || "Ausflug erstellt!");
      onOpenChange(false);
      resetForm();
      // Navigate to my trips page
      navigate("/mytrips");
    },
    onError: (error) => {
      toast.error(error.message || t("tripDetail.createError") || "Fehler beim Erstellen");
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      destination: "",
      region: "",
      categories: [],
      cost: "free",
      websiteUrl: "",
      ageRecommendationMin: "",
      ageRecommendationMax: "",
      routeType: "location",
    });
    setImageFile(null);
    setImagePreview("");
    setStep(1);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    // Validate current step
    if (step === 1) {
      if (!formData.title.trim() || !formData.destination.trim()) {
        toast.error("Bitte fülle alle erforderlichen Felder aus");
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.destination.trim()) {
      toast.error("Bitte fülle alle erforderlichen Felder aus");
      return;
    }

    setLoading(true);
    try {
      let imageUrl = "";

      // Upload image if provided
      if (imageFile) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            resolve(event.target?.result as string);
          };
          reader.onerror = () => {
            reject(new Error("Fehler beim Lesen der Datei"));
          };
          reader.readAsDataURL(imageFile);
        });

        const uploadResult = await new Promise<{ url: string }>((resolve, reject) => {
          uploadTripImageMutation.mutate(
            { base64 },
            {
              onSuccess: (result) => resolve(result),
              onError: (error) => reject(error),
            }
          );
        });
        imageUrl = uploadResult.url;
      }

      // Create trip with or without image
      createTripMutation.mutate({
        title: formData.title,
        description: formData.description,
        destination: formData.destination,
        region: formData.region,
        categories: formData.categories,
        cost: formData.cost,
        image: imageUrl || undefined,
        startDate: new Date(),
        endDate: new Date(),
        participants: 1,
      });
    } catch (error) {
      console.error("Submit failed:", error);
      toast.error(error instanceof Error ? error.message : "Fehler beim Erstellen des Ausflugs");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neuen Ausflug erstellen</DialogTitle>
          <DialogDescription>
            Schritt {step} von 2: Erstelle einen neuen Familienausflug
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Grundinformationen</CardTitle>
                  <CardDescription>Titel, Destination und Beschreibung</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Titel *</Label>
                    <Input
                      id="title"
                      placeholder="z.B. Wanderung zum Säntis"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="destination">Destination *</Label>
                    <Input
                      id="destination"
                      placeholder="z.B. Appenzell"
                      value={formData.destination}
                      onChange={(e) => handleInputChange("destination", e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Beschreibung</Label>
                    <Textarea
                      id="description"
                      placeholder="Beschreibe deinen Ausflug..."
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      className="mt-2 min-h-32"
                    />
                  </div>

                  <div>
                    <Label htmlFor="region">Region</Label>
                    <Select value={formData.region} onValueChange={(value) => handleInputChange("region", value)}>
                      <SelectTrigger id="region" className="mt-2">
                        <SelectValue placeholder="Wähle eine Region" />
                      </SelectTrigger>
                      <SelectContent>
                        {REGIONS.map((reg) => (
                          <SelectItem key={reg} value={reg}>
                            {reg}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: Category, Cost and Image */}
          {step === 2 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Kategorie und Kosten</CardTitle>
                  <CardDescription>Wähle die Art und den Preis des Ausflugs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Kategorien (Mehrfachauswahl möglich)</Label>
                    <div className="mt-2 space-y-2 border rounded-md p-3 max-h-48 overflow-y-auto">
                      {CATEGORIES.map((cat) => (
                        <div key={cat} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`cat-${cat}`}
                            checked={formData.categories.includes(cat)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData((prev) => ({
                                  ...prev,
                                  categories: [...prev.categories, cat],
                                }));
                              } else {
                                setFormData((prev) => ({
                                  ...prev,
                                  categories: prev.categories.filter((c) => c !== cat),
                                }));
                              }
                            }}
                            className="rounded"
                          />
                          <label htmlFor={`cat-${cat}`} className="text-sm cursor-pointer">
                            {cat}
                          </label>
                        </div>
                      ))}
                    </div>
                    {formData.categories.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {formData.categories.map((cat) => (
                          <div
                            key={cat}
                            className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs flex items-center gap-1"
                          >
                            {cat}
                            <button
                              onClick={() => {
                                setFormData((prev) => ({
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

                  <div>
                    <Label htmlFor="cost">Kosten</Label>
                    <Select value={formData.cost} onValueChange={(value: any) => handleInputChange("cost", value)}>
                      <SelectTrigger id="cost" className="mt-2">
                        <SelectValue placeholder="Wähle Kostenkategorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {COST_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Titelbild (optional)</CardTitle>
                  <CardDescription>Lade ein Bild für deinen Ausflug hoch</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {imagePreview && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-border">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="image">Bild hochladen</Label>
                    <div className="mt-2 flex items-center justify-center px-6 py-10 border-2 border-dashed border-border rounded-lg hover:border-primary/50 transition cursor-pointer">
                      <div className="text-center">
                        <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          <label
                            htmlFor="image"
                            className="font-semibold text-primary hover:text-primary/80 cursor-pointer"
                          >
                            Klick zum Hochladen
                          </label>
                          {" "}oder ziehe ein Bild herein
                        </p>
                        <p className="text-xs text-muted-foreground">PNG, JPG, GIF bis 10MB</p>
                      </div>
                      <input
                        id="image"
                        name="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-3">Zusammenfassung</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Titel:</span>
                        <span className="font-medium">{formData.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Destination:</span>
                        <span className="font-medium">{formData.destination}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Kategorien:</span>
                        <span className="font-medium">{formData.categories.length > 0 ? formData.categories.join(", ") : "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Kosten:</span>
                        <span className="font-medium">
                          {COST_OPTIONS.find(opt => opt.value === formData.cost)?.label}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Titelbild:</span>
                        <span className="font-medium">{imageFile ? "✓ Vorhanden" : "-"}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-4 pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1 || loading}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>

            {step < 2 ? (
              <Button
                onClick={handleNext}
                disabled={loading}
              >
                Weiter
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Wird erstellt..." : "Ausflug erstellen"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
