import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Trash2, Plus, ImageOff } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

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
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const uploadPhotoMutation = trpc.photos.add.useMutation({
    onSuccess: () => {
      toast.success("Foto erfolgreich hochgeladen");
      setSelectedFile(null);
      setCaption("");
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
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        // Convert base64 data URL to URL using upload endpoint
        const uploadResult = await trpc.upload.tripImage.mutate({ base64 });

        // Add photo with the uploaded URL
        uploadPhotoMutation.mutate({
          tripId,
          photoUrl: uploadResult.url,
          caption: caption || undefined,
        });
      };
      reader.readAsDataURL(selectedFile);
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
          Photo Gallery
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
                      Titelbild
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
                          Als Titelbild
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
            <p>Noch keine Fotos</p>
          </div>
        )}

        {/* Upload Section */}
        <div className="pt-4 border-t space-y-3">
          <h4 className="text-sm font-semibold">Fotos hochladen</h4>
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              disabled={!canEdit}
              className="w-full"
            />
            <input
              type="text"
              placeholder="Fototitel (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              disabled={!canEdit}
              className="w-full p-2 border rounded-md"
            />
            <Button
              onClick={handleUpload}
              disabled={!canEdit || !selectedFile || uploading || uploadPhotoMutation.isPending}
              className="w-full gap-2"
            >
              <Plus className="w-4 h-4" />
              {uploading || uploadPhotoMutation.isPending ? "Wird hochgeladen..." : "Foto hochladen"}
            </Button>
            {!isLoading && !canEdit && (
              <p className="text-xs text-muted-foreground text-center">
                Du musst angemeldet sein, um Fotos hochzuladen.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
