import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/contexts/i18nContext";
import { MapPin, Plus, Trash2, Edit, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Destinations() {
  const { t } = useI18n();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    imageUrl: "",
  });

  const { data: destinations, isLoading, refetch } = trpc.destinations.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createMutation = trpc.destinations.create.useMutation({
    onSuccess: () => {
      toast.success(t("destinations.createSuccess"));
      refetch();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(t("destinations.createError") + error.message);
    },
  });

  const updateMutation = trpc.destinations.update.useMutation({
    onSuccess: () => {
      toast.success(t("destinations.updateSuccess"));
      refetch();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(t("destinations.updateError") + error.message);
    },
  });

  const deleteMutation = trpc.destinations.delete.useMutation({
    onSuccess: () => {
      toast.success(t("destinations.deleteSuccess"));
      refetch();
    },
    onError: (error) => {
      toast.error(t("destinations.deleteError") + error.message);
    },
  });

  const resetForm = () => {
    setFormData({ name: "", description: "", location: "", imageUrl: "" });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (destination: any) => {
    setEditingId(destination.id);
    setFormData({
      name: destination.name,
      description: destination.description || "",
      location: destination.location,
      imageUrl: destination.imageUrl || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm(t("destinations.deleteConfirm"))) {
      deleteMutation.mutate({ id });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <MapPin className="w-16 h-16 text-primary mb-4" />
        <h1 className="text-3xl font-bold mb-2">{t("destinations.loginRequired")}</h1>
        <p className="text-muted-foreground mb-6 text-center max-w-md">
          {t("destinations.loginDesc")}
        </p>
        <a href={getLoginUrl()}>
          <Button size="lg">{t("destinations.loginBtn")}</Button>
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-12">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              {t("destinations.pageTitle")}
            </h1>
            <p className="text-muted-foreground">
              {t("destinations.pageSubtitle")}
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                {t("destinations.newDestination")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingId ? t("destinations.editDestination") : t("destinations.createDestination")}
                  </DialogTitle>
                  <DialogDescription>
                    {t("destinations.addFavorite")}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="name">{t("destinations.nameRequired")}</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder={t("destinations.namePlaceholder")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">{t("destinations.locationRequired")}</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                      placeholder={t("destinations.locationPlaceholder")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">{t("destinations.description")}</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder={t("destinations.descPlaceholder")}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="imageUrl">{t("destinations.imageUrl")}</Label>
                    <Input
                      id="imageUrl"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder={t("destinations.imageUrlPlaceholder")}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    {t("destinations.cancel")}
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {editingId ? t("destinations.update") : t("destinations.create")}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : destinations && destinations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((destination) => (
              <Card key={destination.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {destination.imageUrl && (
                  <div className="h-48 bg-muted overflow-hidden">
                    <img
                      src={destination.imageUrl}
                      alt={destination.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    {destination.name}
                  </CardTitle>
                  <CardDescription>{destination.location}</CardDescription>
                </CardHeader>
                {destination.description && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{destination.description}</p>
                  </CardContent>
                )}
                <CardFooter className="gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(destination)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {t("common.edit")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(destination.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t("destinations.noDestinations")}</h3>
            <p className="text-muted-foreground mb-4">
              {t("destinations.noDestinationsDesc")}
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t("destinations.createFirst")}
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
