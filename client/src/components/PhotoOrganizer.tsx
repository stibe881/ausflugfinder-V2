import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Image } from "lucide-react";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";

interface Photo {
  id: number;
  photoUrl: string;
  caption?: string | null;
  createdAt: Date;
  isPrimary: number;
}

interface PhotoOrganizerProps {
  photos: Photo[];
}

interface GroupedPhotos {
  [key: string]: Photo[];
}

export function PhotoOrganizer({ photos }: PhotoOrganizerProps) {
  // Group photos by the month they were created
  const groupedPhotos = useMemo(() => {
    const groups: GroupedPhotos = {};

    photos.forEach((photo) => {
      const date = new Date(photo.createdAt);
      const monthKey = format(date, "yyyy-MM", { locale: de }); // "2024-11"

      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(photo);
    });

    // Sort groups by date (newest first)
    const sorted = Object.entries(groups).sort(([keyA], [keyB]) => keyB.localeCompare(keyA));

    return Object.fromEntries(sorted);
  }, [photos]);

  const totalMonths = Object.keys(groupedPhotos).length;
  const totalPhotos = photos.length;

  if (photos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Foto-Übersicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Image className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Keine Fotos zum Organisieren</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Foto-Übersicht
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline">{totalPhotos} Fotos</Badge>
            <Badge variant="secondary">{totalMonths} Monate</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {Object.entries(groupedPhotos).map(([monthKey, monthPhotos]) => {
          const [year, month] = monthKey.split("-");
          const dateObj = new Date(`${year}-${month}-01`);
          const monthName = format(dateObj, "MMMM yyyy", { locale: de });

          // Group photos within the month by day
          const dayGroups: { [key: string]: Photo[] } = {};
          monthPhotos.forEach((photo) => {
            const dayKey = format(new Date(photo.createdAt), "yyyy-MM-dd");
            if (!dayGroups[dayKey]) {
              dayGroups[dayKey] = [];
            }
            dayGroups[dayKey].push(photo);
          });

          return (
            <div key={monthKey} className="space-y-4">
              <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10">
                <div className="flex items-center justify-between pb-3 border-b">
                  <h3 className="text-lg font-semibold capitalize">{monthName}</h3>
                  <Badge variant="outline">{monthPhotos.length}</Badge>
                </div>
              </div>

              <div className="space-y-4">
                {Object.entries(dayGroups)
                  .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
                  .map(([dayKey, dayPhotos]) => {
                    const dayDate = parseISO(dayKey);
                    const dayName = format(dayDate, "EEEE, d. MMMM", { locale: de });

                    return (
                      <div key={dayKey} className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">{dayName}</span>
                          <Badge variant="secondary" className="text-xs">
                            {dayPhotos.length}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                          {dayPhotos.map((photo) => (
                            <div
                              key={photo.id}
                              className="relative group overflow-hidden rounded-lg aspect-square bg-muted"
                            >
                              <img
                                src={photo.photoUrl}
                                alt={photo.caption || "Photo"}
                                className="w-full h-full object-cover"
                              />
                              {photo.isPrimary === 1 && (
                                <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded">
                                  Titel
                                </div>
                              )}
                              {photo.caption && (
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1 opacity-0 group-hover:opacity-100 transition">
                                  <p className="text-white text-xs line-clamp-2">{photo.caption}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
