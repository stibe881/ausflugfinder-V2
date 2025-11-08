import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Cloud, CloudRain, CloudSnow, Sun, Wind, Droplets, Thermometer } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface WeatherForecastProps {
  plan: any;
}

const getWeatherIcon = (code: number) => {
  if (code === 0 || code === 1) return <Sun className="w-8 h-8 text-yellow-500" />;
  if (code >= 51 && code <= 67) return <CloudRain className="w-8 h-8 text-blue-500" />;
  if (code >= 71 && code <= 86) return <CloudSnow className="w-8 h-8 text-blue-300" />;
  if (code >= 95) return <Wind className="w-8 h-8 text-gray-600" />;
  return <Cloud className="w-8 h-8 text-gray-400" />;
};

export default function WeatherForecast({ plan }: WeatherForecastProps) {
  // Get first trip with coordinates to use for weather
  const { data: planItems } = trpc.dayPlans.getItems.useQuery(
    { dayPlanId: plan?.id || 0 },
    { enabled: !!plan }
  );

  const firstTripWithCoords = planItems?.find(
    (item) => item.trip?.latitude && item.trip?.longitude
  );

  // Get hourly weather instead of daily
  const { data: hourlyWeather, isLoading } = trpc.weather.hourly.useQuery(
    {
      latitude: Number(firstTripWithCoords?.trip?.latitude) || 0,
      longitude: Number(firstTripWithCoords?.trip?.longitude) || 0,
      days: 7,
    },
    {
      enabled: !!firstTripWithCoords?.trip?.latitude && !!firstTripWithCoords?.trip?.longitude,
    }
  );

  // Get unique dates from plan items
  const tripsWithDates = new Set<string>();
  planItems?.forEach((item) => {
    if (item.dateAssigned) {
      const dateStr = new Date(item.dateAssigned).toISOString().split('T')[0];
      tripsWithDates.add(dateStr);
    }
  });

  if (!plan) {
    return null;
  }

  if (!firstTripWithCoords?.trip?.latitude) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Wettervorhersage
          </CardTitle>
          <CardDescription>
            Füge Ausflüge mit Standortinformationen hinzu, um die Wettervorhersage zu sehen
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Wettervorhersage
          </CardTitle>
          <CardDescription>Lade Wetterdaten...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Filter hourly forecasts to only show hours for days with trips
  const filteredHourlyForecasts = hourlyWeather?.hourly?.filter((hourly) => {
    const hourDate = new Date(hourly.time).toISOString().split('T')[0];
    return tripsWithDates.has(hourDate);
  }) || [];

  if (filteredHourlyForecasts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Wettervorhersage
          </CardTitle>
          <CardDescription>
            Ordne Ausflüge einem Datum zu, um die Wettervorhersage zu sehen
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Group all hourly forecasts by date (show all hours)
  const forecastsByDate = new Map<string, typeof filteredHourlyForecasts>();
  filteredHourlyForecasts.forEach((forecast) => {
    const dateStr = new Date(forecast.time).toISOString().split('T')[0];
    if (!forecastsByDate.has(dateStr)) {
      forecastsByDate.set(dateStr, []);
    }
    forecastsByDate.get(dateStr)!.push(forecast);
  });

  // Sort forecasts by time
  forecastsByDate.forEach((forecasts) => {
    forecasts.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="w-5 h-5" />
          Stündliche Wettervorhersage
        </CardTitle>
        <CardDescription>
          Vorhersage für {firstTripWithCoords.trip?.destination || "ausgewählten Standort"} ({forecastsByDate.size} Tage mit Ausflügen)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {Array.from(forecastsByDate.entries())?.map(([dateStr, forecasts]) => (
            <div key={dateStr} className="border-b pb-8 last:border-b-0">
              <h3 className="font-semibold text-lg mb-6 text-gray-700 dark:text-gray-300">
                {format(new Date(dateStr), "EEEE, d. MMMM yyyy", { locale: de })}
              </h3>

              {/* Timeline Container */}
              <div className="relative">
                {/* Weather icons and temps above timeline */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-4">
                  {forecasts?.map((forecast, index) => {
                    const hour = new Date(forecast.time).getHours();
                    return (
                      <div
                        key={index}
                        className="flex-shrink-0 flex flex-col items-center min-w-max"
                      >
                        {/* Icon */}
                        <div className="mb-2 transition-transform hover:scale-125">
                          {getWeatherIcon(forecast.weather_code)}
                        </div>
                        {/* Temperature */}
                        <div className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">
                          {Math.round(forecast.temperature)}°
                        </div>
                        {/* Description (abbreviated) */}
                        <div className="text-xs text-muted-foreground text-center line-clamp-1 w-12 mb-1">
                          {forecast.weather_description.substring(0, 10)}
                        </div>
                        {/* Precipitation if present */}
                        {forecast.precipitation_probability > 0 && (
                          <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-0.5">
                            <Droplets className="w-3 h-3" />
                            <span>{forecast.precipitation_probability}%</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Timeline base line */}
                <div className="bg-gradient-to-r from-blue-200 via-cyan-200 to-blue-200 dark:from-blue-900 dark:via-cyan-900 dark:to-blue-900 h-1 rounded-full mb-3" />

                {/* Time labels below timeline */}
                <div className="flex gap-2 overflow-x-auto text-xs font-medium text-muted-foreground">
                  {forecasts?.map((forecast, index) => {
                    const hour = new Date(forecast.time).getHours();
                    return (
                      <div
                        key={index}
                        className="flex-shrink-0 text-center min-w-max px-1"
                      >
                        {hour}:00
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Summary stats */}
              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 text-center border border-blue-100 dark:border-blue-800">
                  <div className="text-xs text-muted-foreground mb-1">Ø Temperatur</div>
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {Math.round(forecasts.reduce((sum, f) => sum + f.temperature, 0) / forecasts.length)}°C
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-3 text-center border border-yellow-100 dark:border-yellow-800">
                  <div className="text-xs text-muted-foreground mb-1">Max Temp</div>
                  <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                    {Math.max(...forecasts.map(f => f.temperature))}°C
                  </div>
                </div>
                <div className="bg-sky-50 dark:bg-sky-950/20 rounded-lg p-3 text-center border border-sky-100 dark:border-sky-800">
                  <div className="text-xs text-muted-foreground mb-1">Max Regen</div>
                  <div className="text-lg font-bold text-sky-600 dark:text-sky-400">
                    {Math.max(...forecasts.map(f => f.precipitation_probability))}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
