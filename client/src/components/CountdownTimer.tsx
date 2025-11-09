import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import { useI18n } from "@/contexts/i18nContext";

interface CountdownTimerProps {
  startDate: Date;
  endDate?: Date;
  tripTitle?: string;
}

export function CountdownTimer({ startDate, endDate, tripTitle }: CountdownTimerProps) {
  const { t } = useI18n();
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [status, setStatus] = useState<"upcoming" | "today" | "ongoing" | "past">("upcoming");
  const [timeDisplay, setTimeDisplay] = useState("");

  useEffect(() => {
    const calculateCountdown = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = endDate ? new Date(endDate) : start;
      end.setHours(0, 0, 0, 0);

      const diffStart = Math.floor((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const diffEnd = Math.floor((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // Determine status
      if (diffStart > 0) {
        setStatus("upcoming");
        setDaysRemaining(diffStart);
      } else if (diffStart === 0) {
        setStatus("today");
        setDaysRemaining(0);
      } else if (diffEnd >= 0) {
        setStatus("ongoing");
        setDaysRemaining(diffEnd);
      } else {
        setStatus("past");
        setDaysRemaining(Math.abs(diffEnd));
      }
    };

    calculateCountdown();
  }, [startDate, endDate]);

  // Format dates
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("de-CH", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    });
  };

  // Get status color and message
  const getStatusDisplay = () => {
    switch (status) {
      case "upcoming":
        if (daysRemaining === 1) {
          return {
            color: "bg-blue-500/10 text-blue-600 border-blue-600",
            message: "Morgen!",
            icon: "🚀",
          };
        } else if (daysRemaining <= 7) {
          return {
            color: "bg-green-500/10 text-green-600 border-green-600",
            message: `In ${daysRemaining} Tagen`,
            icon: "📅",
          };
        } else if (daysRemaining <= 14) {
          return {
            color: "bg-yellow-500/10 text-yellow-600 border-yellow-600",
            message: `In ${Math.ceil(daysRemaining / 7)} Wochen`,
            icon: "⏰",
          };
        } else {
          return {
            color: "bg-gray-500/10 text-gray-600 border-gray-600",
            message: `In ${Math.ceil(daysRemaining / 30)} Monaten`,
            icon: "📆",
          };
        }
      case "today":
        return {
          color: "bg-red-500/10 text-red-600 border-red-600",
          message: "Heute!",
          icon: "🎉",
        };
      case "ongoing":
        return {
          color: "bg-purple-500/10 text-purple-600 border-purple-600",
          message: `Läuft noch ${daysRemaining + 1} Tag(e)`,
          icon: "🏃",
        };
      case "past":
        return {
          color: "bg-gray-500/10 text-gray-600 border-gray-600",
          message: `Vor ${daysRemaining} Tag(en) zu Ende`,
          icon: "✨",
        };
    }
  };

  const display = getStatusDisplay();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Zeitplan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Countdown Display */}
        <div className={`p-4 rounded-lg border ${display.color}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-75">Abfahrt</p>
              <p className="text-2xl font-bold">{display.message}</p>
              <p className="text-xs opacity-60 mt-1">{display.icon}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold tabular-nums">
                {Math.abs(daysRemaining)}
              </p>
              <p className="text-xs opacity-75">
                {status === "past" ? "Tage vorbei" : "Tage"}
              </p>
            </div>
          </div>
        </div>

        {/* Date Range Display */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Start</p>
              <p className="text-sm font-medium">{formatDate(startDate)}</p>
            </div>
          </div>
          {endDate && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Ende</p>
                <p className="text-sm font-medium">{formatDate(endDate)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Status Indicator */}
        {tripTitle && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-1">Status</p>
            <p className="text-sm font-medium truncate">{tripTitle}</p>
            <div className="mt-2">
              {status === "upcoming" && (
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                  Geplant
                </div>
              )}
              {status === "today" && (
                <div className="flex items-center gap-1 text-xs text-red-600 font-bold">
                  <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  Läuft jetzt!
                </div>
              )}
              {status === "ongoing" && (
                <div className="flex items-center gap-1 text-xs text-purple-600">
                  <div className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                  Im Gange
                </div>
              )}
              {status === "past" && (
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <div className="w-2 h-2 rounded-full bg-gray-600" />
                  Abgeschlossen
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
