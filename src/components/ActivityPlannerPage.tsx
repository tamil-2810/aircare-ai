import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Activity, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  RotateCcw,
  Zap,
  CheckCircle2,
  BookmarkPlus
} from 'lucide-react';
import { ActivityType, ActivityPlan, UserProfile, PageTab } from '../types';

interface ActivityPlannerPageProps {
  userProfile: UserProfile;
  currentDestination: string;
  isLoadingAQI?: boolean;
  onCheckAirQuality: (planData: {
    activity: ActivityType;
    destination: string;
    date: string;
    time: string;
    duration: string;
  }) => void;
  onNavigate: (tab: PageTab) => void;
}

export const ActivityPlannerPage: React.FC<ActivityPlannerPageProps> = ({
  userProfile,
  currentDestination,
  isLoadingAQI = false,
  onCheckAirQuality,
  onNavigate,
}) => {
  // Preset defaults matching prompt example
  const [activity, setActivity] = useState<ActivityType>('Running');
  const [destination, setDestination] = useState<string>(currentDestination || 'Coimbatore');
  const [date, setDate] = useState<string>('Tomorrow');
  const [time, setTime] = useState<string>('6:00 AM');
  const [duration, setDuration] = useState<string>('1 Hour');

  const activities: { value: ActivityType; label: string; icon: string; strain: string }[] = [
    { value: 'Running', label: 'Running', icon: '🏃', strain: 'High cardio & airway intake' },
    { value: 'Walking', label: 'Walking', icon: '🚶', strain: 'Low aerobic exertion' },
    { value: 'Cycling', label: 'Cycling', icon: '🚴', strain: 'Fast breathing rate' },
    { value: 'Outdoor Exercise', label: 'Outdoor Exercise', icon: '🧘', strain: 'Moderate muscular exertion' },
    { value: 'Travel', label: 'Travel / Commute', icon: '🚗', strain: 'Corridor traffic exposure' },
    { value: 'Other', label: 'Other Activity', icon: '⚡', strain: 'Custom energy level' },
  ];

  const commonTimes = [
    '5:30 AM',
    '6:00 AM',
    '7:00 AM',
    '8:30 AM',
    '12:00 PM',
    '4:30 PM',
    '6:00 PM',
    '7:30 PM',
  ];

  const commonDurations = [
    '30 Minutes',
    '45 Minutes',
    '1 Hour',
    '1.5 Hours',
    '2 Hours',
  ];

  const handleQuickPreset = (
    presetActivity: ActivityType,
    presetDate: string,
    presetTime: string,
    presetDur: string
  ) => {
    setActivity(presetActivity);
    setDate(presetDate);
    setTime(presetTime);
    setDuration(presetDur);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCheckAirQuality({
      activity,
      destination,
      date,
      time,
      duration,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-left">
      
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">
          <Calendar className="w-3.5 h-3.5 text-blue-700" />
          <span>Activity Air Readiness</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-['Outfit',sans-serif] text-slate-900">
          Activity Planner
        </h1>
        <p className="mt-2 text-base text-slate-600">
          Schedule your outdoor exercise or travel. AirCare AI calculates your specific particulate intake and generates tailored safety instructions.
        </p>
      </div>

      {/* Preset Quick-Buttons */}
      <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/90">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Popular Test Scenarios</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleQuickPreset('Running', 'Tomorrow', '6:00 AM', '1 Hour')}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50 text-xs font-semibold text-slate-800 shadow-xs transition-colors"
          >
            🏃 Tomorrow 6:00 AM Run (1 hr)
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset('Outdoor Exercise', 'Today', '4:30 PM', '1.5 Hours')}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-amber-500 hover:bg-amber-50/50 text-xs font-semibold text-slate-800 shadow-xs transition-colors"
          >
            🧘 Today Afternoon HIIT (1.5 hrs)
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset('Walking', 'Tomorrow', '7:00 PM', '45 Minutes')}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 text-xs font-semibold text-slate-800 shadow-xs transition-colors"
          >
            🚶 Evening Walk (45 mins)
          </button>
        </div>
      </div>

      {/* Main Planner Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-8">
        
        {/* Field 1: Activity Selector */}
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Select Activity</span>
            </span>
            <span className="text-xs font-normal text-slate-500">Selected: <strong className="text-slate-800">{activity}</strong></span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {activities.map((item) => {
              const isSelected = activity === item.value;
              return (
                <button
                  type="button"
                  key={item.value}
                  id={`planner-act-${item.value.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setActivity(item.value)}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/90 ring-2 ring-emerald-500/20 text-emerald-950 font-bold shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className="text-sm font-semibold">{item.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{item.strain}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Field 2 & 3: Destination and Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
          
          {/* Destination */}
          <div>
            <label htmlFor="planner-destination-input" className="block text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Destination / Route</span>
            </label>
            <input
              id="planner-destination-input"
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Coimbatore or Race Course Park"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 text-sm"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {['Coimbatore', 'Chennai', 'Bengaluru', 'Delhi', 'Mumbai'].map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setDestination(c)}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-emerald-50 text-[11px] font-medium text-slate-700 hover:text-emerald-800 border border-slate-200 transition-colors"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="planner-date-select" className="block text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Target Date</span>
            </label>
            <select
              id="planner-date-select"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 text-sm bg-white"
            >
              <option value="Today">Today (Current AQI Baseline)</option>
              <option value="Tomorrow">Tomorrow (Forecast Model)</option>
              <option value="Day After Tomorrow">Day After Tomorrow</option>
              <option value="This Weekend">This Weekend (Saturday)</option>
            </select>
          </div>
        </div>

        {/* Field 4 & 5: Time and Expected Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
          
          {/* Time */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Planned Start Time</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {commonTimes.map((t) => (
                <button
                  type="button"
                  key={t}
                  id={`planner-time-${t.toLowerCase().replace(/[:\s]/g, '-')}`}
                  onClick={() => setTime(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    time === t
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Expected Duration */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Expected Duration</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {commonDurations.map((dur) => (
                <button
                  type="button"
                  key={dur}
                  id={`planner-dur-${dur.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setDuration(dur)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    duration === dur
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {dur}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Profile Context Pill */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              Analyzing for <strong className="text-slate-900">{userProfile.name}</strong> (Sensitivity: <span className="capitalize font-bold text-amber-700">{userProfile.healthSensitivity}</span>)
            </span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('profile')}
            className="text-emerald-700 hover:underline font-semibold"
          >
            Edit Health Sensitivity →
          </button>
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            id="planner-check-air-quality-btn"
            disabled={isLoadingAQI}
            className="flex-1 inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-linear-to-r from-emerald-600 via-teal-600 to-blue-700 hover:from-emerald-700 hover:to-blue-800 disabled:opacity-60 text-white font-extrabold text-base shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 transition-all"
          >
            {isLoadingAQI ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Fetching Live Air Data...</span>
              </span>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>Check Air Quality</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          <button
            type="button"
            id="planner-future-tool-btn"
            onClick={() => onNavigate('future-planner')}
            className="px-6 py-4 rounded-2xl bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-bold text-sm shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>Future Activity Planner</span>
          </button>
        </div>

      </form>
    </div>
  );
};
