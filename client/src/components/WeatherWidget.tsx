import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, CloudRain, Sun, Wind, Droplets } from "lucide-react";
import { useI18n } from "@/contexts/i18nContext";

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

interface WeatherWidgetProps {
  latitude?: number;
  longitude?: number;
  tripDate?: Date;
}

export function WeatherWidget({ latitude, longitude, tripDate }: WeatherWidgetProps) {
  const { t } = useI18n();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!latitude || !longitude) return;

    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        // Using Open-Meteo API (free, no API key required)
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&timezone=auto`
        );

        if (!response.ok) throw new Error("Failed to fetch weather");

        const data = await response.json();
        const current = data.current;

        setWeather({
          temp: Math.round(current.temperature_2m),
          condition: getWeatherCondition(current.weather_code),
          humidity: current.relative_humidity_2m,
          windSpeed: Math.round(current.wind_speed_10m),
          icon: getWeatherIcon(current.weather_code),
        });
      } catch (err) {
        setError("Could not load weather data");
        console.error("Weather fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [latitude, longitude]);

  if (!latitude || !longitude) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Aktuelles Wetter</CardTitle>
        {tripDate && (
          <CardDescription>
            {new Date(tripDate).toLocaleDateString()}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {loading && <p className="text-muted-foreground">{t("common.loading")}</p>}
        {error && <p className="text-destructive text-sm">{error}</p>}
        {weather && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sun className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-3xl font-bold">{weather.temp}°</p>
                  <p className="text-sm text-muted-foreground">{t(weather.condition)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Luftfeuchtigkeit</p>
                  <p className="font-semibold">{weather.humidity}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Wind</p>
                  <p className="font-semibold">{weather.windSpeed} km/h</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getWeatherCondition(code: number): string {
  if (code === 0 || code === 1) return "weather.clear";
  if (code === 2) return "weather.partlyCloudy";
  if (code === 3) return "weather.overcast";
  if (code >= 45 && code <= 48) return "weather.foggy";
  if (code >= 51 && code <= 67) return "weather.drizzle";
  if (code >= 80 && code <= 82) return "weather.showers";
  if (code >= 85 && code <= 86) return "weather.snowShowers";
  if (code >= 71 && code <= 77) return "weather.snow";
  if (code >= 80 && code <= 99) return "weather.thunderstorm";
  return "weather.unknown";
}

function getWeatherIcon(code: number): string {
  if (code === 0 || code === 1) return "☀️";
  if (code === 2 || code === 3) return "☁️";
  if (code >= 45 && code <= 48) return "🌫️";
  if (code >= 51 && code <= 67) return "🌧️";
  if (code >= 71 && code <= 77) return "❄️";
  if (code >= 80 && code <= 82) return "⛈️";
  return "🌤️";
}
