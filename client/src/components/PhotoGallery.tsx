import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Trash2, Plus, ImageOff } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useI18n } from "@/contexts/i18nContext";
import { DragAndDropFileInput } from "@/components/DragAndDropFileInput";

interface Photo {
  id: number;
  photoUrl: string;
  caption?: string | null;
  createdAt: Date;
  isPrimary: number;
}

interface PhotoGalleryProps {
  tripId: number;
  photos: Photo[];
  onRefresh: () => void;
  canEdit?: boolean;
  isLoading?: boolean;
}

export function PhotoGallery({ tripId, photos, onRefresh, canEdit = true, isLoading = false }: PhotoGalleryProps) {
  const { t } = useI18n();
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPrimary, setIsPrimary] = useState(false);

  const uploadImageMutation = trpc.upload.tripImage.useMutation();

  const uploadPhotoMutation = trpc.photos.add.useMutation({
    onSuccess: (data) => {
      toast.success("Foto erfolgreich hochgeladen");
      setSelectedFile(null);
      setCaption("");
      setIsPrimary(false);
      onRefresh();
    },
    onError: (error) => {
      toast.error(error.message || "Fehler beim Hochladen des Fotos");
    },
  });

  const deletePhotoMutation = trpc.photos.delete.useMutation({
    onSuccess: () => {
      toast.success("Foto gelöscht");
      onRefresh();
    },
    onError: (error) => {
      toast.error(error.message || "Fehler beim Löschen des Fotos");
    },
  });

  const setPrimaryMutation = trpc.photos.setPrimary.useMutation({
    onSuccess: () => {
      toast.success("Titelbild aktualisiert");
      onRefresh();
    },
    onError: (error) => {
      toast.error(error.message || "Fehler beim Aktualisieren des Titelbilds");
    },
  });

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      // Read file as base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve(event.target?.result as string);
        };
        reader.onerror = () => {
          reject(new Error("Fehler beim Lesen der Datei"));
        };
        reader.readAsDataURL(selectedFile);
      });

      // Upload image and get URL using mutateAsync
      const uploadResult = await uploadImageMutation.mutateAsync({ base64 });

      // Add photo with the uploaded URL
      await uploadPhotoMutation.mutateAsync({
        tripId,
        photoUrl: uploadResult.url,
        caption: caption || undefined,
        isPrimary: isPrimary,
      });
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(error instanceof Error ? error.message : "Fehler beim Hochladen des Fotos");
    } finally {
      setUploading(false);
    }
  };

  // Show all photos in the gallery
  const galleryPhotos = photos;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          {t("gallery.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Photos Grid */}
        {galleryPhotos.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Fotos</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {galleryPhotos.map((photo) => (
                <div key={photo.id} className="relative group overflow-hidden rounded-lg">
                  <img
                    src={photo.photoUrl}
                    alt={photo.caption || "Trip photo"}
                    className="w-full h-32 object-cover"
                  />
                  {photo.isPrimary === 1 && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-semibold">
                      {t("trips.coverImage")}
                    </div>
                  )}
                  {canEdit && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      {photo.isPrimary === 0 && (
                        <Button
                          size="sm"
                          onClick={() => setPrimaryMutation.mutate({ tripId, photoId: photo.id })}
                          disabled={setPrimaryMutation.isPending}
                          className="gap-1"
                        >
                          {t("gallery.setAsCover")}
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deletePhotoMutation.mutate({ id: photo.id })}
                        disabled={deletePhotoMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Photos */}
        {galleryPhotos.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <ImageOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>{t("gallery.noPhotos")}</p>
          </div>
        )}

        {/* Upload Section */}
        <div className="pt-4 border-t space-y-3">
          <h4 className="text-sm font-semibold">{t("gallery.addPhoto")}</h4>
          <DragAndDropFileInput
            onFileSelected={setSelectedFile}
            selectedFile={selectedFile}
            disabled={!canEdit}
            accept="image/jpeg,image/png,image/webp"
          />
          <input
            type="text"
            placeholder={t("gallery.imageCaption")}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={!canEdit}
            className="w-full p-2 border rounded-md"
          />
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is-primary"
              disabled={!canEdit}
              className="rounded border-gray-300"
            />
            <label htmlFor="is-primary" className="text-sm">
              {t("gallery.setAsCover")}
            </label>
          </div>
          <Button
            onClick={handleUpload}
            disabled={!canEdit || !selectedFile || uploading || uploadPhotoMutation.isPending}
            className="w-full gap-2"
          >
            <Plus className="w-4 h-4" />
            {uploading || uploadPhotoMutation.isPending ? t("gallery.uploading") : t("gallery.uploadPhoto")}
          </Button>
          {!isLoading && !canEdit && (
            <p className="text-xs text-muted-foreground text-center">
              {t("trips.loginRequiredToUploadPhotos")}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
