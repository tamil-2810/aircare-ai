import { AQIData, PollutantInfo, ForecastSlot } from '../types';
import { INITIAL_AQI_DATA, AVAILABLE_CITIES } from '../data/mockData';

export interface LocationSearchResult {
  name: string;
  country: string;
  admin1?: string; // State / Region
  latitude: number;
  longitude: number;
}

export interface FetchAirQualityResponse {
  success: boolean;
  data: AQIData;
  dataSource: 'open-meteo-live' | 'waqi-live' | 'mock-fallback';
  isRealData: boolean;
  message?: string;
}

/**
 * Calculates US AQI category string based on numeric value
 */
export function getAQICategoryLabel(aqi: number): AQIData['status'] {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

/**
 * Computes personalized summary text for an AQI value
 */
export function getAQIMeaningForYou(aqi: number): string {
  if (aqi <= 50) {
    return 'Ideal air quality for outdoor training and family activities.';
  }
  if (aqi <= 100) {
    return 'Acceptable conditions; sensitive individuals should monitor prolonged cardio.';
  }
  if (aqi <= 150) {
    return 'Sensitive groups and endurance runners should reduce prolonged outdoor exposure.';
  }
  if (aqi <= 200) {
    return 'Consider reducing prolonged outdoor exposure.';
  }
  return 'Health warning: Avoid strenuous outdoor activities and use HEPA air purifiers.';
}

/**
 * Search locations using Open-Meteo Geocoding API
 */
export async function searchLocations(query: string): Promise<LocationSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) {
    return [];
  }

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      trimmed
    )}&count=6&language=en&format=json`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Geocoding server responded with status: ${res.status}`);
    }

    const data = await res.json();
    if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
      // Check local curated cities list
      const matched = AVAILABLE_CITIES.filter((c) =>
        c.name.toLowerCase().includes(trimmed.toLowerCase())
      );
      return matched.map((c) => ({
        name: c.name,
        country: 'India',
        latitude: c.name === 'Coimbatore' ? 11.0055 : 13.0827,
        longitude: c.name === 'Coimbatore' ? 76.9661 : 80.2707,
      }));
    }

    return data.results.map((item: any) => ({
      name: item.name,
      country: item.country || '',
      admin1: item.admin1 || '',
      latitude: item.latitude,
      longitude: item.longitude,
    }));
  } catch (error) {
    console.warn('Geocoding search error, falling back to predefined list:', error);
    return AVAILABLE_CITIES.filter((c) =>
      c.name.toLowerCase().includes(trimmed.toLowerCase())
    ).map((c) => ({
      name: c.name,
      country: 'India',
      latitude: 11.0055,
      longitude: 76.9661,
    }));
  }
}

/**
 * Fetch Live Real Air Quality Data for a given city / coordinates
 */
