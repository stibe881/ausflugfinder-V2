import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Video, X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface VideoItem {
  id: string;
  url: string;
  title?: string;
  platform: "youtube" | "tiktok";
}

interface VideoGalleryProps {
  tripId: number;
  videos: VideoItem[];
  onRefresh: () => void;
}

// Extract video ID from YouTube URL
const extractYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// Extract video ID from TikTok URL
const extractTikTokId = (url: string): string | null => {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[\w.]+\/video\/(\d+)/,
    /(?:https?:\/\/)?(?:www\.)?vm\.tiktok\.com\/(\w+)/,
    /(?:https?:\/\/)?(?:www\.)?vt\.tiktok\.com\/(\w+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

export function VideoGallery({ tripId, videos, onRefresh }: VideoGalleryProps) {
  const [showForm, setShowForm] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");

  const addVideoMutation = trpc.videos.add.useMutation({
    onSuccess: () => {
      toast.success("Video hinzugefügt");
      setVideoUrl("");
      setVideoTitle("");
      setShowForm(false);
      onRefresh();
    },
    onError: (error) => {
      toast.error(error.message || "Fehler beim Hinzufügen des Videos");
    },
  });

  const deleteVideoMutation = trpc.videos.delete.useMutation({
    onSuccess: () => {
      toast.success("Video gelöscht");
      onRefresh();
    },
    onError: (error) => {
      toast.error(error.message || "Fehler beim Löschen des Videos");
    },
  });

  const handleAddVideo = () => {
    if (!videoUrl.trim()) {
      toast.error("Bitte eine Video-URL eingeben");
      return;
    }

    let platform: "youtube" | "tiktok" | null = null;
    let videoId: string | null = null;

    if (videoUrl.includes("youtube") || videoUrl.includes("youtu.be")) {
      platform = "youtube";
      videoId = extractYouTubeId(videoUrl);
    } else if (videoUrl.includes("tiktok")) {
      platform = "tiktok";
      videoId = extractTikTokId(videoUrl);
    }

    if (!platform || !videoId) {
      toast.error("Ungültige YouTube oder TikTok URL");
      return;
    }

    addVideoMutation.mutate({
      tripId,
      url: videoId,
      title: videoTitle || undefined,
      platform,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="w-5 h-5" />
          Videos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Videos Grid */}
        {videos.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Meine Videos</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videos.map((video) => (
                <div key={video.id} className="relative group overflow-hidden rounded-lg bg-muted aspect-video">
                  {video.platform === "youtube" && (
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${video.url}?rel=0`}
                      title={video.title || "YouTube Video"}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  )}
                  {video.platform === "tiktok" && (
                    <iframe
                      src={`https://www.tiktok.com/embed/v2/${video.url}`}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      allow="autoplay"
                      className="w-full h-full"
                    />
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteVideoMutation.mutate({ id: video.id })}
                    disabled={deleteVideoMutation.isPending}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  {video.title && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="text-white text-xs font-medium line-clamp-2">{video.title}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Videos */}
        {videos.length === 0 && !showForm && (
          <div className="text-center py-8 text-muted-foreground">
            <Video className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Noch keine Videos</p>
          </div>
        )}

        {/* Add Video Form */}
        {showForm && (
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Video hinzufügen</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowForm(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">
                Unterstützte Plattformen: YouTube, TikTok
              </p>
              <Input
                placeholder="z.B. https://www.youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
            </div>
            <Input
              placeholder="Video-Titel (optional)"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleAddVideo}
                disabled={addVideoMutation.isPending}
                className="flex-1 gap-2"
              >
                <Plus className="w-4 h-4" />
                {addVideoMutation.isPending ? "Wird hinzugefügt..." : "Video hinzufügen"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Abbrechen
              </Button>
            </div>
          </div>
        )}

        {/* Add Video Button */}
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="w-full gap-2"
          >
            <Plus className="w-4 h-4" />
            Video hinzufügen
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
