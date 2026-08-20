import React, { useState } from 'react';
import { 
  Bell, 
  BellRing, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  TrendingDown, 
  Sparkles, 
  ArrowRight, 
  Filter, 
  Check, 
  Info,
  Calendar,
  Volume2,
  Users,
  Settings2,
  Sliders,
  X,
  RotateCcw,
  CheckCheck,
  EyeOff
} from 'lucide-react';
import { 
  AlertNotification, 
  UserProfile, 
  AQIData, 
  PageTab, 
  FamilyMember, 
  ActivityPlan, 
  AlertPreferences 
} from '../types';

interface AlertsPageProps {
  alerts: AlertNotification[];
  userProfile: UserProfile;
  aqiData: AQIData;
  familyMembers?: FamilyMember[];
  savedPlans?: ActivityPlan[];
  alertPreferences?: AlertPreferences;
  onUpdateAlertPreferences?: (prefs: AlertPreferences) => void;
  onMarkRead: (id: string) => void;
  onDismissAlert?: (id: string) => void;
  onTriggerTestAlert: () => void;
  onResetAlerts?: () => void;
  onNavigate: (tab: PageTab) => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({
  alerts,
  userProfile,
  aqiData,
  familyMembers = [],
  savedPlans = [],
  alertPreferences = {
    enableAirQualityAlerts: true,
    enablePlannedActivityAlerts: true,
    enableFamilyAlerts: true,
    enableBetterTimeSuggestions: true,
  },
  onUpdateAlertPreferences,
  onMarkRead,
  onDismissAlert,
  onTriggerTestAlert,
  onResetAlerts,
  onNavigate,
}) => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'unread' | 'high_aqi' | 'activity' | 'family'>('all');
  const [showSettings, setShowSettings] = useState(false);

  // Active alerts filtered by preferences and selected filter tab
  const visibleAlerts = alerts.filter((alert) => {
    // 1. Check if category is enabled in settings
    if (alert.alertType === 'high_aqi' && !alertPreferences.enableAirQualityAlerts) return false;
    if (alert.alertType === 'planned_activity' && !alertPreferences.enablePlannedActivityAlerts) return false;
    if (alert.alertType === 'better_time' && !alertPreferences.enableBetterTimeSuggestions) return false;
    if (alert.alertType === 'family' && !alertPreferences.enableFamilyAlerts) return false;

    // 2. Check tab filter
    if (filterCategory === 'unread') return !alert.isRead;
    if (filterCategory === 'high_aqi') return alert.alertType === 'high_aqi' || alert.severity === 'high';
    if (filterCategory === 'activity') return alert.alertType === 'planned_activity' || alert.alertType === 'better_time';
    if (filterCategory === 'family') return alert.alertType === 'family';

    return true;
  });

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  const handleTogglePreference = (key: keyof AlertPreferences) => {
    if (!onUpdateAlertPreferences) return;
    onUpdateAlertPreferences({
      ...alertPreferences,
      [key]: !alertPreferences[key],
    });
  };