export async function fetchAirQualityByLocation(
  cityName: string,
  coords?: { latitude: number; longitude: number }
): Promise<FetchAirQualityResponse> {
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. Resolve coordinates if not provided
  let lat = coords?.latitude;
  let lon = coords?.longitude;
  let resolvedCountry = 'India';

  if (lat === undefined || lon === undefined) {
    const locations = await searchLocations(cityName);
    if (locations.length > 0) {
      lat = locations[0].latitude;
      lon = locations[0].longitude;
      resolvedCountry = locations[0].country || 'India';
    } else {
      // Coordinate fallback for popular demo cities
      if (cityName.toLowerCase().includes('coimbatore')) {
        lat = 11.0055;
        lon = 76.9661;
      } else if (cityName.toLowerCase().includes('chennai')) {
        lat = 13.0827;
        lon = 80.2707;
      } else if (cityName.toLowerCase().includes('bengaluru') || cityName.toLowerCase().includes('bangalore')) {
        lat = 12.9716;
        lon = 77.5946;
      } else if (cityName.toLowerCase().includes('delhi')) {
        lat = 28.6139;
        lon = 77.209;
      } else {
        // Return clear error if location not found
        return {
          success: false,
          data: {
            ...INITIAL_AQI_DATA,
            location: cityName,
            lastUpdated: `Failed at ${timeString}`,
          },
          dataSource: 'mock-fallback',
          isRealData: false,
          message: `Location "${cityName}" not found. Please verify the city name or select from suggested stations.`,
        };
      }
    }
  }

  // 2. Fetch from Live Open-Meteo Air Quality Model
  try {
    const apiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone&hourly=us_aqi,pm2_5,pm10&timezone=auto&forecast_days=3`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Open-Meteo Air Quality API returned HTTP ${response.status}`);
    }

    const json = await response.json();
    const current = json.current;
    if (!current) {
      throw new Error('No current air quality telemetry in response payload');
    }

    const currentAQI = Math.round(current.us_aqi ?? (current.pm2_5 ? current.pm2_5 * 1.5 : 120));
    const status = getAQICategoryLabel(currentAQI);
    const pm25Val = Math.round((current.pm2_5 ?? 45) * 10) / 10;
    const pm10Val = Math.round((current.pm10 ?? 75) * 10) / 10;
    const o3Val = Math.round((current.ozone ?? 24) * 10) / 10;
    const no2Val = Math.round((current.nitrogen_dioxide ?? 35) * 10) / 10;
    const coVal = Math.round(((current.carbon_monoxide ?? 450) / 1000) * 10) / 10;

    // Construct 3-slot Forecast from Hourly Data
    const hourlyTimes: string[] = json.hourly?.time || [];
    const hourlyAQI: number[] = json.hourly?.us_aqi || [];

    // Tomorrow morning (index approx ~24 + 6 = 30)
    const tmrwMorningAQI = hourlyAQI[30] ? Math.round(hourlyAQI[30]) : Math.max(40, Math.round(currentAQI * 0.55));
    // Tomorrow evening (index approx ~24 + 19 = 43)
    const tmrwEveningAQI = hourlyAQI[43] ? Math.round(hourlyAQI[43]) : Math.round(currentAQI * 0.8);
    // Day after tomorrow
    const dayAfterAQI = hourlyAQI[54] ? Math.round(hourlyAQI[54]) : Math.max(50, Math.round(currentAQI * 0.65));

    const forecast: ForecastSlot[] = [
      {
        id: 'f-live-today',
        label: 'Today',
        timeRange: 'Current Window',
        aqi: currentAQI,
        status,
        temp: 30,
        condition: 'Active Telemetry',
        recommendationSnippet: currentAQI > 150 ? 'Avoid intense outdoor cardio during peak smog.' : 'Safe for moderate physical activities.',
      },
      {
        id: 'f-live-tmrw-morn',
        label: 'Tomorrow Morning',
        timeRange: '6:00 AM – 8:30 AM',
        aqi: tmrwMorningAQI,
        status: getAQICategoryLabel(tmrwMorningAQI),
        temp: 23,
        condition: 'Cool Morning Air',
        recommendationSnippet: 'Best window for running, walking & outdoor sports.',
      },
      {
        id: 'f-live-tmrw-eve',
        label: 'Tomorrow Evening',
        timeRange: '6:00 PM – 9:00 PM',
        aqi: tmrwEveningAQI,
        status: getAQICategoryLabel(tmrwEveningAQI),
        temp: 27,
        condition: 'Evening Traffic Dispersion',
        recommendationSnippet: 'Moderate outdoor exposure; sensitive individuals use mask.',
      },
      {
        id: 'f-live-dayafter',
        label: 'Day After Tomorrow',
        timeRange: 'Full Day Outlook',
        aqi: dayAfterAQI,
        status: getAQICategoryLabel(dayAfterAQI),
        temp: 26,
        condition: 'Dispersive Winds',
        recommendationSnippet: 'Air dispersion improves after thermal inversion lifts.',
      },
    ];

    const resultData: AQIData = {
      location: cityName,
      country: resolvedCountry,
      aqi: currentAQI,
      status,
      primaryPollutant: pm25Val > pm10Val * 0.6 ? 'PM2.5' : 'PM10',
      pollutants: {
        pm25: {
          name: 'PM2.5',
          value: pm25Val,
          unit: 'µg/m³',
          status: pm25Val <= 12 ? 'Good' : pm25Val <= 35.4 ? 'Moderate' : pm25Val <= 55.4 ? 'Unhealthy for Sensitive' : 'Unhealthy',
          description: 'Fine inhalable particles with aerodynamic diameter ≤ 2.5 µm that penetrate deep into pulmonary alveoli.',
          safeLimit: '< 15 µg/m³',
        },
        pm10: {
          name: 'PM10',
          value: pm10Val,
          unit: 'µg/m³',
          status: pm10Val <= 54 ? 'Good' : pm10Val <= 154 ? 'Moderate' : 'Unhealthy',
          description: 'Coarse particulate dust, construction debris, and vehicular soot affecting upper respiratory airways.',
          safeLimit: '< 45 µg/m³',
        },
        o3: {
          name: 'O₃ (Ozone)',
          value: o3Val,
          unit: 'ppb',
          status: o3Val <= 54 ? 'Good' : 'Moderate',
          description: 'Ground-level photochemical oxidant generated by vehicle exhaust and solar radiation.',
          safeLimit: '< 50 ppb',
        },
        no2: {
          name: 'NO₂ (Nitrogen Dioxide)',
          value: no2Val,
          unit: 'ppb',
          status: no2Val <= 53 ? 'Good' : 'Moderate',
          description: 'Combustion byproduct from heavy diesel engines and industrial power plants.',
          safeLimit: '< 53 ppb',
        },
        co: {
          name: 'CO (Carbon Monoxide)',
          value: coVal,
          unit: 'ppm',
          status: coVal <= 4.4 ? 'Good' : 'Moderate',
          description: 'Colorless, odorless gas emitted by incomplete vehicular fuel combustion.',
          safeLimit: '< 9.0 ppm',
        },
      },
      forecast,
      lastUpdated: `Live at ${timeString}`,
      weather: {
        temp: 29,
        humidity: 64,
        windSpeed: 9.2,
        uvIndex: 7,
        condition: currentAQI > 150 ? 'Hazy Smog' : currentAQI > 100 ? 'Partly Hazy' : 'Clear & Fresh',
      },
      meaningForYou: getAQIMeaningForYou(currentAQI),
    };

    return {
      success: true,
      data: resultData,
      dataSource: 'open-meteo-live',
      isRealData: true,
      message: `Retrieved live air-quality observations for ${cityName} (${lat.toFixed(2)}°, ${lon.toFixed(2)}°).`,
    };
  } catch (error) {
    console.warn(`Live API error for ${cityName}, falling back to curated data:`, error);
    
    // Robust mock fallback
    const matchedCity = AVAILABLE_CITIES.find(
      (c) => c.name.toLowerCase() === cityName.toLowerCase()
    );
    const fallbackAQI = matchedCity ? matchedCity.currentAQI : 165;
    const fallbackStatus = getAQICategoryLabel(fallbackAQI);

    const fallbackData: AQIData = {
      ...INITIAL_AQI_DATA,
      location: cityName,
      country: resolvedCountry,
      aqi: fallbackAQI,
      status: fallbackStatus,
      meaningForYou: getAQIMeaningForYou(fallbackAQI),
      lastUpdated: `Demo Fallback (${timeString})`,
    };

    return {
      success: true,
      data: fallbackData,
      dataSource: 'mock-fallback',
      isRealData: false,
      message: `Live data network timeout. Displaying realistic benchmark observations for ${cityName}.`,
    };
  }
}

