import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, MapPin, DollarSign, Plus, Trash2 } from "lucide-react";
import { useI18n } from "@/contexts/i18nContext";

interface ItineraryItem {
  id: string;
  time: string;
  activity: string;
  location: string;
  estimatedCost: number;
}

interface TripItineraryCardProps {
  items: ItineraryItem[];
  onAddItem: (item: Omit<ItineraryItem, "id">) => void;
  onRemoveItem: (id: string) => void;
}

export function TripItineraryCard({
  items,
  onAddItem,
  onRemoveItem,
}: TripItineraryCardProps) {
  const { t } = useI18n();
  const [newItem, setNewItem] = useState({
    time: "09:00",
    activity: "",
    location: "",
    estimatedCost: 0,
  });

  const totalCost = items.reduce((sum, item) => sum + item.estimatedCost, 0);

  const handleAdd = () => {
    if (newItem.activity.trim()) {
      onAddItem(newItem);
      setNewItem({ time: "09:00", activity: "", location: "", estimatedCost: 0 });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("tripDetail.itinerary")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Itinerary List */}
        {items.length > 0 && (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-4 p-3 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-2 min-w-fit">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="font-mono text-sm font-semibold">{item.time}</span>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-semibold">{item.activity}</p>
                  {item.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {item.location}
                    </div>
                  )}
                </div>
                {item.estimatedCost > 0 && (
                  <div className="flex items-center gap-1 text-sm font-semibold">
                    <DollarSign className="w-4 h-4" />
                    CHF {item.estimatedCost}
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveItem(item.id)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            {/* Total Cost */}
            {totalCost > 0 && (
              <div className="pt-3 border-t flex justify-between font-semibold">
                <span>{t("tripDetail.totalEstimatedCost")}</span>
                <span>CHF {totalCost}</span>
              </div>
            )}
          </div>
        )}

        {/* Add New Item Form */}
        <div className="pt-4 border-t space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="time"
              value={newItem.time}
              onChange={(e) => setNewItem({ ...newItem, time: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Cost (CHF)"
              value={newItem.estimatedCost || ""}
              onChange={(e) =>
                setNewItem({ ...newItem, estimatedCost: parseFloat(e.target.value) || 0 })
              }
            />
          </div>
          <Input
            placeholder={t("tripDetail.activity")}
            value={newItem.activity}
            onChange={(e) => setNewItem({ ...newItem, activity: e.target.value })}
          />
          <Input
            placeholder={t("tripDetail.location")}
            value={newItem.location}
            onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
          />
          <Button onClick={handleAdd} className="w-full gap-2">
            <Plus className="w-4 h-4" />
            {t("tripDetail.addActivity")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
