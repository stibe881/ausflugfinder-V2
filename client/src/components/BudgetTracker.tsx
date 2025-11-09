import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, TrendingDown } from "lucide-react";

interface BudgetItem {
  id: string;
  category: string;
  description: string;
  estimatedCost: number;
  actualCost?: number;
}

interface BudgetTrackerProps {
  items: BudgetItem[];
  onAddItem: (item: Omit<BudgetItem, "id">) => void;
  onRemoveItem: (id: string) => void;
  onUpdateActualCost: (id: string, actualCost: number) => void;
}

const CATEGORIES = ["Transportation", "Accommodation", "Food", "Activities", "Shopping", "Other"];

export function BudgetTracker({
  items,
  onAddItem,
  onRemoveItem,
  onUpdateActualCost,
}: BudgetTrackerProps) {
  const [newItem, setNewItem] = useState({
    category: "Other",
    description: "",
    estimatedCost: 0,
  });

  const handleAdd = () => {
    if (newItem.description.trim() && newItem.estimatedCost > 0) {
      onAddItem(newItem);
      setNewItem({ category: "Other", description: "", estimatedCost: 0 });
    }
  };

  const totalEstimated = items.reduce((sum, item) => sum + item.estimatedCost, 0);
  const totalActual = items.reduce((sum, item) => sum + (item.actualCost || 0), 0);
  const difference = totalActual - totalEstimated;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="w-5 h-5" />
          Budget Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Budget Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-muted rounded">
            <p className="text-xs text-muted-foreground">Estimated</p>
            <p className="text-xl font-bold">CHF {totalEstimated}</p>
          </div>
          <div className="p-3 bg-muted rounded">
            <p className="text-xs text-muted-foreground">Actual</p>
            <p className="text-xl font-bold">CHF {totalActual}</p>
          </div>
          <div className={`p-3 rounded ${difference > 0 ? "bg-red-500/10" : "bg-green-500/10"}`}>
            <p className="text-xs text-muted-foreground">Difference</p>
            <p className={`text-xl font-bold ${difference > 0 ? "text-red-500" : "text-green-500"}`}>
              CHF {difference > 0 ? "+" : ""}{difference}
            </p>
          </div>
        </div>

        {/* Items List */}
        {items.length > 0 && (
          <div className="space-y-3">
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
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{item.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Estimated: CHF {item.estimatedCost}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="Actual"
                          value={item.actualCost || ""}
                          onChange={(e) =>
                            onUpdateActualCost(item.id, parseFloat(e.target.value) || 0)
                          }
                          className="w-20 px-2 py-1 border rounded text-sm"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveItem(item.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* Add Item Form */}
        <div className="pt-4 border-t space-y-3">
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
          <Input
            placeholder="Description"
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Estimated Cost (CHF)"
            value={newItem.estimatedCost || ""}
            onChange={(e) =>
              setNewItem({ ...newItem, estimatedCost: parseFloat(e.target.value) || 0 })
            }
          />
          <Button onClick={handleAdd} className="w-full gap-2">
            <Plus className="w-4 h-4" />
            Add Budget Item
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
