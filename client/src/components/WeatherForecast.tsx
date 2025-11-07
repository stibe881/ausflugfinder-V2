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
  const filteredHourlyForecasts = hourlyWeather?.hourly.filter((hourly) => {
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

  // Group hourly forecasts by date
  const forecastsByDate = new Map<string, typeof filteredHourlyForecasts>();
  filteredHourlyForecasts.forEach((forecast) => {
    const dateStr = new Date(forecast.time).toISOString().split('T')[0];
    if (!forecastsByDate.has(dateStr)) {
      forecastsByDate.set(dateStr, []);
    }
    forecastsByDate.get(dateStr)!.push(forecast);
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
        <div className="space-y-6">
          {Array.from(forecastsByDate.entries()).map(([dateStr, forecasts]) => (
            <div key={dateStr}>
              <h3 className="font-semibold text-lg mb-3 text-gray-700">
                {format(new Date(dateStr), "EEEE, d. MMMM yyyy", { locale: de })}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 overflow-x-auto pb-2">
                {forecasts.map((forecast, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-3 text-center border border-blue-100"
                  >
                    <div className="text-xs font-medium text-muted-foreground mb-2">
                      {format(new Date(forecast.time), "HH:mm", { locale: de })}
                    </div>
                    <div className="flex justify-center mb-2">
                      {getWeatherIcon(forecast.weather_code)}
                    </div>
                    <div className="text-xs font-medium text-gray-700 mb-2 line-clamp-2">
                      {forecast.weather_description}
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs mb-2">
                      <Thermometer className="w-3 h-3 text-orange-500" />
                      <span className="font-semibold">{forecast.temperature}°C</span>
                    </div>
                    {forecast.precipitation_probability > 0 && (
                      <div className="flex items-center justify-center gap-1 text-xs text-blue-600">
                        <Droplets className="w-3 h-3" />
                        <span>{forecast.precipitation_probability}%</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
