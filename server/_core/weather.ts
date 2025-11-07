/**
 * Weather service using Open-Meteo API (free, no API key required)
 * https://open-meteo.com/
 */

export interface WeatherForecast {
  date: string;
  temperature_max: number;
  temperature_min: number;
  precipitation_probability: number;
  weather_code: number;
  weather_description: string;
}

export interface WeatherData {
  location: string;
  latitude: number;
  longitude: number;
  forecasts: WeatherForecast[];
}

const WEATHER_CODES: Record<number, string> = {
  0: "Klar",
  1: "Überwiegend klar",
  2: "Teilweise bewölkt",
  3: "Bewölkt",
  45: "Nebel",
  48: "Gefrierender Nebel",
  51: "Leichter Nieselregen",
  53: "Mäßiger Nieselregen",
  55: "Starker Nieselregen",
  61: "Leichter Regen",
  63: "Mäßiger Regen",
  65: "Starker Regen",
  71: "Leichter Schneefall",
  73: "Mäßiger Schneefall",
  75: "Starker Schneefall",
  77: "Schneegriesel",
  80: "Leichte Regenschauer",
  81: "Mäßige Regenschauer",
  82: "Starke Regenschauer",
  85: "Leichte Schneeschauer",
  86: "Starke Schneeschauer",
  95: "Gewitter",
  96: "Gewitter mit leichtem Hagel",
  99: "Gewitter mit starkem Hagel",
};

export async function getWeatherForecast(
  latitude: number,
  longitude: number,
  days: number = 7
): Promise<WeatherData> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&timezone=Europe/Zurich&forecast_days=${days}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    const forecasts: WeatherForecast[] = data.daily.time.map((date: string, index: number) => ({
      date,
      temperature_max: Math.round(data.daily.temperature_2m_max[index]),
      temperature_min: Math.round(data.daily.temperature_2m_min[index]),
      precipitation_probability: data.daily.precipitation_probability_max[index] || 0,
      weather_code: data.daily.weather_code[index],
      weather_description: WEATHER_CODES[data.daily.weather_code[index]] || "Unbekannt",
    }));
    
    return {
      location: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
      latitude,
      longitude,
      forecasts,
    };
  } catch (error) {
    console.error("[Weather] Failed to fetch weather data:", error);
    throw new Error("Wettervorhersage konnte nicht abgerufen werden");
  }
}
