import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/contexts/i18nContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Trash2, Clock, MapPin, ArrowLeft, Save, GripVertical } from "lucide-react";
import { Link } from "wouter";
import { APP_TITLE, getLoginUrl } from "@/const";
import { toast } from "sonner";

export default function Planner() {
  const { t } = useI18n();
  const { user, loading, isAuthenticated } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPlanTitle, setNewPlanTitle] = useState("");
  const [newPlanDescription, setNewPlanDescription] = useState("");
  const [newPlanStartDate, setNewPlanStartDate] = useState("");
  const [newPlanEndDate, setNewPlanEndDate] = useState("");
  const [planType, setPlanType] = useState<"single" | "multi">("single");

  const { data: dayPlans, refetch: refetchPlans } = trpc.dayPlans.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: trips } = trpc.trips.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: planItems, refetch: refetchItems } = trpc.dayPlans.getItems.useQuery(
    { dayPlanId: selectedPlan! },
    { enabled: selectedPlan !== null }
  );

  const [, setLocation] = useLocation();

  const createPlan = trpc.dayPlans.create.useMutation();

  const deletePlan = trpc.dayPlans.delete.useMutation({
    onSuccess: () => {
      toast.success("Plan deleted");
      setSelectedPlan(null);
      refetchPlans();
    },
  });

  const addTripToPlan = trpc.dayPlans.addTrip.useMutation({
    onSuccess: () => {
      toast.success("Trip added");
      refetchItems();
    },
  });

  const removeTripFromPlan = trpc.dayPlans.removeTrip.useMutation({
    onSuccess: () => {
      toast.success("Trip removed");
      refetchItems();
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-orange-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t("planner.loginRequired")}</CardTitle>
            <CardDescription>{t("planner.loginDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>{t("planner.loginBtn")}</a>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("planner.backHome")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCreatePlan = async () => {
    if (!newPlanTitle || !newPlanStartDate || !newPlanEndDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const result = await createPlan.mutateAsync({
        title: newPlanTitle,
        description: newPlanDescription,
        startDate: new Date(newPlanStartDate),
        endDate: new Date(newPlanEndDate),
      });

      console.log("Plan created, result:", result);

      // Close dialog and reset form
      setIsCreateDialogOpen(false);
      setNewPlanTitle("");
      setNewPlanDescription("");
      setNewPlanStartDate("");
      setNewPlanEndDate("");

      // Navigate immediately after successful creation
      if (result && result.id) {
        console.log("Navigating to /planner/" + result.id);
        setLocation(`/planner/${result.id}`);
      }
    } catch (error) {
      console.error("Error creating plan:", error);
      toast.error("Error creating plan");
    }
  };

  const handleAddTrip = (tripId: number) => {
    if (!selectedPlan) return;

    const currentItems = planItems || [];
    const nextOrderIndex = currentItems.length;

    addTripToPlan.mutate({
      dayPlanId: selectedPlan,
      tripId,
      orderIndex: nextOrderIndex,
      dayNumber: 1,
    });
  };

  const selectedPlanData = dayPlans?.find(p => p.id === selectedPlan);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("planner.back")}
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-800">{t("planner.pageTitle")}</h1>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  {t("planner.newPlan")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("planner.createTitle")}</DialogTitle>
                  <DialogDescription>
                    {planType === "single"
                      ? t("planner.singleDay")
                      : t("planner.multiDay")}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="planType">{t("planner.planType")}</Label>
                    <Select value={planType} onValueChange={(v: "single" | "multi") => setPlanType(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">{t("planner.singleDayOption")}</SelectItem>
                        <SelectItem value="multi">{t("planner.multiDayOption")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="title">{t("planner.titleLabel")}</Label>
                    <Input
                      id="title"
                      value={newPlanTitle}
                      onChange={(e) => setNewPlanTitle(e.target.value)}
                      placeholder={t("planner.titlePlaceholder")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">{t("planner.descLabel")}</Label>
                    <Textarea
                      id="description"
                      value={newPlanDescription}
                      onChange={(e) => setNewPlanDescription(e.target.value)}
                      placeholder={t("planner.descPlaceholder")}
                    />
                  </div>
                  <div className={planType === "single" ? "" : "grid grid-cols-2 gap-4"}>
                    <div>
                      <Label htmlFor="startDate">{planType === "single" ? t("planner.dateLabel") : t("planner.startDateLabel")}</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={newPlanStartDate}
                        onChange={(e) => {
                          setNewPlanStartDate(e.target.value);
                          if (planType === "single") {
                            // For single-day plans, set end date to next day
                            const nextDay = new Date(e.target.value);
                            nextDay.setDate(nextDay.getDate() + 1);
                            setNewPlanEndDate(nextDay.toISOString().split('T')[0]);
                          }
                        }}
                      />
                    </div>
                    {planType === "multi" && (
                      <div>
                        <Label htmlFor="endDate">{t("planner.endDateLabel")}</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={newPlanEndDate}
                          onChange={(e) => setNewPlanEndDate(e.target.value)}
                          min={newPlanStartDate}
                        />
                      </div>
                    )}
                  </div>
                  <Button onClick={handleCreatePlan} className="w-full" disabled={createPlan.isPending}>
                    {createPlan.isPending ? t("planner.creating") : t("planner.createBtn")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Plans List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{t("planner.myPlans")}</CardTitle>
                <CardDescription>{dayPlans?.length || 0} {dayPlans?.length !== 1 ? t("planner.planCountPlural") : t("planner.planCount")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {dayPlans && dayPlans.length > 0 ? (
                  dayPlans?.map((plan) => (
                    <Link key={plan.id} href={`/planner/${plan.id}`}>
                      <div
                        className="p-3 rounded-lg cursor-pointer transition-all bg-gray-50 hover:bg-gray-100"
                      >
                        <h4 className="font-medium">{plan.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    {t("planner.noPlans")}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Plan Details */}
          <div className="lg:col-span-2 space-y-6">
            {selectedPlan && selectedPlanData ? (
              <>
                {/* Plan Header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl">{selectedPlanData.title}</CardTitle>
                        <CardDescription className="mt-2">{selectedPlanData.description}</CardDescription>
                        <div className="flex items-center gap-4 mt-4">
                          <Badge variant="outline">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(selectedPlanData.startDate).toLocaleDateString("de-DE")} - {new Date(selectedPlanData.endDate).toLocaleDateString("de-DE")}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deletePlan.mutate({ id: selectedPlan })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                </Card>

                {/* Plan Items */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t("planner.tripsInPlan")}</CardTitle>
                    <CardDescription>{planItems?.length || 0} {planItems?.length !== 1 ? t("planner.tripCountPlural") : t("planner.tripCount")}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {planItems && planItems.length > 0 ? (
                      planItems?.map((item, index) => (
                        <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <GripVertical className="w-5 h-5 text-gray-400" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">#{index + 1}</Badge>
                              <h4 className="font-medium">{item.trip?.title}</h4>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {item.trip?.destination}
                              </span>
                              {item.startTime && item.endTime && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {item.startTime} - {item.endTime}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTripFromPlan.mutate({ id: item.id })}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        {t("planner.noTripsInPlan")}
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Available Trips */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t("planner.availableTrips")}</CardTitle>
                    <CardDescription>{t("planner.clickToAdd")}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {trips && trips.length > 0 ? (
                      trips?.map((trip) => {
                        const isInPlan = planItems?.some(item => item.tripId === trip.id);
                        return (
                          <div
                            key={trip.id}
                            onClick={() => !isInPlan && handleAddTrip(trip.id)}
                            className={`p-3 rounded-lg transition-all ${
                              isInPlan
                                ? "bg-gray-100 opacity-50 cursor-not-allowed"
                                : "bg-gray-50 hover:bg-gray-100 cursor-pointer"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{trip.title}</h4>
                                <p className="text-sm text-muted-foreground">{trip.destination}</p>
                              </div>
                              {isInPlan && <Badge variant="secondary">{t("planner.inPlan")}</Badge>}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        {t("planner.noTripsAvailable")}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>{t("planner.selectOrCreate")}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
