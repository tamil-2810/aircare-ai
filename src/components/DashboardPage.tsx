import React, { useState } from 'react';
import { 
  Activity, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  AlertTriangle, 
  Sun, 
  Wind, 
  Droplets, 
  Info, 
  Calendar, 
  ShieldAlert, 
  UserCheck,
  ChevronDown,
  TrendingDown,
  Clock,
  Search,
  RefreshCw,
  Navigation,
  CheckCircle2,
  Radio,
  Server
} from 'lucide-react';
import { AQIData, UserProfile, PageTab } from '../types';
import { AVAILABLE_CITIES } from '../data/mockData';
import { evaluateRecommendation } from '../services/recommendationEngine';

interface DashboardPageProps {
  aqiData: AQIData;
  userProfile: UserProfile;
  isLoadingAQI?: boolean;
  aqiError?: string | null;
  isRealData?: boolean;
  onNavigate: (tab: PageTab) => void;
  onSelectCity: (city: string) => void;
  onSearchLocation?: (cityName: string, coords?: { latitude: number; longitude: number }) => void;
  onRetry?: () => void;
  onSwitchToDemoMode?: () => void;
  onOpenAQIModal: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  aqiData,
  userProfile,
  isLoadingAQI = false,
  aqiError = null,
  isRealData = true,
  onNavigate,
  onSelectCity,
  onSearchLocation,
  onRetry,
  onSwitchToDemoMode,
  onOpenAQIModal,
}) => {
  const [selectedPollutant, setSelectedPollutant] = useState<string | null>(null);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [geoLocating, setGeoLocating] = useState(false);

  // Dynamic recommendation for the current dashboard station and user profile
  const liveRec = evaluateRecommendation({
    aqi: aqiData.aqi,
    userAge: userProfile.age,
    healthSensitivity: userProfile.healthSensitivity,
    activity: userProfile.preferredActivity,
    duration: userProfile.expectedDuration,
    location: aqiData.location,
    plannedDateTime: 'Today, Current Window',
  });

  const popularCities = [
    { name: 'Coimbatore', tag: 'Primary' },
    { name: 'Chennai', tag: 'Coastal' },
    { name: 'Bengaluru', tag: 'Highland' },
    { name: 'Delhi', tag: 'Capital' },
    { name: 'Mumbai', tag: 'Metro' },
    { name: 'London', tag: 'UK' },
    { name: 'New York', tag: 'US' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (onSearchLocation) {
      onSearchLocation(searchQuery.trim());
    } else {
      onSelectCity(searchQuery.trim());
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLocating(false);
        if (onSearchLocation) {
          onSearchLocation('My Current Location', {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        }
      },
      (err) => {
        setGeoLocating(false);
        console.warn('Geolocation permission denied or timed out:', err);
        onSelectCity('Coimbatore');
      },
      { timeout: 8000 }
    );
  };

  // Status visual attributes
  const getStatusColorConfig = (aqi: number) => {
    if (aqi <= 50) {
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        border: 'border-emerald-200',
        ring: 'stroke-emerald-500',
        status: 'Good',
        description: 'Air quality is satisfactory with minimal air pollution risk.',
      };
    }
    if (aqi <= 100) {
      return {
        bg: 'bg-teal-50',
        text: 'text-teal-900',
        badge: 'bg-teal-100 text-teal-900 border-teal-300',
        border: 'border-teal-200',
        ring: 'stroke-teal-500',
        status: 'Moderate',
        description: 'Acceptable air quality; sensitive people may experience minor irritation.',
      };
    }
    if (aqi <= 150) {
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-900',
        badge: 'bg-amber-100 text-amber-900 border-amber-300',
        border: 'border-amber-200',
        ring: 'stroke-amber-500',
        status: 'Unhealthy for Sensitive Groups',
        description: 'Members of sensitive groups may experience adverse health effects.',
      };
    }
    if (aqi <= 200) {
      return {
        bg: 'bg-orange-50',
        text: 'text-orange-950',
        badge: 'bg-orange-100 text-orange-900 border-orange-300',
        border: 'border-orange-200',
        ring: 'stroke-orange-500',
        status: 'Unhealthy',
        description: 'Everyone may begin to experience health effects; sensitive groups more serious effects.',
      };
    }
    return {
      bg: 'bg-rose-50',
      text: 'text-rose-950',
      badge: 'bg-rose-100 text-rose-900 border-rose-300',
      border: 'border-rose-200',
      ring: 'stroke-rose-600',
      status: 'Very Unhealthy / Hazardous',
      description: 'Health alert: risk of serious health effects for entire population.',
    };
  };

  const statusConfig = getStatusColorConfig(aqiData.aqi);

  // Personalized meaning tailored to user
  const personalizedMeaning = `Given your ${userProfile.healthSensitivity} health sensitivity and ${userProfile.preferredActivity.toLowerCase()} routine, ${aqiData.meaningForYou}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6 text-left">
      
      {/* Search & Location Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Title & Live Status */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
              <span className={`w-2.5 h-2.5 rounded-full ${isLoadingAQI ? 'bg-amber-500 animate-spin' : isRealData ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
              <span>{isLoadingAQI ? 'Connecting to Atmospheric Station...' : isRealData ? 'Live Real-Time Atmospheric Feed' : 'Demo Fallback Telemetry'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black font-['Outfit',sans-serif] text-slate-900">
              {aqiData.location} <span className="text-sm font-normal text-slate-500">({aqiData.country})</span>
            </h1>
          </div>

          {/* Search Form & Geolocation */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="dashboard-search-location-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any city or station (e.g., Coimbatore, London)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 text-sm"
              />
            </div>

            <button
              type="submit"
              id="dashboard-check-air-quality-btn"
              disabled={isLoadingAQI}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-sm shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
            >
              {isLoadingAQI ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>Check Air Quality</span>
            </button>

            <button
              type="button"
              id="dashboard-use-geolocation-btn"
              onClick={handleUseCurrentLocation}
              title="Use Device Location"
              disabled={geoLocating || isLoadingAQI}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors shrink-0"
            >
              <Navigation className={`w-4 h-4 ${geoLocating ? 'animate-bounce text-emerald-600' : ''}`} />
            </button>
          </form>

        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Suggested Stations:</span>
          {popularCities.map((city) => (
            <button
              key={city.name}
              type="button"
              id={`quick-city-${city.name.toLowerCase()}`}
              onClick={() => onSelectCity(city.name)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
                aqiData.location.toLowerCase().includes(city.name.toLowerCase())
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 hover:bg-emerald-50 text-slate-700 border-slate-200 hover:border-emerald-300'
              }`}
            >
              {city.name}
            </button>
          ))}

          <div className="ml-auto text-[11px] text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Last Updated: <strong className="text-slate-700">{aqiData.lastUpdated}</strong></span>
          </div>
        </div>
      </div>

      {/* Loading Overlay or Notification Banner */}
      {isLoadingAQI && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between shadow-xs animate-pulse">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-700 shrink-0" />
            <div>
              <div className="text-sm font-bold">Fetching air-quality data...</div>
              <div className="text-xs text-emerald-700">Analyzing air-quality conditions from global satellite & ground telemetry.</div>
            </div>
          </div>
        </div>
      )}

      {/* Error / Fallback Alert Banner */}
      {aqiError && !isLoadingAQI && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-sm font-bold text-amber-950">
                Unable to retrieve the latest air-quality information.
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                Live data is currently unavailable. You can continue exploring the application using Demo Mode.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            {onRetry && (
              <button
                id="dashboard-retry-btn"
                onClick={onRetry}
                className="px-4 py-2 rounded-xl bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-bold text-xs shadow-2xs transition-colors"
              >
                Try Again
              </button>
            )}
            {onSwitchToDemoMode && (
              <button
                id="dashboard-switch-demo-btn"
                onClick={onSwitchToDemoMode}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Switch to Demo Mode
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Grid: Left (Large AQI Score Card) & Right (Pollutants & Weather) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* Left Column: Large AQI Score Card (Lg: 5 cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <div className={`p-6 sm:p-8 rounded-3xl border ${statusConfig.border} ${statusConfig.bg} shadow-sm flex flex-col justify-between h-full relative overflow-hidden text-left`}>
            
            {/* Top info badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Air Quality Index
                </span>
                <button 
                  onClick={onOpenAQIModal} 
                  title="Learn about AQI calculations"
                  className="text-slate-400 hover:text-slate-700 p-0.5"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.badge}`}>
                {aqiData.status}
              </span>
            </div>

            {/* Big Score Visual */}
            <div className="my-8 flex flex-col items-center justify-center text-center">
              <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center">
                {/* SVG Progress Circle */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-slate-200"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className={`${statusConfig.ring} transition-all duration-1000 ease-out`}
                    strokeWidth="8"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * Math.min(aqiData.aqi, 300)) / 300}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                {/* Score Number in center */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-5xl sm:text-6xl font-black font-['Outfit',sans-serif] tracking-tight text-slate-900">
                    {aqiData.aqi}
                  </span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                    US AQI
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-xl font-extrabold text-slate-900 font-['Outfit',sans-serif]">
                  {aqiData.status}
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-xs">
                  {statusConfig.description}
                </p>
              </div>
            </div>

            {/* Bottom Primary Pollutant & Refresh info */}
            <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
              <div>
                Main Pollutant: <span className="font-bold text-slate-800">{aqiData.primaryPollutant} (120 µg/m³)</span>
              </div>
              <div>
                Updated: <span className="font-medium text-slate-700">Just now</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Main Pollutants & Environmental Conditions (Lg: 7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          
          {/* Main Pollutants Grid */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 text-left">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>Main Pollutants Breakdown</span>
              </h2>
              <span className="text-xs text-slate-500 font-medium">WHO Safe Benchmarks</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* PM2.5 Card */}
              <div 
                id="pollutant-pm25-card"
                className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200 hover:border-orange-300 transition-all text-left"
              >
                <div className="flex items-center justify-between text-xs text-orange-900 font-semibold mb-1">
                  <span>PM2.5</span>
                  <span className="px-1.5 py-0.5 rounded bg-orange-200/80 text-[10px] font-bold">Unhealthy</span>
                </div>
                <div className="text-2xl font-black font-['Outfit',sans-serif] text-slate-900">
                  {aqiData.pollutants.pm25.value} <span className="text-xs font-normal text-slate-500">µg/m³</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                  Fine inhalable particles penetrating deep into lungs & bloodstream.
                </p>
                <div className="text-[10px] text-orange-800 font-semibold mt-2 pt-1 border-t border-orange-200/60">
                  Safe Limit: {aqiData.pollutants.pm25.safeLimit}
                </div>
              </div>

              {/* PM10 Card */}
              <div 
                id="pollutant-pm10-card"
                className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 hover:border-amber-300 transition-all text-left"
              >
                <div className="flex items-center justify-between text-xs text-amber-900 font-semibold mb-1">
                  <span>PM10</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-200/80 text-[10px] font-bold">Unhealthy</span>
                </div>
                <div className="text-2xl font-black font-['Outfit',sans-serif] text-slate-900">
                  {aqiData.pollutants.pm10.value} <span className="text-xs font-normal text-slate-500">µg/m³</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                  Coarse dust & smoke affecting upper respiratory passages.
                </p>
                <div className="text-[10px] text-amber-800 font-semibold mt-2 pt-1 border-t border-amber-200/60">
                  Safe Limit: {aqiData.pollutants.pm10.safeLimit}
                </div>
              </div>

              {/* O3 Card */}
              <div 
                id="pollutant-o3-card"
                className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 hover:border-emerald-300 transition-all text-left"
              >
                <div className="flex items-center justify-between text-xs text-emerald-900 font-semibold mb-1">
                  <span>O₃ (Ozone)</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-200/80 text-[10px] font-bold">Good</span>
                </div>
                <div className="text-2xl font-black font-['Outfit',sans-serif] text-slate-900">
                  {aqiData.pollutants.o3.value} <span className="text-xs font-normal text-slate-500">ppb</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                  Ground level ozone remains low and non-reactive today.
                </p>
                <div className="text-[10px] text-emerald-800 font-semibold mt-2 pt-1 border-t border-emerald-200/60">
                  Safe Limit: {aqiData.pollutants.o3.safeLimit}
                </div>
              </div>
            </div>
          </div>

          {/* Weather & Meteorological Conditions */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 text-left">
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Local Weather & Dispersion Conditions</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center sm:text-left">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium">Temperature</span>
                <div className="text-lg font-bold text-slate-900 mt-0.5">{aqiData.weather.temp}°C</div>
                <span className="text-[10px] text-slate-500">Warm & Hazy</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium">Humidity</span>
                <div className="text-lg font-bold text-slate-900 mt-0.5">{aqiData.weather.humidity}%</div>
                <span className="text-[10px] text-slate-500">Trapping Moisture</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium">Wind Speed</span>
                <div className="text-lg font-bold text-slate-900 mt-0.5">{aqiData.weather.windSpeed} km/h</div>
                <span className="text-[10px] text-slate-500">Low Dispersion</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium">UV Index</span>
                <div className="text-lg font-bold text-slate-900 mt-0.5">{aqiData.weather.uvIndex} (High)</div>
                <span className="text-[10px] text-slate-500">Sun Protection</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Highly Visible Section: "What Does This Mean for You?" */}
      <section 
        id="what-does-this-mean-section"
        className="rounded-3xl bg-linear-to-br from-amber-500/10 via-emerald-500/5 to-teal-500/10 border-2 border-amber-300 p-6 sm:p-8 shadow-md text-left relative overflow-hidden"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-extrabold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Personalized Health Impact</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold font-['Outfit',sans-serif] text-slate-900">
              What Does This Mean for You?
            </h2>

            <div className="mt-3 text-lg sm:text-xl font-bold text-amber-950 flex items-start gap-2.5">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <span>“{liveRec.recommendationStatus === 'CONSIDER POSTPONING' ? 'Consider reducing prolonged outdoor exposure.' : liveRec.personalizedExplanation}”</span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                liveRec.recommendationStatus === 'CONSIDER POSTPONING' ? 'bg-rose-100 text-rose-900 border border-rose-300' :
                liveRec.recommendationStatus === 'REDUCE OUTDOOR EXPOSURE' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                'bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}>
                {liveRec.recommendationStatus === 'CONSIDER POSTPONING' ? '🔴 CONSIDER POSTPONING' :
                 liveRec.recommendationStatus === 'REDUCE OUTDOOR EXPOSURE' ? '🟡 REDUCE OUTDOOR EXPOSURE' :
                 '🟢 PROCEED'}
              </span>
              <span className="text-xs text-slate-600 font-medium">
                For {userProfile.name} • {userProfile.healthSensitivity} sensitivity • {userProfile.preferredActivity} ({userProfile.expectedDuration})
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-700 leading-relaxed">
              {liveRec.personalizedExplanation}
            </p>
          </div>

          {/* Action CTA Button */}
          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
            <button
              id="get-personalized-advice-btn"
              onClick={() => onNavigate('recommendation')}
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-linear-to-r from-emerald-600 via-teal-600 to-slate-900 hover:from-emerald-700 hover:to-slate-950 text-white font-extrabold text-base shadow-lg shadow-emerald-600/30 hover:-translate-y-0.5 transition-all"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>Get Personalized Advice</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              id="dashboard-plan-activity-shortcut-btn"
              onClick={() => onNavigate('planner')}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-300 hover:border-emerald-400 text-slate-800 text-xs font-bold shadow-xs transition-colors"
            >
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Plan Tomorrow&apos;s Workout</span>
            </button>
          </div>
        </div>
      </section>

      {/* Forecast Cards Section */}
      <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-xl font-extrabold font-['Outfit',sans-serif] text-slate-900">
              Air Quality Forecast Windows
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Anticipate diurnal air shifts and identify the cleanest outdoor hours.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <TrendingDown className="w-4 h-4 text-emerald-600" />
            <span>Tomorrow Morning is ~50% cleaner</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Today */}
          <div 
            id="forecast-card-today"
            className="p-5 rounded-2xl bg-orange-50/60 border border-orange-200/90 text-left flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-900">Today</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-200/90 text-orange-950">
                  Unhealthy
                </span>
              </div>
              <div className="text-3xl font-black font-['Outfit',sans-serif] text-slate-900">
                AQI 165
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Stagnant afternoon conditions and traffic accumulation.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-orange-200/60 text-xs font-semibold text-orange-950">
              Advisory: Limit high-intensity cardio outdoors.
            </div>
          </div>

          {/* Card 2: Tomorrow Morning */}
          <div 
            id="forecast-card-tomorrow-morning"
            className="p-5 rounded-2xl bg-emerald-50/70 border-2 border-emerald-400 text-left flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow relative overflow-hidden"
          >
            <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold uppercase tracking-wider">
              Optimal Window
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                  Tomorrow Morning
                </span>
              </div>
              <div className="text-3xl font-black font-['Outfit',sans-serif] text-emerald-800">
                AQI 82
              </div>
              <p className="text-xs text-slate-600 mt-2">
                6:00 AM – 8:30 AM: Cool breeze and lower emissions create favorable conditions.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-emerald-200 text-xs font-bold text-emerald-800 flex items-center justify-between">
              <span>Best for Running & Walking</span>
              <button 
                onClick={() => onNavigate('planner')} 
                className="text-emerald-700 underline text-[11px] hover:text-emerald-900"
              >
                Plan this slot →
              </button>
            </div>
          </div>

          {/* Card 3: Tomorrow Evening */}
          <div 
            id="forecast-card-tomorrow-evening"
            className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/90 text-left flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Tomorrow Evening
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-200/90 text-amber-950">
                  Moderate / Sensitive
                </span>
              </div>
              <div className="text-3xl font-black font-['Outfit',sans-serif] text-slate-900">
                AQI 120
              </div>
              <p className="text-xs text-slate-600 mt-2">
                6:00 PM – 9:00 PM: Evening traffic increases particulate concentrations.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-amber-200/60 text-xs font-semibold text-amber-950">
              Advisory: Moderate exposure; sensitive members wear mask.
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
