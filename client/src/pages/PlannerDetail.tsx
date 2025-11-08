import { useAuth } from "@/_core/hooks/useAuth";
import { useI18n } from "@/contexts/i18nContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Plus, Trash2, Check, X, Clock, Loader2, Package, DollarSign, ListChecks, Calendar, MapPin, Cloud, Download, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import WeatherForecast from "@/components/WeatherForecast";
import RouteMap from "@/components/RouteMap";

const BUDGET_CATEGORIES = [
  "Transport",
  "Verpflegung",
  "Unterkunft",
  "Eintritte",
  "Aktivitäten",
  "Einkaufen",
  "Versicherung",
  "Sonstiges",
];

const PACKING_CATEGORIES = [
  "Kleidung",
  "Schuhe",
  "Elektronik",
  "Toilettenartikel",
  "Ausrüstung",
  "Dokumente",
  "Sonstiges",
];

export default function PlannerDetail() {
  const { t } = useI18n();
  const params = useParams();
  const planId = params.id ? parseInt(params.id) : 0;
  const { user } = useAuth();
  
  const [addTripDialog, setAddTripDialog] = useState(false);
  const [addTripMode, setAddTripMode] = useState<"select" | "custom">("select");
  const [packingDialog, setPackingDialog] = useState(false);
  const [budgetDialog, setBudgetDialog] = useState(false);
  const [editBudgetId, setEditBudgetId] = useState<number | null>(null);
  const [editBudgetActualCost, setEditBudgetActualCost] = useState("");
  const [editPackingId, setEditPackingId] = useState<number | null>(null);
  const [checklistDialog, setChecklistDialog] = useState(false);

  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [customTripTitle, setCustomTripTitle] = useState("");
  const [customTripLocation, setCustomTripLocation] = useState("");
  const [tripTime, setTripTime] = useState({ start: "", end: "" });
  const [tripNotes, setTripNotes] = useState("");
  const [tripAssignedDate, setTripAssignedDate] = useState("");
  
  const [packingItem, setPackingItem] = useState({ item: "", quantity: 1, category: "" });
  const [budgetItem, setBudgetItem] = useState({ category: "", description: "", estimatedCost: "", actualCost: "" });
  const [checklistItem, setChecklistItem] = useState({ title: "", priority: "medium" as "low" | "medium" | "high" });

  const { data: plan, isLoading: planLoading } = trpc.dayPlans.getById.useQuery({ id: planId });
  const { data: planItems, refetch: refetchItems } = trpc.dayPlans.getItems.useQuery({ dayPlanId: planId });
  const { data: allTrips } = trpc.trips.search.useQuery({ keyword: "", category: "", region: "", cost: "" });
  const { data: packingList, refetch: refetchPacking } = trpc.packingList.list.useQuery({ dayPlanId: planId });
  const { data: budget, refetch: refetchBudget } = trpc.budget.list.useQuery({ dayPlanId: planId });
  const { data: checklist, refetch: refetchChecklist } = trpc.checklist.list.useQuery({ dayPlanId: planId });

  const addTripMutation = trpc.dayPlans.addTrip.useMutation({
    onSuccess: () => {
      toast.success(t("plannerDetail.tripAdded"));
      refetchItems();
      setAddTripDialog(false);
      setSelectedTripId(null);
      setTripTime({ start: "", end: "" });
      setTripNotes("");
      setTripAssignedDate("");
    },
  });

  const removeTripMutation = trpc.dayPlans.removeTrip.useMutation({
    onSuccess: () => {
      toast.success(t("plannerDetail.tripRemoved"));
      refetchItems();
    },
  });

  const addPackingMutation = trpc.packingList.add.useMutation({
    onSuccess: () => {
      toast.success(t("plannerDetail.itemAdded"));
      refetchPacking();
      setPackingDialog(false);
      setPackingItem({ item: "", quantity: 1, category: "" });
    },
  });

  const togglePackingMutation = trpc.packingList.toggle.useMutation({
    onSuccess: () => refetchPacking(),
  });

  const updatePackingMutation = trpc.packingList.update.useMutation({
    onSuccess: () => {
      toast.success(t("plannerDetail.itemUpdated"));
      refetchPacking();
      setEditPackingId(null);
      setPackingItem({ item: "", quantity: 1, category: "" });
    },
    onError: () => {
      toast.error(t("plannerDetail.itemUpdateError"));
    },
  });

  const deletePackingMutation = trpc.packingList.delete.useMutation({
    onSuccess: () => {
      toast.success(t("plannerDetail.itemRemoved"));
      refetchPacking();
    },
  });

  const addBudgetMutation = trpc.budget.add.useMutation({
    onSuccess: () => {
      toast.success("Budget-Eintrag hinzugefügt!");
      refetchBudget();
      setBudgetDialog(false);
      setBudgetItem({ category: "", description: "", estimatedCost: "", actualCost: "" });
    },
  });

  const deleteBudgetMutation = trpc.budget.delete.useMutation({
    onSuccess: () => {
      toast.success("Budget-Eintrag gelöscht!");
      refetchBudget();
    },
  });

  const updateBudgetMutation = trpc.budget.updateActual.useMutation({
    onSuccess: () => {
      toast.success("Kosten aktualisiert!");
      refetchBudget();
      setEditBudgetId(null);
      setEditBudgetActualCost("");
    },
    onError: () => {
      toast.error("Fehler beim Aktualisieren der Kosten");
    },
  });

  const addChecklistMutation = trpc.checklist.add.useMutation({
    onSuccess: () => {
      toast.success("Aufgabe hinzugefügt!");
      refetchChecklist();
      setChecklistDialog(false);
      setChecklistItem({ title: "", priority: "medium" });
    },
  });

  const toggleChecklistMutation = trpc.checklist.toggle.useMutation({
    onSuccess: () => refetchChecklist(),
  });

  const deleteChecklistMutation = trpc.checklist.delete.useMutation({
    onSuccess: () => {
      toast.success("Aufgabe gelöscht!");
      refetchChecklist();
    },
  });

  const updatePlanMutation = trpc.dayPlans.update.useMutation({
    onSuccess: () => {
      toast.success("Planung aktualisiert!");
      window.location.reload();
    },
  });

  const deletePlanMutation = trpc.dayPlans.delete.useMutation({
    onSuccess: () => {
      toast.success("Planung gelöscht!");
      window.location.href = "/planner";
    },
    onError: () => {
      toast.error("Fehler beim Löschen der Planung");
    },
  });

  const handleToggleDraft = (isDraft: number) => {
    updatePlanMutation.mutate({
      id: planId,
      isDraft,
    });
  };

  const handleDeleteDraft = () => {
    if (confirm("Möchten Sie diese Planung wirklich löschen? Dies kann nicht rückgängig gemacht werden.")) {
      deletePlanMutation.mutate({ id: planId });
    }
  };

  const handleAddTrip = () => {
    if (addTripMode === "select") {
      if (!selectedTripId) {
        toast.error("Bitte wähle einen Ausflug aus");
        return;
      }

      if (!tripAssignedDate) {
        toast.error("Bitte gib ein Datum für die Wettervorhersage an");
        return;
      }

      const orderIndex = (planItems?.length || 0) + 1;
      addTripMutation.mutate({
        dayPlanId: planId,
        tripId: selectedTripId,
        orderIndex,
        startTime: tripTime.start || undefined,
        endTime: tripTime.end || undefined,
        notes: tripNotes || undefined,
        dateAssigned: tripAssignedDate,
      });
    } else {
      // Custom trip mode - we'll display it as a note/reminder
      if (!customTripTitle.trim() || !customTripLocation.trim()) {
        toast.error("Bitte gib einen Titel und einen Ort an");
        return;
      }

      // For now, we'll add it as a checklist item to represent it
      // In a real app, you might want to create an actual trip in the database
      addChecklistMutation.mutate({
        dayPlanId: planId,
        title: `${customTripTitle} (${customTripLocation})${tripTime.start ? ` - ${tripTime.start}` : ''}`,
        priority: "high",
      });

      // Reset custom fields
      setCustomTripTitle("");
      setCustomTripLocation("");
      setTripTime({ start: "", end: "" });
      setTripNotes("");
      setTripAssignedDate("");
      setAddTripDialog(false);
      setAddTripMode("select");
    }
  };

  const handleAddPacking = () => {
    if (!packingItem.item.trim()) {
      toast.error("Bitte gib einen Artikel ein");
      return;
    }
    addPackingMutation.mutate({
      dayPlanId: planId,
      ...packingItem,
    });
  };

  const handleEditPacking = (id: number) => {
    const item = packingList?.find(p => p.id === id);
    if (item) {
      setEditPackingId(id);
      setPackingItem({ item: item.item, quantity: item.quantity || 1, category: item.category || "" });
    }
  };

  const handleSavePackingItem = () => {
    if (!packingItem.item.trim()) {
      toast.error("Bitte gib einen Artikel ein");
      return;
    }
    updatePackingMutation.mutate({
      id: editPackingId!,
      ...packingItem,
    });
  };

  const handleAddBudget = () => {
    if (!budgetItem.category.trim() || !budgetItem.description.trim() || !budgetItem.estimatedCost.trim()) {
      toast.error("Bitte fülle alle Pflichtfelder aus");
      return;
    }
    addBudgetMutation.mutate({
      dayPlanId: planId,
      ...budgetItem,
    });
  };

  const handleEditBudget = (budgetId: number) => {
    const item = budget?.find(b => b.id === budgetId);
    if (item) {
      setEditBudgetId(budgetId);
      setEditBudgetActualCost(item.actualCost || "");
    }
  };

  const handleSaveActualCost = () => {
    if (!editBudgetId || !editBudgetActualCost.trim()) {
      toast.error("Bitte gib die tatsächlichen Kosten ein");
      return;
    }
    updateBudgetMutation.mutate({
      id: editBudgetId,
      actualCost: editBudgetActualCost,
    });
  };

  const handleAddChecklist = () => {
    if (!checklistItem.title.trim()) {
      toast.error("Bitte gib einen Titel ein");
      return;
    }
    addChecklistMutation.mutate({
      dayPlanId: planId,
      ...checklistItem,
    });
  };

  const calculateTotalBudget = () => {
    if (!budget) return { estimated: 0, actual: 0, difference: 0 };
    const estimated = budget.reduce((sum, item) => sum + parseFloat(item.estimatedCost || "0"), 0);
    const actual = budget.reduce((sum, item) => sum + parseFloat(item.actualCost || "0"), 0);
    return { estimated, actual, difference: actual - estimated };
  };

  const [exportType, setExportType] = useState<'ical' | 'pdf' | null>(null);

  const { data: icalData, isLoading: icalLoading } = trpc.export.planToICal.useQuery(
    { planId },
    { enabled: exportType === 'ical' }
  );

  const { data: pdfData, isLoading: pdfLoading } = trpc.export.planToPDF.useQuery(
    { planId },
    { enabled: exportType === 'pdf' }
  );

  // Handle iCal export when data arrives
  useEffect(() => {
    if (icalData && exportType === 'ical' && !icalLoading) {
      const blob = new Blob([icalData.content], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${plan?.title || 'plan'}.ics`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("iCal-Datei heruntergeladen!");
      setExportType(null);
    }
  }, [icalData, icalLoading, exportType, plan]);

  // Handle PDF export when data arrives
  useEffect(() => {
    if (pdfData && exportType === 'pdf' && !pdfLoading) {
      try {
        // Decode base64 string to binary data
        const binaryString = atob(pdfData.content);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${plan?.title || 'plan'}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("PDF-Datei heruntergeladen!");
        setExportType(null);
      } catch (error) {
        toast.error("Fehler beim Herunterladen der PDF");
        console.error("PDF export error:", error);
        setExportType(null);
      }
    }
  }, [pdfData, pdfLoading, exportType, plan]);

  const handleExportICal = () => {
    setExportType('ical');
  };

  const handleExportPDF = () => {
    setExportType('pdf');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500/10 text-red-600";
      case "medium": return "bg-yellow-500/10 text-yellow-600";
      case "low": return "bg-blue-500/10 text-blue-600";
      default: return "bg-gray-500/10 text-gray-600";
    }
  };

  if (planLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Planung nicht gefunden</h1>
        <Link href="/planner">
          <Button>Zurück zur Übersicht</Button>
        </Link>
      </div>
    );
  }

  const totalBudget = calculateTotalBudget();
  const packedItems = packingList?.filter(item => item.isPacked).length || 0;
  const totalPackingItems = packingList?.length || 0;
  const completedTasks = checklist?.filter(item => item.isCompleted).length || 0;
  const totalTasks = checklist?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-12">
      <div className="container max-w-6xl">
        <Link href="/planner">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Zurück
          </Button>
        </Link>

        {/* Plan Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-3xl">{plan.title}</CardTitle>
                  {plan.isDraft === 1 && (
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-600">
                      Entwurf
                    </Badge>
                  )}
                  {plan.isDraft === 0 && (
                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-600">
                      Veröffentlicht
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-base">{plan.description}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportICal}
                >
                  <Download className="w-4 h-4 mr-2" />
                  iCal
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportPDF}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  PDF
                </Button>
                {plan.isDraft === 1 && (
                  <Button
                    size="sm"
                    onClick={() => handleToggleDraft(0)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Veröffentlichen
                  </Button>
                )}
                {plan.isDraft === 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleDraft(1)}
                  >
                    Zurück zu Entwurf
                  </Button>
                )}
                {plan.isDraft === 1 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteDraft}
                    disabled={deletePlanMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Löschen
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-xs">Zeitraum</div>
                  <div className="font-medium text-foreground">
                    {format(new Date(plan.startDate), "dd.MM.yyyy", { locale: de })} - {format(new Date(plan.endDate), "dd.MM.yyyy", { locale: de })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Package className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-xs">Packliste</div>
                  <div className="font-medium text-foreground">{packedItems} / {totalPackingItems}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <DollarSign className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-xs">Budget</div>
                  <div className="font-medium text-foreground">
                    CHF {totalBudget.estimated.toFixed(2)}
                    {totalBudget.actual > 0 && (
                      <span className={totalBudget.difference >= 0 ? "text-orange-600 ml-2" : "text-green-600 ml-2"}>
                        {totalBudget.difference >= 0 ? "+" : ""}{totalBudget.difference.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <ListChecks className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-xs">Aufgaben</div>
                  <div className="font-medium text-foreground">{completedTasks} / {totalTasks}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="timeline" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="route">Route</TabsTrigger>
            <TabsTrigger value="weather">Wetter</TabsTrigger>
            <TabsTrigger value="packing">Packliste</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="checklist">Checkliste</TabsTrigger>
          </TabsList>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Ausflüge & Zeitplan</CardTitle>
                  <Dialog open={addTripDialog} onOpenChange={(open) => {
                    setAddTripDialog(open);
                    if (!open) {
                      setAddTripMode("select");
                      setSelectedTripId(null);
                      setCustomTripTitle("");
                      setCustomTripLocation("");
                      setTripTime({ start: "", end: "" });
                      setTripNotes("");
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        Ausflug hinzufügen
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Ausflug zur Planung hinzufügen</DialogTitle>
                        <DialogDescription>
                          Wähle einen bestehenden Ausflug oder erstelle einen benutzerdefinierten
                        </DialogDescription>
                      </DialogHeader>

                      {/* Mode Tabs */}
                      <div className="flex gap-2 mb-4">
                        <Button
                          variant={addTripMode === "select" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setAddTripMode("select")}
                          className="flex-1"
                        >
                          Ausflug wählen
                        </Button>
                        <Button
                          variant={addTripMode === "custom" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setAddTripMode("custom")}
                          className="flex-1"
                        >
                          Neu erstellen
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {addTripMode === "select" ? (
                          <>
                            <div>
                              <Label>Ausflug</Label>
                              <Select value={selectedTripId?.toString()} onValueChange={(v) => setSelectedTripId(parseInt(v))}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Ausflug wählen..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {allTrips?.map((trip) => (
                                    <SelectItem key={trip.id} value={trip.id.toString()}>
                                      {trip.title} - {trip.destination}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <Label>Ausflug-Titel *</Label>
                              <Input
                                placeholder="z.B. Zoo Besuch"
                                value={customTripTitle}
                                onChange={(e) => setCustomTripTitle(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>Ort/Zielort *</Label>
                              <Input
                                placeholder="z.B. Zürich Zoo"
                                value={customTripLocation}
                                onChange={(e) => setCustomTripLocation(e.target.value)}
                              />
                            </div>
                          </>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Startzeit</Label>
                            <Input
                              type="time"
                              value={tripTime.start}
                              onChange={(e) => setTripTime({ ...tripTime, start: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Endzeit</Label>
                            <Input
                              type="time"
                              value={tripTime.end}
                              onChange={(e) => setTripTime({ ...tripTime, end: e.target.value })}
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Datum für Wettervorhersage *</Label>
                          <Input
                            type="date"
                            value={tripAssignedDate}
                            onChange={(e) => setTripAssignedDate(e.target.value)}
                            min={plan?.startDate ? format(new Date(plan.startDate), "yyyy-MM-dd") : undefined}
                            max={plan?.endDate ? format(new Date(plan.endDate), "yyyy-MM-dd") : undefined}
                          />
                          {plan?.startDate && plan?.endDate && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Verfügbar von {format(new Date(plan.startDate), "dd.MM.yyyy", { locale: de })} bis {format(new Date(plan.endDate), "dd.MM.yyyy", { locale: de })}
                            </p>
                          )}
                        </div>

                        {addTripMode === "select" && (
                          <div>
                            <Label>Notizen</Label>
                            <Textarea
                              value={tripNotes}
                              onChange={(e) => setTripNotes(e.target.value)}
                              placeholder="Optionale Notizen..."
                              rows={3}
                            />
                          </div>
                        )}
                      </div>

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setAddTripDialog(false)}>
                          Abbrechen
                        </Button>
                        <Button onClick={handleAddTrip} disabled={addTripMutation.isPending || addChecklistMutation.isPending}>
                          Hinzufügen
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {planItems && planItems.length > 0 ? (
                  <div className="space-y-4">
                    {planItems?.map((item: any, index: number) => (
                      <div key={item.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{item.trip?.title || "Unbekannter Ausflug"}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            {item.startTime && item.endTime && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {item.startTime} - {item.endTime}
                              </div>
                            )}
                            {item.trip?.destination && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {item.trip.destination}
                              </div>
                            )}
                          </div>
                          {item.notes && (
                            <p className="text-sm text-muted-foreground">{item.notes}</p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeTripMutation.mutate({ id: item.id })}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Noch keine Ausflüge hinzugefügt. Klicke auf "Ausflug hinzufügen" um zu starten.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Route Tab */}
          <TabsContent value="route" className="space-y-4">
            <RouteMap planItems={planItems || []} />
          </TabsContent>

          {/* Weather Tab */}
          <TabsContent value="weather" className="space-y-4">
            <WeatherForecast plan={plan} />
          </TabsContent>

          {/* Packing List Tab */}
          <TabsContent value="packing" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Packliste</CardTitle>
                  <Dialog open={packingDialog} onOpenChange={(open) => {
                    if (!open) {
                      setPackingDialog(false);
                      setEditPackingId(null);
                      setPackingItem({ item: "", quantity: 1, category: "" });
                    } else {
                      setPackingDialog(true);
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        Artikel hinzufügen
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editPackingId ? "Artikel bearbeiten" : "Artikel zur Packliste hinzufügen"}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Artikel</Label>
                          <Input
                            value={packingItem.item}
                            onChange={(e) => setPackingItem({ ...packingItem, item: e.target.value })}
                            placeholder="z.B. Wanderschuhe"
                          />
                        </div>
                        <div>
                          <Label>Anzahl</Label>
                          <Input
                            type="number"
                            min="1"
                            value={packingItem.quantity}
                            onChange={(e) => setPackingItem({ ...packingItem, quantity: parseInt(e.target.value) || 1 })}
                          />
                        </div>
                        <div>
                          <Label>Kategorie</Label>
                          <Select value={packingItem.category} onValueChange={(v) => setPackingItem({ ...packingItem, category: v })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Kategorie wählen..." />
                            </SelectTrigger>
                            <SelectContent>
                              {PACKING_CATEGORIES.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => {
                          setPackingDialog(false);
                          setEditPackingId(null);
                          setPackingItem({ item: "", quantity: 1, category: "" });
                        }}>
                          Abbrechen
                        </Button>
                        <Button onClick={editPackingId ? handleSavePackingItem : handleAddPacking} disabled={addPackingMutation.isPending || updatePackingMutation.isPending}>
                          {editPackingId ? "Speichern" : "Hinzufügen"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {packingList && packingList.length > 0 ? (
                  <div className="space-y-2">
                    {packingList?.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => togglePackingMutation.mutate({ id: item.id, isPacked: item.isPacked ? 0 : 1 })}
                          className="h-6 w-6 p-0"
                        >
                          {item.isPacked ? <Check className="w-4 h-4 text-green-600" /> : <div className="w-4 h-4 border-2 rounded" />}
                        </Button>
                        <div className="flex-1">
                          <span className={item.isPacked ? "line-through text-muted-foreground" : ""}>
                            {item.item} {item.quantity > 1 && `(${item.quantity}x)`}
                          </span>
                          {item.category && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              {item.category}
                            </Badge>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            handleEditPacking(item.id);
                            setPackingDialog(true);
                          }}
                          className="text-blue-600"
                        >
                          Bearbeiten
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deletePackingMutation.mutate({ id: item.id })}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Noch keine Artikel auf der Packliste
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Budget Tab */}
          <TabsContent value="budget" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Budget-Planung</CardTitle>
                    <CardDescription>
                      Geschätzt: CHF {totalBudget.estimated.toFixed(2)} | Tatsächlich: CHF {totalBudget.actual.toFixed(2)}
                      {totalBudget.actual > 0 && (
                        <span className={totalBudget.difference >= 0 ? " text-orange-600" : " text-green-600"}>
                          {" "}| Differenz: {totalBudget.difference >= 0 ? "+" : ""}{totalBudget.difference.toFixed(2)}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <Dialog open={budgetDialog} onOpenChange={setBudgetDialog}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        Eintrag hinzufügen
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Budget-Eintrag hinzufügen</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Kategorie</Label>
                          <Select value={budgetItem.category} onValueChange={(v) => setBudgetItem({ ...budgetItem, category: v })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Kategorie wählen..." />
                            </SelectTrigger>
                            <SelectContent>
                              {BUDGET_CATEGORIES.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Beschreibung</Label>
                          <Input
                            value={budgetItem.description}
                            onChange={(e) => setBudgetItem({ ...budgetItem, description: e.target.value })}
                            placeholder="z.B. Zugtickets nach Zürich"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Geschätzte Kosten (CHF)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={budgetItem.estimatedCost}
                              onChange={(e) => setBudgetItem({ ...budgetItem, estimatedCost: e.target.value })}
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <Label>Tatsächliche Kosten (CHF)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={budgetItem.actualCost}
                              onChange={(e) => setBudgetItem({ ...budgetItem, actualCost: e.target.value })}
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setBudgetDialog(false)}>
                          Abbrechen
                        </Button>
                        <Button onClick={handleAddBudget} disabled={addBudgetMutation.isPending}>
                          Hinzufügen
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {budget && budget.length > 0 ? (
                  <div className="space-y-3">
                    {budget?.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 rounded-lg border bg-card">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{item.category}</Badge>
                            <span className="font-medium">{item.description}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Geschätzt: CHF {parseFloat(item.estimatedCost).toFixed(2)}
                            {item.actualCost && (
                              <>
                                {` | Tatsächlich: CHF ${parseFloat(item.actualCost).toFixed(2)}`}
                                {(() => {
                                  const diff = parseFloat(item.actualCost) - parseFloat(item.estimatedCost);
                                  return (
                                    <span className={diff >= 0 ? " text-orange-600" : " text-green-600"}>
                                      {` | ${diff >= 0 ? "+" : ""}${diff.toFixed(2)}`}
                                    </span>
                                  );
                                })()}
                              </>
                            )}
                          </div>
                        </div>
                        <Dialog open={editBudgetId === item.id} onOpenChange={(open) => {
                          if (!open) {
                            setEditBudgetId(null);
                            setEditBudgetActualCost("");
                          }
                        }}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditBudget(item.id)}
                          >
                            Bearbeiten
                          </Button>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Tatsächliche Kosten eingeben</DialogTitle>
                              <DialogDescription>
                                {item.description} - Geschätzt: CHF {parseFloat(item.estimatedCost).toFixed(2)}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Tatsächliche Kosten (CHF)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={editBudgetActualCost}
                                  onChange={(e) => setEditBudgetActualCost(e.target.value)}
                                  placeholder="0.00"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => {
                                setEditBudgetId(null);
                                setEditBudgetActualCost("");
                              }}>
                                Abbrechen
                              </Button>
                              <Button onClick={handleSaveActualCost} disabled={updateBudgetMutation.isPending}>
                                Speichern
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteBudgetMutation.mutate({ id: item.id })}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Noch keine Budget-Einträge
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Checklist Tab */}
          <TabsContent value="checklist" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Aufgaben & Checkliste</CardTitle>
                  <Dialog open={checklistDialog} onOpenChange={setChecklistDialog}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        Aufgabe hinzufügen
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Aufgabe zur Checkliste hinzufügen</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Aufgabe</Label>
                          <Input
                            value={checklistItem.title}
                            onChange={(e) => setChecklistItem({ ...checklistItem, title: e.target.value })}
                            placeholder="z.B. Tickets buchen"
                          />
                        </div>
                        <div>
                          <Label>Priorität</Label>
                          <Select value={checklistItem.priority} onValueChange={(v: "low" | "medium" | "high") => setChecklistItem({ ...checklistItem, priority: v })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Niedrig</SelectItem>
                              <SelectItem value="medium">Mittel</SelectItem>
                              <SelectItem value="high">Hoch</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setChecklistDialog(false)}>
                          Abbrechen
                        </Button>
                        <Button onClick={handleAddChecklist} disabled={addChecklistMutation.isPending}>
                          Hinzufügen
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {checklist && checklist.length > 0 ? (
                  <div className="space-y-2">
                    {checklist?.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleChecklistMutation.mutate({ id: item.id, isCompleted: item.isCompleted ? 0 : 1 })}
                          className="h-6 w-6 p-0"
                        >
                          {item.isCompleted ? <Check className="w-4 h-4 text-green-600" /> : <div className="w-4 h-4 border-2 rounded" />}
                        </Button>
                        <div className="flex-1">
                          <span className={item.isCompleted ? "line-through text-muted-foreground" : ""}>
                            {item.title}
                          </span>
                          <Badge variant="outline" className={`ml-2 text-xs ${getPriorityColor(item.priority)}`}>
                            {item.priority === "high" && "Hoch"}
                            {item.priority === "medium" && "Mittel"}
                            {item.priority === "low" && "Niedrig"}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteChecklistMutation.mutate({ id: item.id })}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Noch keine Aufgaben auf der Checkliste
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
