import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/contexts/i18nContext";

interface FilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  keyword: string;
  onKeywordChange: (value: string) => void;
  region: string;
  onRegionChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  cost: string;
  onCostChange: (value: string) => void;
  onReset: () => void;
  regions: string[];
  categories: string[];
}

export function FilterBottomSheet({
  isOpen,
  onClose,
  keyword,
  onKeywordChange,
  region,
  onRegionChange,
  category,
  onCategoryChange,
  cost,
  onCostChange,
  onReset,
  regions,
  categories,
}: FilterBottomSheetProps) {
  const { t } = useI18n();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-background rounded-t-2xl z-50 max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Handle Bar */}
        <div className="flex justify-center pt-3 pb-6">
          <div className="w-12 h-1 rounded-full bg-muted"></div>
        </div>

        {/* Header */}
        <div className="px-4 pb-4 border-b flex items-center justify-between sticky top-0 bg-background rounded-t-2xl">
          <h2 className="text-lg font-semibold">{t("explore.filters")}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Filters Content */}
        <div className="px-4 py-6 space-y-6 pb-20">
          {/* Keyword Search */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t("explore.search")}
            </label>
            <Input
              placeholder={t("explore.search")}
              value={keyword}
              onChange={(e) => onKeywordChange(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Region Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t("explore.region")}
            </label>
            <Select value={region} onValueChange={onRegionChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("explore.allRegions")} />
              </SelectTrigger>
              <SelectContent>
                {regions.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t("explore.category")}
            </label>
            <Select value={category} onValueChange={onCategoryChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("explore.allCategories")} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cost Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t("explore.cost")}
            </label>
            <Select value={cost} onValueChange={onCostChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("explore.allCosts")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">{t("explore.costFree")}</SelectItem>
                <SelectItem value="low">CHF •</SelectItem>
                <SelectItem value="medium">CHF ••</SelectItem>
                <SelectItem value="high">CHF •••</SelectItem>
                <SelectItem value="very_high">CHF ••••</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t px-4 py-3 flex gap-3 rounded-t-2xl">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              onReset();
              onClose();
            }}
          >
            {t("explore.resetFilters")}
          </Button>
          <Button
            className="flex-1"
            onClick={onClose}
          >
            {t("explore.apply")}
          </Button>
        </div>
      </div>
    </>
  );
}