  const getAlertBadge = (alert: AlertNotification) => {
    if (alert.recommendationStatus === 'PROCEED') {
      return {
        label: '🟢 PROCEED',
        border: 'border-emerald-200 hover:border-emerald-300',
        bg: 'bg-emerald-50/70',
        badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        dot: 'bg-emerald-500',
      };
    }
    if (alert.recommendationStatus === 'REDUCE OUTDOOR EXPOSURE' || alert.severity === 'medium') {
      return {
        label: '🟡 REDUCE EXPOSURE',
        border: 'border-amber-200 hover:border-amber-400',
        bg: 'bg-amber-50/60',
        badge: 'bg-amber-100 text-amber-900 border-amber-300',
        dot: 'bg-amber-500',
      };
    }
    return {
      label: '🔴 CONSIDER POSTPONING',
      border: 'border-rose-200 hover:border-rose-400',
      bg: 'bg-rose-50/50',
      badge: 'bg-rose-100 text-rose-900 border-rose-300',
      dot: 'bg-rose-500',
    };
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-left space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
            <BellRing className="w-3.5 h-3.5 text-amber-700" />
            <span>Intelligent Environmental Advisory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-['Outfit',sans-serif] text-slate-900">
            Smart Alerts
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Contextual early warnings generated for {userProfile.name}, upcoming planned activities, and household members.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="toggle-alert-settings-btn"
            onClick={() => setShowSettings(!showSettings)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-colors ${
              showSettings
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Sliders className="w-4 h-4 text-emerald-500" />
            <span>Settings</span>
          </button>

          <button
            id="trigger-test-alert-btn"
            onClick={onTriggerTestAlert}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:border-emerald-400 text-slate-700 text-xs font-bold shadow-xs transition-colors"
          >
            <Bell className="w-4 h-4 text-emerald-600" />
            <span>Simulate Alert</span>
          </button>

          {onResetAlerts && (
            <button
              id="reset-alerts-btn"
              onClick={onResetAlerts}
              title="Reset alerts stream"
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Alert Preferences Panel (Collapsible / Toggleable) */}
      {showSettings && (
        <section 
          id="alert-preferences-panel"
          className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">Alert Preferences</h2>
            </div>
            <span className="text-xs text-slate-400">Stored locally in your browser</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Toggle 1: Air Quality Alerts */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-white text-sm block">Air-Quality Alerts</span>
                <span className="text-slate-400">High AQI spikes & atmospheric shifts in {aqiData.location}</span>
              </div>
              <button
                id="toggle-pref-air-quality"
                onClick={() => handleTogglePreference('enableAirQualityAlerts')}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  alertPreferences.enableAirQualityAlerts ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  alertPreferences.enableAirQualityAlerts ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Toggle 2: Planned Activity Alerts */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-white text-sm block">Planned Activity Alerts</span>
                <span className="text-slate-400">Warnings when saved workouts fall in poor air windows</span>
              </div>
              <button
                id="toggle-pref-planned-activities"
                onClick={() => handleTogglePreference('enablePlannedActivityAlerts')}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  alertPreferences.enablePlannedActivityAlerts ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  alertPreferences.enablePlannedActivityAlerts ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Toggle 3: Family Alerts */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-white text-sm block">Family Alerts</span>
                <span className="text-slate-400">Notices when sensitive household members need extra care</span>
              </div>
              <button
                id="toggle-pref-family"
                onClick={() => handleTogglePreference('enableFamilyAlerts')}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  alertPreferences.enableFamilyAlerts ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  alertPreferences.enableFamilyAlerts ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Toggle 4: Better Time Suggestions */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-white text-sm block">Better Time Suggestions</span>
                <span className="text-slate-400">Clean-air window suggestions based on hourly forecasts</span>
              </div>
              <button
                id="toggle-pref-better-time"
                onClick={() => handleTogglePreference('enableBetterTimeSuggestions')}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  alertPreferences.enableBetterTimeSuggestions ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  alertPreferences.enableBetterTimeSuggestions ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Primary Air Quality Alert Showcase Banner */}
      <section 
        id="primary-air-quality-alert-banner"
        className="rounded-3xl bg-linear-to-br from-amber-500/10 via-orange-500/5 to-teal-500/10 border-2 border-amber-300 p-6 sm:p-8 shadow-md text-left relative overflow-hidden"
      >
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 relative z-10">
          <div className="max-w-3xl space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-950 text-xs font-extrabold uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
              <span>Current City Status</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold font-['Outfit',sans-serif] text-slate-900">
              Air Quality Alert in {aqiData.location}
            </h2>

            <div className="text-base sm:text-lg font-bold text-amber-950 flex items-start gap-2 pt-1">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <span>
                {aqiData.aqi > 150
                  ? '“Air quality is currently unfavorable for some sensitive users.”'
                  : '“Air quality is currently moderate; monitor extended outdoor cardio.”'}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Active telemetry indicates AQI {aqiData.aqi} ({aqiData.status}) in {aqiData.location}. Fine particulate matter is the dominant pollutant. Follow standard precautions before prolonged exposure.
            </p>
          </div>

          <div className="shrink-0 flex flex-col gap-2">
            <button
              id="alert-plan-workout-btn"
              onClick={() => onNavigate('future-planner')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-colors"
            >
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Plan Future Activity</span>
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Alert Center Feed */}
      <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 text-left space-y-6">
        
        {/* Stream Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-extrabold font-['Outfit',sans-serif] text-slate-900">
              Alert Center ({visibleAlerts.length})
            </h2>
            <p className="text-xs text-slate-500">
              Interactive notifications generated by real-time air quality, future planner, and family profiles.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                filterCategory === 'all' ? 'bg-slate-900 text-white shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Alerts ({alerts.length})
            </button>
            <button
              onClick={() => setFilterCategory('unread')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                filterCategory === 'unread' ? 'bg-amber-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilterCategory('activity')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                filterCategory === 'activity' ? 'bg-blue-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Activities
            </button>
            <button
              onClick={() => setFilterCategory('family')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                filterCategory === 'family' ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Family
            </button>
          </div>
        </div>

        {/* Alerts List */}
        {visibleAlerts.length === 0 ? (
          <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No active alerts in this view</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              All caught up! New air quality warnings and better time opportunities will appear automatically here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleAlerts.map((alert) => {
              const badge = getAlertBadge(alert);

              return (
                <div
                  key={alert.id}
                  id={`alert-card-${alert.id}`}
                  className={`p-5 sm:p-6 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 text-left ${
                    alert.isRead ? 'bg-white border-slate-200' : `${badge.bg} ${badge.border} shadow-xs`
                  }`}
                >
                  <div className="space-y-2.5 max-w-2xl">
                    
                    {/* Header Row */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${badge.dot}`} />
                      
                      {/* Alert Type Badge */}
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-200/80 text-slate-700">
                        {alert.category}
                      </span>

                      {/* Recommendation Status Pill */}
                      {alert.recommendationStatus && (
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${badge.badge}`}>
                          {badge.label}
                        </span>
                      )}

                      {alert.aqi && (
                        <span className="text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          AQI {alert.aqi}
                        </span>
                      )}

                      <span className="text-[11px] text-slate-400 font-medium ml-auto sm:ml-0">
                        • {alert.timestamp}
                      </span>
                    </div>

                    {/* Alert Title */}
                    <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                      {alert.title}
                    </h3>

                    {/* Alert Description */}
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {alert.message}
                    </p>

                    {/* Context / Forecast Time */}
                    <div className="text-xs text-slate-500 font-medium flex items-center gap-2 pt-0.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Context: <strong className="text-slate-800">{alert.timeContext}</strong></span>
                    </div>

                    {/* Better Time Windows if present */}
                    {alert.betterTimeWindows && alert.betterTimeWindows.length > 0 && (
                      <div className="p-3 rounded-2xl bg-white/90 border border-slate-200 text-xs space-y-1.5 mt-2">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Suggested Favorable Windows:</span>
                        </span>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {alert.betterTimeWindows.map((tw, i) => (
                            <span 
                              key={i}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-[11px] font-bold"
                            >
                              {tw.timeWindow} (AQI {tw.aqi}) — {tw.condition}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Action Buttons */}
                  <div className="shrink-0 flex flex-wrap sm:flex-col items-center sm:items-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                    {!alert.isRead && (
                      <button
                        id={`mark-read-btn-${alert.id}`}
                        onClick={() => onMarkRead(alert.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors"
                      >
                        Mark as Read
                      </button>
                    )}

                    {onDismissAlert && (
                      <button
                        id={`dismiss-alert-btn-${alert.id}`}
                        onClick={() => onDismissAlert(alert.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1"
                        title="Dismiss alert"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Dismiss</span>
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
};
