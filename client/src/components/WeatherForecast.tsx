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

  const { data: weather, isLoading } = trpc.weather.forecast.useQuery(
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

  // Filter forecasts to only show days with trips
  const filteredForecasts = weather?.forecasts.filter((forecast) => {
    const forecastDate = new Date(forecast.date).toISOString().split('T')[0];
    return tripsWithDates.has(forecastDate);
  }) || [];

  if (filteredForecasts.length === 0) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="w-5 h-5" />
          Wettervorhersage
        </CardTitle>
        <CardDescription>
          Vorhersage für {firstTripWithCoords.trip?.destination || "ausgewählten Standort"} ({filteredForecasts.length} Tage mit Ausflügen)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredForecasts.map((forecast, index) => (
            <Card key={index} className="bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <div className="font-medium text-sm text-muted-foreground">
                    {format(new Date(forecast.date), "EEEE, d. MMM", { locale: de })}
                  </div>
                  <div className="flex justify-center">
                    {getWeatherIcon(forecast.weather_code)}
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    {forecast.weather_description}
                  </div>
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Thermometer className="w-4 h-4 text-red-500" />
                      <span className="font-semibold">{forecast.temperature_max}°C</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Thermometer className="w-4 h-4 text-blue-500" />
                      <span>{forecast.temperature_min}°C</span>
                    </div>
                  </div>
                  {forecast.precipitation_probability > 0 && (
                    <div className="flex items-center justify-center gap-1 text-sm text-blue-600">
                      <Droplets className="w-4 h-4" />
                      <span>{forecast.precipitation_probability}% Regen</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
