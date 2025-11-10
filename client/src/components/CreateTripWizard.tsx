import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

  // Form data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    destination: "",
    region: "",
    category: "",
    cost: "free" as const,
    startDate: "",
    endDate: "",
    participants: "1",
  });

  const createTripMutation = trpc.trips.create.useMutation({
    onSuccess: (newTrip) => {
      toast.success(t("tripDetail.createSuccess") || "Trip created successfully!");
      onOpenChange(false);
      resetForm();
      // Navigate to the new trip
      navigate(`/trip/${newTrip.id}`);
    },
    onError: (error) => {
      toast.error(error.message || t("tripDetail.createError") || "Failed to create trip");
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      destination: "",
      region: "",
      category: "",
      cost: "free",
      startDate: "",
      endDate: "",
      participants: "1",
    });
    setStep(1);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = () => {
    // Validate current step
    if (step === 1) {
      if (!formData.title.trim() || !formData.destination.trim()) {
        toast.error("Bitte fülle alle erforderlichen Felder aus");
        return;
      }
    } else if (step === 2) {
      if (!formData.startDate || !formData.endDate) {
        toast.error("Bitte wähle Start- und Enddatum");
        return;
      }
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (start > end) {
        toast.error("Enddatum muss nach Startdatum liegen");
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
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);

      createTripMutation.mutate({
        title: formData.title,
        description: formData.description,
        destination: formData.destination,
        region: formData.region,
        category: formData.category,
        cost: formData.cost,
        startDate,
        endDate,
        participants: parseInt(formData.participants) || 1,
      });
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
            Schritt {step} von 3: Erstelle einen neuen Familienausflug
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Grundinformationen</CardTitle>
                  <CardDescription>Titel und Destination des Ausflugs</CardDescription>
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

          {/* Step 2: Dates and Participants */}
          {step === 2 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Daten und Teilnehmer</CardTitle>
                  <CardDescription>Wann und mit wie vielen Personen</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Startdatum *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange("startDate", e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="endDate">Enddatum *</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleInputChange("endDate", e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="participants">Anzahl Teilnehmer</Label>
                    <Input
                      id="participants"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.participants}
                      onChange={(e) => handleInputChange("participants", e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Category and Cost */}
          {step === 3 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Kategorie und Kosten</CardTitle>
                  <CardDescription>Art und Preis des Ausflugs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="category">Kategorie</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger id="category" className="mt-2">
                        <SelectValue placeholder="Wähle eine Kategorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                        <span className="text-muted-foreground">Datum:</span>
                        <span className="font-medium">{formData.startDate} bis {formData.endDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Kategorie:</span>
                        <span className="font-medium">{formData.category || "-"}</span>
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

            {step < 3 ? (
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
