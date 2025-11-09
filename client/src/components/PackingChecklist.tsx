import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Package } from "lucide-react";
import { useI18n } from "@/contexts/i18nContext";

interface PackingItem {
  id: string;
  item: string;
  category: string;
  quantity: number;
  isPacked: boolean;
}

interface PackingChecklistProps {
  items: PackingItem[];
  onAddItem: (item: Omit<PackingItem, "id">) => void;
  onRemoveItem: (id: string) => void;
  onTogglePacked: (id: string, isPacked: boolean) => void;
}

const CATEGORIES = ["Clothing", "Documents", "Toiletries", "Electronics", "Food", "Other"];

export function PackingChecklist({
  items,
  onAddItem,
  onRemoveItem,
  onTogglePacked,
}: PackingChecklistProps) {
  const { t } = useI18n();
  const [newItem, setNewItem] = useState({ item: "", category: "Other", quantity: 1 });

  const handleAdd = () => {
    if (newItem.item.trim()) {
      onAddItem({ ...newItem, isPacked: false });
      setNewItem({ item: "", category: "Other", quantity: 1 });
    }
  };

  const packedCount = items.filter((i) => i.isPacked).length;
  const progress = items.length > 0 ? (packedCount / items.length) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Packing Checklist
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        {items.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span className="font-semibold">
                {packedCount} / {items.length}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Items by Category */}
        {items.length > 0 && (
          <div className="space-y-4">
            {CATEGORIES.map((category) => {
              const categoryItems = items.filter((i) => i.category === category);
              if (categoryItems.length === 0) return null;

              return (
                <div key={category} className="space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground">{category}</h4>
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2 rounded hover:bg-muted"
                    >
                      <Checkbox
                        checked={item.isPacked}
                        onCheckedChange={(checked) =>
                          onTogglePacked(item.id, checked as boolean)
                        }
                      />
                      <div className="flex-1">
                        <p
                          className={`text-sm ${
                            item.isPacked
                              ? "line-through text-muted-foreground"
                              : "text-foreground"
                          }`}
                        >
                          {item.item} {item.quantity > 1 && `(×${item.quantity})`}
                        </p>
                      </div>
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
                </div>
              );
            })}
          </div>
        )}

        {/* Add Item Form */}
        <div className="pt-4 border-t space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Item name"
              value={newItem.item}
              onChange={(e) => setNewItem({ ...newItem, item: e.target.value })}
            />
            <Input
              type="number"
              min="1"
              placeholder="Qty"
              value={newItem.quantity}
              onChange={(e) =>
                setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })
              }
            />
          </div>
          <select
            value={newItem.category}
            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
            className="w-full p-2 border rounded-md bg-background text-foreground"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <Button onClick={handleAdd} className="w-full gap-2">
            <Plus className="w-4 h-4" />
            Add Item
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