/**
 * Parses user-selected date and time to find diurnal forecast slot and calculate target AQI
 */
export async function fetchForecastForActivity(
  destination: string,
  dateStr: string,
  timeStr: string
): Promise<{
  targetAQI: number;
  category: AQIData['status'];
  resolvedLocation: string;
  hourlySlots: {
    timeSlot: string;
    aqi: number;
    category: AQIData['status'];
  }[];
}> {
  // 1. Fetch base AQI for destination
  const aqiRes = await fetchAirQualityByLocation(destination);
  const baseAQI = aqiRes.success ? aqiRes.data.aqi : 155;

  // 2. Diurnal multiplier pattern based on hour of day
  // - Dawn/Early morning (5:00 AM - 7:30 AM): Cleanest window due to night cooling and lower vehicular traffic (multiplier ~0.55 - 0.65)
  // - Morning rush (8:00 AM - 10:30 AM): Multiplier ~0.85 - 1.05
  // - Midday / Afternoon Solar Peak (12:00 PM - 3:30 PM): Worst ozone & photochemical smog (multiplier ~1.15 - 1.40)
  // - Evening rush (5:00 PM - 7:00 PM): Multiplier ~1.00 - 1.20
  // - Late Night (8:00 PM - 11:00 PM): Multiplier ~0.70 - 0.85
  const getMultiplierForTime = (time: string): number => {
    const lower = time.toLowerCase();
    if (lower.includes('5:') || lower.includes('6:') || lower.includes('6:00') || lower.includes('6:30')) return 0.58;
    if (lower.includes('7:') || lower.includes('7:00') || lower.includes('7:30')) return 0.70;
    if (lower.includes('8:') || lower.includes('9:') || lower.includes('10:')) return 0.95;
    if (lower.includes('11:') || lower.includes('12:') || lower.includes('1:') || lower.includes('2:') || lower.includes('3:')) return 1.35;
    if (lower.includes('4:') || lower.includes('5:00') || lower.includes('5:30') || lower.includes('6:00 pm')) return 1.15;
    if (lower.includes('7:00 pm') || lower.includes('7:30 pm') || lower.includes('8:')) return 0.80;
    if (lower.includes('9:') || lower.includes('10:')) return 0.75;
    return 1.0;
  };

  const selectedMultiplier = getMultiplierForTime(timeStr);
  const targetAQI = Math.max(30, Math.round(baseAQI * selectedMultiplier));

  // Multi-hour forecast comparison slots
  const standardSlots = [
    '6:00 AM',
    '7:30 AM',
    '9:00 AM',
    '1:00 PM',
    '5:30 PM',
    '7:00 PM',
    '8:30 PM',
  ];

  const hourlySlots = standardSlots.map((slot) => {
    const mult = getMultiplierForTime(slot);
    const aqi = Math.max(30, Math.round(baseAQI * mult));
    return {
      timeSlot: slot,
      aqi,
      category: getAQICategoryLabel(aqi),
    };
  });

  return {
    targetAQI,
    category: getAQICategoryLabel(targetAQI),
    resolvedLocation: aqiRes.data.location || destination,
    hourlySlots,
  };
}
