import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, CloudRain, Sun, Wind, Droplets, Eye, Gauge } from "lucide-react";
import { useI18n } from "@/contexts/i18nContext";

interface OpenWeatherData {
  temp: number;
  feelsLike: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  windGust?: number;
  pressure: number;
  visibility: number;
  cloudCover: number;
  precipitation?: number;
  icon: string;
  sunrise?: string;
  sunset?: string;
}

interface OpenWeatherWidgetProps {
  latitude?: number;
  longitude?: number;
  tripDate?: Date;
}

export function OpenWeatherWidget({ latitude, longitude, tripDate }: OpenWeatherWidgetProps) {
  const { t } = useI18n();
  const [weather, setWeather] = useState<OpenWeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!latitude || !longitude) return;

    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY || process.env.OPENWEATHER_API_KEY;

        if (!apiKey) {
          console.warn("OpenWeather API key not configured, using fallback");
          return;
        }

        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}&lang=de`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch weather from OpenWeather");
        }

        const data = await response.json();

        setWeather({
          temp: Math.round(data.main.temp),
          feelsLike: Math.round(data.main.feels_like),
          condition: data.weather[0].main,
          humidity: data.main.humidity,
          windSpeed: Math.round(data.wind.speed),
          windGust: data.wind.gust ? Math.round(data.wind.gust) : undefined,
          pressure: data.main.pressure,
          visibility: Math.round(data.visibility / 1000),
          cloudCover: data.clouds.all,
          precipitation: data.rain?.["1h"] || undefined,
          icon: getWeatherIcon(data.weather[0].icon),
          sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString("de-CH", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString("de-CH", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
      } catch (err) {
        console.warn("Could not load OpenWeather data:", err);
        // Fallback to Open-Meteo is handled in TripDetail component
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [latitude, longitude]);

  if (!latitude || !longitude || !weather) return null;

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-sky-50 dark:from-slate-900 dark:to-slate-800">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <span>{weather.icon}</span>
          {t("tripDetail.weather")} - {weather.condition}
        </CardTitle>
        {tripDate && (
          <CardDescription>
            {new Date(tripDate).toLocaleDateString("de-CH", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {loading && <p className="text-muted-foreground">{t("common.loading")}</p>}
        {error && <p className="text-destructive text-sm">{error}</p>}
        {weather && (
          <div className="space-y-4">
            {/* Temperature Section */}
            <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg">
              <div>
                <p className="text-4xl font-bold text-blue-600">{weather.temp}°</p>
                <p className="text-sm text-muted-foreground">
                  Gefühlte Temperatur: {weather.feelsLike}°
                </p>
              </div>
              <Sun className="w-12 h-12 text-yellow-500" />
            </div>

            {/* Main Weather Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Humidity */}
              <div className="flex items-center gap-2 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                <Droplets className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Luftfeuchtigkeit</p>
                  <p className="font-semibold">{weather.humidity}%</p>
                </div>
              </div>

              {/* Wind Speed */}
              <div className="flex items-center gap-2 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                <Wind className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Windgeschwindigkeit</p>
                  <p className="font-semibold">{weather.windSpeed} km/h</p>
                </div>
              </div>

              {/* Visibility */}
              <div className="flex items-center gap-2 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                <Eye className="w-5 h-5 text-purple-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Sichtweite</p>
                  <p className="font-semibold">{weather.visibility} km</p>
                </div>
              </div>

              {/* Pressure */}
              <div className="flex items-center gap-2 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                <Gauge className="w-5 h-5 text-green-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Luftdruck</p>
                  <p className="font-semibold">{weather.pressure} hPa</p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-2 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
              {weather.windGust && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Windböen:</span>
                  <span className="font-semibold">{weather.windGust} km/h</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Wolkenbedeckung:</span>
                <span className="font-semibold">{weather.cloudCover}%</span>
              </div>
              {weather.precipitation && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Niederschlag (1h):</span>
                  <span className="font-semibold">{weather.precipitation} mm</span>
                </div>
              )}
              {weather.sunrise && weather.sunset && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sonnenaufgang:</span>
                    <span className="font-semibold">{weather.sunrise}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sonnenuntergang:</span>
                    <span className="font-semibold">{weather.sunset}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getWeatherIcon(iconCode: string): string {
  // OpenWeather icon codes
  if (iconCode.startsWith("01")) return "☀️"; // Clear
  if (iconCode.startsWith("02")) return "⛅"; // Few clouds
  if (iconCode.startsWith("03")) return "☁️"; // Scattered clouds
  if (iconCode.startsWith("04")) return "☁️"; // Broken clouds
  if (iconCode.startsWith("09")) return "🌧️"; // Shower rain
  if (iconCode.startsWith("10")) return "🌧️"; // Rain
  if (iconCode.startsWith("11")) return "⛈️"; // Thunderstorm
  if (iconCode.startsWith("13")) return "❄️"; // Snow
  if (iconCode.startsWith("50")) return "🌫️"; // Mist/Fog
  return "🌤️";
}
