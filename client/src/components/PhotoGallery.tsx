import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Trash2, Plus, ImageOff } from "lucide-react";

interface Photo {
  id: string;
  url: string;
  caption?: string;
  uploadedAt: Date;
  isPrimary?: boolean;
}

interface PhotoGalleryProps {
  photos: Photo[];
  onUpload: (file: File, caption: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSetPrimary: (id: string) => Promise<void>;
}

export function PhotoGallery({ photos, onUpload, onDelete, onSetPrimary }: PhotoGalleryProps) {
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      await onUpload(selectedFile, caption);
      setSelectedFile(null);
      setCaption("");
    } finally {
      setUploading(false);
    }
  };

  const primaryPhoto = photos.find((p) => p.isPrimary);
  const otherPhotos = photos.filter((p) => !p.isPrimary);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Photo Gallery
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Primary Photo */}
        {primaryPhoto && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Cover Photo</h4>
            <div className="relative group overflow-hidden rounded-lg">
              <img
                src={primaryPhoto.url}
                alt={primaryPhoto.caption || "Trip photo"}
                className="w-full h-48 object-cover"
              />
              {primaryPhoto.caption && (
                <p className="p-2 bg-gradient-to-t from-black/50 to-transparent text-white text-sm">
                  {primaryPhoto.caption}
                </p>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(primaryPhoto.id)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Other Photos Grid */}
        {otherPhotos.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Other Photos</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {otherPhotos.map((photo) => (
                <div key={photo.id} className="relative group overflow-hidden rounded-lg">
                  <img
                    src={photo.url}
                    alt={photo.caption || "Trip photo"}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => onSetPrimary(photo.id)}
                      className="gap-1"
                    >
                      Set as Cover
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(photo.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Photos */}
        {photos.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <ImageOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No photos yet</p>
          </div>
        )}

        {/* Upload Section */}
        <div className="pt-4 border-t space-y-3">
          <h4 className="text-sm font-semibold">Add Photos</h4>
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full"
            />
            <input
              type="text"
              placeholder="Photo caption (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="w-full gap-2"
            >
              <Plus className="w-4 h-4" />
              {uploading ? "Uploading..." : "Upload Photo"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
