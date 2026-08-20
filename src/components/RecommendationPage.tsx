import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Heart, 
  Activity, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  BookmarkCheck, 
  RotateCcw,
  Copy,
  Check,
  TrendingDown,
  Layers,
  HelpCircle,
  MapPin,
  Compass,
  ArrowRight,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, ActivityPlan, PageTab, ActivityType } from '../types';
import { evaluateRecommendation } from '../services/recommendationEngine';

interface RecommendationPageProps {
  userProfile: UserProfile;
  currentPlan?: Partial<ActivityPlan>;
  onSavePlan: (plan: ActivityPlan) => void;
  onNavigate: (tab: PageTab) => void;
}

export const RecommendationPage: React.FC<RecommendationPageProps> = ({
  userProfile,
  currentPlan,
  onSavePlan,
  onNavigate,
}) => {
  // Mock states to allow immediate interactive testing
  const [activeAQI, setActiveAQI] = useState<number>(currentPlan?.calculatedAQI ?? 165);
  const [selectedActivity, setSelectedActivity] = useState<ActivityType>(
    (currentPlan?.activity as ActivityType) || 'Running'
  );
  const [selectedDuration, setSelectedDuration] = useState<string>(
    currentPlan?.duration || '1 Hour'
  );
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Compute recommendation with new RecommendationEngine
  const recResult = evaluateRecommendation({
    aqi: activeAQI,
    userAge: userProfile.age,
    healthSensitivity: userProfile.healthSensitivity,
    activity: selectedActivity,
    duration: selectedDuration,
    location: currentPlan?.destination || 'Coimbatore',
    plannedDateTime: `${currentPlan?.date || 'Tomorrow'}, ${currentPlan?.time || '6:00 AM'}`,
  });

  const handleReschedule = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    setActiveAQI(82);
    setSelectedDuration('1 Hour');
  };

  const handleSaveCurrentPlan = () => {
    const newPlan: ActivityPlan = {
      id: `plan-${Date.now()}`,
      activity: selectedActivity,
      destination: currentPlan?.destination || 'Coimbatore',
      date: currentPlan?.date || 'Tomorrow',
      time: currentPlan?.time || '6:00 AM',
      duration: selectedDuration,
      userSensitivity: userProfile.healthSensitivity,
      calculatedAQI: activeAQI,
      recommendationStatus: recResult.recommendationStatus,
      statusText: recResult.title,
      statusColor:
        recResult.recommendationStatus === 'PROCEED'
          ? 'emerald'
          : recResult.recommendationStatus === 'REDUCE OUTDOOR EXPOSURE'
          ? 'amber'
          : 'rose',
      whyExplanation: recResult.personalizedExplanation,
      precautions: recResult.generalPrecautions,
      betterTimeSuggestion: {
        timeWindow: recResult.betterTimeSuggestion.suggestedWindow,
        predictedAQI: recResult.betterTimeSuggestion.predictedAQI,
        status: recResult.betterTimeSuggestion.predictedCategory,
        reason: recResult.betterTimeSuggestion.message,
      },
      createdAt: 'Just now',
    };
    onSavePlan(newPlan);
    setSavedSuccess(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCopyAdvice = () => {
    const textToCopy = `AirCare AI Recommendation for ${userProfile.name} in ${currentPlan?.destination || 'Coimbatore'}:
Status: ${recResult.recommendationStatus}
AQI: ${activeAQI} (${recResult.factorsEvaluated.aqiCategory})
Activity: ${selectedActivity} (${selectedDuration})
Explanation: ${recResult.personalizedExplanation}
Better Window: ${recResult.betterTimeSuggestion.suggestedWindow} (AQI ${recResult.betterTimeSuggestion.predictedAQI})`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  // Status visual mapping
  const getStatusStyles = () => {
    switch (recResult.recommendationStatus) {
      case 'PROCEED':
        return {
          bannerBg: 'bg-emerald-600',
          cardBg: 'bg-linear-to-b from-emerald-50 via-teal-50/40 to-white',
          border: 'border-emerald-300',
          badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          dot: 'bg-emerald-500',
          icon: ShieldCheck,
          iconColor: 'text-emerald-600',
          badgeText: '🟢 PROCEED',
          riskColor: 'text-emerald-700',
          barColor: 'bg-emerald-500',
        };
      case 'REDUCE OUTDOOR EXPOSURE':
        return {
          bannerBg: 'bg-amber-600',
          cardBg: 'bg-linear-to-b from-amber-50/90 via-orange-50/40 to-white',
          border: 'border-amber-300',
          badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
          dot: 'bg-amber-500',
          icon: AlertTriangle,
          iconColor: 'text-amber-600',
          badgeText: '🟡 REDUCE OUTDOOR EXPOSURE',
          riskColor: 'text-amber-700',
          barColor: 'bg-amber-500',
        };
      case 'CONSIDER POSTPONING':
        return {
          bannerBg: 'bg-rose-600',
          cardBg: 'bg-linear-to-b from-rose-50 via-red-50/40 to-white',
          border: 'border-rose-300',
          badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
          dot: 'bg-rose-500',
          icon: ShieldAlert,
          iconColor: 'text-rose-600',
          badgeText: '🔴 CONSIDER POSTPONING',
          riskColor: 'text-rose-700',
          barColor: 'bg-rose-500',
        };
    }
  };

  const statusStyles = getStatusStyles();

  // Simple What is happening wording
  const getWhatIsHappening = (aqi: number) => {
    if (aqi <= 50) return `Air quality is Good (AQI ${aqi}). Atmospheric particulate concentrations are clean and safe for all outdoor activities.`;
    if (aqi <= 100) return `Air quality is Moderate (AQI ${aqi}). Particulate matter is acceptable, though sensitive individuals should be mindful during heavy exertion.`;
    if (aqi <= 150) return `Air quality is Unhealthy for Sensitive Groups (AQI ${aqi}). Airborne pollutants PM2.5 and PM10 are elevated.`;
    if (aqi <= 200) return `Air quality is Unhealthy (AQI ${aqi}). Stagnant pollutants and dust particles have accumulated in the breathing zone.`;
    return `Air quality is Very Unhealthy / Hazardous (AQI ${aqi}). Heavy smog and particulate concentration pose acute respiratory strain.`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-left space-y-8">
      
      {/* Header with Quick Interactive Scenario Tester */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>Personalized Recommendation Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-['Outfit',sans-serif] text-slate-900">
            Personalized Guidance
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Clear, actionable answers connecting environmental air quality to your biological profile.
          </p>
        </div>

        {/* Live status switcher to test mock scenarios */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs shrink-0">
          <span className="text-[11px] font-bold text-slate-500 px-2 hidden sm:inline">Test Scenarios:</span>
          <button
            id="rec-sim-proceed"
            onClick={() => { setActiveAQI(45); setSelectedActivity('Walking'); setSelectedDuration('30 Minutes'); }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              activeAQI === 45 ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700 hover:bg-white'
            }`}
          >
            🟢 45 (Proceed)
          </button>
          <button
            id="rec-sim-reduce"
            onClick={() => { setActiveAQI(110); setSelectedActivity('Cycling'); setSelectedDuration('1 Hour'); }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              activeAQI === 110 ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-700 hover:bg-white'
            }`}
          >
            🟡 110 (Reduce)
          </button>
          <button
            id="rec-sim-postpone"
            onClick={() => { setActiveAQI(165); setSelectedActivity('Running'); setSelectedDuration('1 Hour'); }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              activeAQI === 165 ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-700 hover:bg-white'
            }`}
          >
            🔴 165 (Postpone)
          </button>
        </div>
      </div>

      {/* Main Large Recommendation Status Card */}
      <div 
        id="personalized-recommendation-hero-card"
        className={`rounded-3xl border-2 ${statusStyles.border} ${statusStyles.cardBg} shadow-xl overflow-hidden text-left relative transition-all duration-300`}
      >
        {/* Header accent strip */}
        <div className={`py-2 px-6 ${statusStyles.bannerBg} text-white flex items-center justify-between text-xs font-bold uppercase tracking-wider`}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-white" />
            <span>Biometric Air Recommendation</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Risk Level: <strong>{recResult.riskLevel}</strong></span>
          </div>
        </div>

        <div className="p-6 sm:p-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Status Headline */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border text-xs sm:text-sm font-extrabold uppercase tracking-wide bg-white/95 shadow-xs">
                <span className={`w-3 h-3 rounded-full ${statusStyles.dot} animate-pulse`} />
                <span className="text-slate-900 font-black">{statusStyles.badgeText}</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-['Outfit',sans-serif] tracking-tight text-slate-900">
                {recResult.title}
              </h2>

              <p className="text-base text-slate-700 max-w-2xl font-normal leading-relaxed">
                {recResult.personalizedExplanation}
              </p>
            </div>

            {/* Risk Gauge Pill */}
            <div className="p-5 rounded-2xl bg-white/95 border border-slate-200 shadow-sm shrink-0 min-w-[220px] text-center">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Calculated Risk Level
              </div>
              <div className={`text-3xl font-black font-['Outfit',sans-serif] ${statusStyles.riskColor}`}>
                {recResult.riskLevel} Risk
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full mt-2.5 overflow-hidden">
                <div 
                  className={`h-full ${statusStyles.barColor} transition-all duration-700`} 
                  style={{ 
                    width: recResult.riskLevel === 'Low' ? '25%' : recResult.riskLevel === 'Moderate' ? '55%' : recResult.riskLevel === 'High' ? '82%' : '100%' 
                  }}
                />
              </div>
              <span className="text-[11px] text-slate-500 font-medium block mt-1.5">
                Evaluated for {userProfile.name}
              </span>
            </div>

          </div>

          {/* Section: Factors Evaluated */}
          <div className="pt-6 border-t border-slate-200/80">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>Factors Evaluated</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {/* Factor 1: AQI */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                <span className="text-[11px] text-slate-500 font-semibold block">AQI Score</span>
                <div className="text-base font-extrabold text-slate-900 mt-0.5 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${recResult.factorsEvaluated.aqi >= 150 ? 'bg-rose-500' : recResult.factorsEvaluated.aqi >= 100 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  <span>AQI {recResult.factorsEvaluated.aqi}</span>
                </div>
                <span className="text-[10px] text-slate-500">
                  {recResult.factorsEvaluated.aqiCategory}
                </span>
              </div>

              {/* Factor 2: Sensitivity */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                <span className="text-[11px] text-slate-500 font-semibold block">Sensitivity</span>
                <div className="text-base font-extrabold text-slate-900 mt-0.5 capitalize flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>{recResult.factorsEvaluated.healthSensitivity}</span>
                </div>
                <span className="text-[10px] text-slate-500">
                  Level {recResult.factorsEvaluated.sensitivityScore}/3 (Age {userProfile.age})
                </span>
              </div>

              {/* Factor 3: Activity */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                <span className="text-[11px] text-slate-500 font-semibold block">Activity</span>
                <div className="text-base font-extrabold text-slate-900 mt-0.5 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-600" />
                  <span>{recResult.factorsEvaluated.activity}</span>
                </div>
                <span className="text-[10px] text-slate-500">
                  {recResult.factorsEvaluated.activityIntensity} Intensity
                </span>
              </div>

              {/* Factor 4: Duration */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                <span className="text-[11px] text-slate-500 font-semibold block">Duration</span>
                <div className="text-base font-extrabold text-slate-900 mt-0.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{recResult.factorsEvaluated.duration}</span>
                </div>
                <span className="text-[10px] text-slate-500">
                  {recResult.factorsEvaluated.durationCategory}
                </span>
              </div>

              {/* Factor 5: Location */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs col-span-2 sm:col-span-1">
                <span className="text-[11px] text-slate-500 font-semibold block">Location & Time</span>
                <div className="text-sm font-extrabold text-slate-900 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{recResult.factorsEvaluated.location}</span>
                </div>
                <span className="text-[10px] text-slate-500 truncate block">
                  {recResult.factorsEvaluated.plannedDateTime}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Part 3: 3-Part Clear Explanation Answers (What is happening? / Why does it matter to me? / What should I do?) */}
      <section 
        id="recommendation-three-questions-breakdown"
        className="grid grid-cols-1 md:grid-cols-3 gap-5"
      >
        {/* Question 1: What is happening? */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 font-extrabold flex items-center justify-center text-sm shadow-xs">
            1
          </div>
          <div>
            <h3 className="text-base font-extrabold font-['Outfit',sans-serif] text-slate-900">
              What is happening?
            </h3>
            <span className="text-xs font-semibold text-blue-700">Air Quality Condition</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            {getWhatIsHappening(activeAQI)}
          </p>
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>{currentPlan?.destination || 'Coimbatore'} Current AQI: {activeAQI}</span>
          </div>
        </div>

        {/* Question 2: Why does it matter to me? */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-3">
          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 font-extrabold flex items-center justify-center text-sm shadow-xs">
            2
          </div>
          <div>
            <h3 className="text-base font-extrabold font-['Outfit',sans-serif] text-slate-900">
              Why does it matter to me?
            </h3>
            <span className="text-xs font-semibold text-purple-700">Key Contributing Factors</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            {recResult.personalizedExplanation}
          </p>
          <ul className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-slate-100">
            <li>• <strong>AQI Level:</strong> {activeAQI} ({recResult.factorsEvaluated.aqiCategory})</li>
            <li>• <strong>Health Sensitivity:</strong> {userProfile.healthSensitivity} (Age {userProfile.age})</li>
            <li>• <strong>Activity Intensity:</strong> {selectedActivity} ({recResult.factorsEvaluated.activityIntensity})</li>
            <li>• <strong>Outdoor Duration:</strong> {selectedDuration}</li>
          </ul>
        </div>

        {/* Question 3: What should I do? */}
        <div className={`rounded-3xl border-2 shadow-sm p-6 space-y-3 ${
          recResult.recommendationStatus === 'PROCEED'
            ? 'bg-emerald-50/70 border-emerald-300'
            : recResult.recommendationStatus === 'REDUCE OUTDOOR EXPOSURE'
            ? 'bg-amber-50/70 border-amber-300'
            : 'bg-rose-50/70 border-rose-300'
        }`}>
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
            3
          </div>
          <div>
            <h3 className="text-base font-extrabold font-['Outfit',sans-serif] text-slate-900">
              What should I do?
            </h3>
            <span className="text-xs font-extrabold text-slate-900">
              {statusStyles.badgeText}
            </span>
          </div>
          <ul className="text-xs text-slate-800 space-y-1.5 leading-snug">
            {recResult.generalPrecautions.slice(0, 3).map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-900 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('future-planner')}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors"
            >
              <span>Find a Cleaner Time</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Section: "Why?" Detailed Explanation */}
      <section 
        id="why-am-i-seeing-this-section"
        className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 text-left space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold font-['Outfit',sans-serif] text-slate-900">
              Why am I seeing this recommendation?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Responsible clinical and atmospheric rationale
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-sm text-slate-700 leading-relaxed space-y-3">
          <p className="font-semibold text-slate-900">
            Based on the available air-quality forecast and your selected profile ({userProfile.healthSensitivity} sensitivity, age {userProfile.age}) and {selectedActivity.toLowerCase()} activity for {selectedDuration}, conditions may be less favorable for prolonged outdoor exposure.
          </p>

          <div className="pt-2 border-t border-slate-200/70">
            <div className="text-xs font-bold text-slate-600 uppercase mb-2">
              Key Contributing Factors:
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              {recResult.whySection.keyInfluencingFactors.map((factor, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Better Time Suggestion Section */}
      <section 
        id="better-time-suggestion-card"
        className="rounded-3xl bg-linear-to-br from-emerald-700 via-teal-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl text-left relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-bold uppercase tracking-wider">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-300" />
              <span>Forecast Window Analysis</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold font-['Outfit',sans-serif]">
              Better Time Suggestion
            </h2>

            <div className="flex flex-wrap items-baseline gap-3 pt-1">
              <span className="text-xl sm:text-2xl font-bold text-emerald-200">
                {recResult.betterTimeSuggestion.suggestedWindow}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-400/20 border border-emerald-300/40 text-emerald-100 text-xs font-extrabold">
                Predicted AQI: {recResult.betterTimeSuggestion.predictedAQI}
              </span>
              <span className="text-xs font-semibold text-emerald-300">
                ({recResult.betterTimeSuggestion.predictedCategory})
              </span>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed pt-1">
              “Based on the available forecast, these time windows may offer more favorable conditions.”
            </p>
          </div>

          {/* Action to Reschedule */}
          <div className="shrink-0 flex flex-col gap-2">
            <button
              id="reschedule-clean-slot-btn"
              onClick={handleReschedule}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-sm shadow-md transition-all hover:scale-102"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reschedule to 6:00 AM (AQI 82)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <div className="flex flex-wrap items-center gap-3">
          <button
            id="save-current-plan-btn"
            onClick={handleSaveCurrentPlan}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Saved to My Plans!</span>
              </>
            ) : (
              <>
                <BookmarkCheck className="w-4 h-4" />
                <span>Save This Plan</span>
              </>
            )}
          </button>

          <button
            id="share-advice-summary-btn"
            onClick={handleCopyAdvice}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-bold shadow-xs transition-colors"
          >
            {copiedSummary ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Summary Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Copy Summary</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="back-to-dashboard-btn"
            onClick={() => onNavigate('dashboard')}
            className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold transition-colors"
          >
            Back to Dashboard
          </button>
          <button
            id="plan-future-link-btn"
            onClick={() => onNavigate('future-planner')}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            Open Future Planner →
          </button>
        </div>
      </div>

    </div>
  );
};
