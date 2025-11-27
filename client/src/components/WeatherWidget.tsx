import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, CloudRain, Sun, Wind, Droplets } from "lucide-react";
import { useI18n } from "@/contexts/i18nContext";
import { format, addDays } from 'date-fns';
import { de } from 'date-fns/locale';

interface DailyForecast {
  date: string;
  maxTemp: number;
  minTemp: number;
  condition: string;
  icon: string;
}

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  forecast: DailyForecast[];
}

interface WeatherWidgetProps {
  latitude?: number;
  longitude?: number;
  tripDate?: Date; // Original trip date, can be used for context, but forecast is from today
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
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
        );

        if (!response.ok) throw new Error("Failed to fetch weather");

        const data = await response.json();
        const current = data.current;
        const daily = data.daily;

        const forecast: DailyForecast[] = daily.time.map((dateString: string, index: number) => ({
          date: dateString,
          maxTemp: Math.round(daily.temperature_2m_max[index]),
          minTemp: Math.round(daily.temperature_2m_min[index]),
          condition: getWeatherCondition(daily.weather_code[index]),
          icon: getWeatherIcon(daily.weather_code[index]),
        }));

        setWeather({
          temp: Math.round(current.temperature_2m),
          condition: getWeatherCondition(current.weather_code),
          humidity: current.relative_humidity_2m,
          windSpeed: Math.round(current.wind_speed_10m),
          icon: getWeatherIcon(current.weather_code),
          forecast: forecast,
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
        <CardTitle className="text-lg">{t("weather.currentWeather")}</CardTitle>
        {tripDate && (
          <CardDescription>
            {format(new Date(tripDate), 'PPP', { locale: de })}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {loading && <p className="text-muted-foreground">{t("common.loading")}</p>}
        {error && <p className="text-destructive text-sm">{error}</p>}
        {weather && (
          <div className="space-y-6">
            {/* Current Weather */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-5xl">{weather.icon}</span>
                <div>
                  <p className="text-4xl font-bold">{weather.temp}°C</p>
                  <p className="text-sm text-muted-foreground">{t(weather.condition)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-muted-foreground">{t("weather.humidity")}</p>
                  <p className="font-semibold">{weather.humidity}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-muted-foreground">{t("weather.wind")}</p>
                  <p className="font-semibold">{weather.windSpeed} km/h</p>
                </div>
              </div>
            </div>

            {/* 7-Day Forecast */}
            <div className="pt-4 border-t border-border">
              <h3 className="text-lg font-semibold mb-3">{t("weather.7dayForecast")}</h3>
              <div className="space-y-3">
                {weather.forecast.map((day, index) => (
                  <div key={day.date} className="flex items-center justify-between border-b last:border-b-0 py-2">
                    <span className="text-sm font-medium w-1/4">
                      {index === 0 ? t("weather.today") : format(addDays(new Date(), index), 'EEE', { locale: de })}
                    </span>
                    <span className="text-xl w-1/6 text-center">{day.icon}</span>
                    <span className="text-sm w-1/4 text-right">
                      {day.maxTemp}° / {day.minTemp}°
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getWeatherCondition(code: number): string {
  // Mapping Open-Meteo weather codes to i18n keys
  if (code === 0 || code === 1) return "weather.clear"; // Clear sky
  if (code === 2) return "weather.partlyCloudy"; // Partly cloudy
  if (code === 3) return "weather.overcast"; // Overcast
  if (code >= 45 && code <= 48) return "weather.foggy"; // Fog and depositing rime fog
  if (code >= 51 && code <= 55) return "weather.drizzle"; // Drizzle
  if (code >= 56 && code <= 57) return "weather.freezingDrizzle"; // Freezing Drizzle
  if (code >= 61 && code <= 65) return "weather.rain"; // Rain
  if (code >= 66 && code <= 67) return "weather.freezingRain"; // Freezing Rain
  if (code >= 71 && code <= 75) return "weather.snow"; // Snow fall
  if (code === 77) return "weather.snowGrains"; // Snow grains
  if (code >= 80 && code <= 82) return "weather.showers"; // Rain showers
  if (code >= 85 && code <= 86) return "weather.snowShowers"; // Snow showers
  if (code >= 95 && code <= 96) return "weather.thunderstorm"; // Thunderstorm
  if (code === 99) return "weather.thunderstormWithHail"; // Thunderstorm with slight and heavy hail
  return "weather.unknown";
}

function getWeatherIcon(code: number): string {
  // Mapping Open-Meteo weather codes to emojis
  if (code === 0 || code === 1) return "☀️"; // Clear sky
  if (code === 2) return "🌤️"; // Partly cloudy
  if (code === 3) return "☁️"; // Overcast
  if (code >= 45 && code <= 48) return "🌫️"; // Fog
  if (code >= 51 && code <= 55) return "🌧️"; // Drizzle
  if (code >= 56 && code <= 57) return "🌧️🧊"; // Freezing Drizzle
  if (code >= 61 && code <= 65) return "☔"; // Rain
  if (code >= 66 && code <= 67) return "☔🧊"; // Freezing Rain
  if (code >= 71 && code <= 75) return "❄️"; // Snow fall
  if (code === 77) return "🌨️"; // Snow grains
  if (code >= 80 && code <= 82) return "🌧️"; // Rain showers
  if (code >= 85 && code <= 86) return "🌨️"; // Snow showers
  if (code >= 95 && code <= 96) return "⛈️"; // Thunderstorm
  if (code === 99) return "⛈️"; // Thunderstorm with hail
  return "❓"; // Unknown
}
