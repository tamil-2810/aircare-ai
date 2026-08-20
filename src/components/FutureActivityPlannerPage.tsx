import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Activity, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Bookmark, 
  RotateCcw, 
  TrendingDown, 
  Trash2, 
  Check,
  Sun,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  HelpCircle,
  Layers,
  Search,
  Timer
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  ActivityType, 
  ActivityPlan, 
  UserProfile, 
  PageTab, 
  RecommendationAction,
  AQIData,
  BetterTimeOption
} from '../types';
import { evaluateRecommendation } from '../services/recommendationEngine';
import { fetchForecastForActivity, getAQICategoryLabel } from '../services/airQualityService';

interface FutureActivityPlannerPageProps {
  userProfile: UserProfile;
  savedPlans: ActivityPlan[];
  onSavePlan: (plan: ActivityPlan) => void;
  onDeletePlan: (id: string) => void;
  onNavigate: (tab: PageTab) => void;
}

export const FutureActivityPlannerPage: React.FC<FutureActivityPlannerPageProps> = ({
  userProfile,
  savedPlans,
  onSavePlan,
  onDeletePlan,
  onNavigate,
}) => {
  const [destination, setDestination] = useState('Coimbatore');
  const [date, setDate] = useState('Tomorrow');
  const [time, setTime] = useState('2:00 PM');
  const [activity, setActivity] = useState<ActivityType>('Running');
  const [duration, setDuration] = useState('1 Hour');
  
  // Forecast Evaluation States
  const [isCheckingForecast, setIsCheckingForecast] = useState(false);
  const [forecastAQI, setForecastAQI] = useState<number>(165);
  const [forecastCategory, setForecastCategory] = useState<AQIData['status']>('Unhealthy');
  const [betterTimeOptions, setBetterTimeOptions] = useState<BetterTimeOption[]>([]);
  const [hasEvaluated, setHasEvaluated] = useState(true);
  const [saveToast, setSaveToast] = useState(false);

  // Compute recommendation with the recommendation engine
  const recResult = evaluateRecommendation({
    aqi: forecastAQI,
    userAge: userProfile.age,
    healthSensitivity: userProfile.healthSensitivity,
    activity,
    duration,
    location: destination,
    plannedDateTime: `${date}, ${time}`,
  });

  // Calculate Better Time Suggestions by evaluating available hourly slots
  const runForecastEvaluation = async (dest: string, d: string, t: string) => {
    setIsCheckingForecast(true);
    try {
      const forecast = await fetchForecastForActivity(dest, d, t);
      setForecastAQI(forecast.targetAQI);
      setForecastCategory(forecast.category);

      // Evaluate each hourly slot through recommendation engine
      const options: BetterTimeOption[] = forecast.hourlySlots.map((slot) => {
        const slotRec = evaluateRecommendation({
          aqi: slot.aqi,
          userAge: userProfile.age,
          healthSensitivity: userProfile.healthSensitivity,
          activity,
          duration,
          location: dest,
          plannedDateTime: `${d}, ${slot.timeSlot}`,
        });

        return {
          timeSlot: slot.timeSlot,
          aqi: slot.aqi,
          aqiCategory: slot.category,
          recommendationStatus: slotRec.recommendationStatus,
          isOptimal: slot.aqi < forecast.targetAQI,
          explanation: slotRec.personalizedExplanation,
        };
      });

      // Filter to slots that are cleaner or equal and sort by lowest AQI
      const sortedOptions = options
        .filter((opt) => opt.timeSlot !== t)
        .sort((a, b) => a.aqi - b.aqi);

      setBetterTimeOptions(sortedOptions);
      setHasEvaluated(true);
    } catch (err) {
      console.warn('Error fetching forecast, using baseline model:', err);
    } finally {
      setIsCheckingForecast(false);
    }
  };

  // Initial calculation on mount
  useEffect(() => {
    runForecastEvaluation(destination, date, time);
  }, []);

  const handleCheckAirQuality = (e: React.FormEvent) => {
    e.preventDefault();
    runForecastEvaluation(destination, date, time);
  };

  const handleApplyBetterTime = (opt: BetterTimeOption) => {
    setTime(opt.timeSlot);
    setForecastAQI(opt.aqi);
    setForecastCategory(opt.aqiCategory as AQIData['status']);
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
    });
    // Re-evaluate
    runForecastEvaluation(destination, date, opt.timeSlot);
  };

  const handleSavePlan = () => {
    const newPlan: ActivityPlan = {
      id: `future-plan-${Date.now()}`,
      activity,
      destination,
      date,
      time,
      duration,
      userSensitivity: userProfile.healthSensitivity,
      calculatedAQI: forecastAQI,
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
        timeWindow: betterTimeOptions[0]?.timeSlot || '6:00 AM',
        predictedAQI: betterTimeOptions[0]?.aqi || 82,
        status: betterTimeOptions[0]?.aqiCategory || 'Moderate',
        reason: 'Optimal morning atmospheric dispersion window with minimal particulate stagnation.',
      },
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onSavePlan(newPlan);
    setSaveToast(true);
    confetti({
      particleCount: 70,
      spread: 65,
      origin: { y: 0.6 },
    });
    setTimeout(() => setSaveToast(false), 3000);
  };

  const getStatusBadge = (status: RecommendationAction) => {
    switch (status) {
      case 'PROCEED':
        return {
          label: '🟢 PROCEED',
          badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          bannerBg: 'from-emerald-500/10 via-teal-500/5 to-white border-emerald-300',
          dot: 'bg-emerald-500',
        };
      case 'REDUCE OUTDOOR EXPOSURE':
        return {
          label: '🟡 REDUCE OUTDOOR EXPOSURE',
          badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
          bannerBg: 'from-amber-500/10 via-orange-500/5 to-white border-amber-300',
          dot: 'bg-amber-500',
        };
      case 'CONSIDER POSTPONING':
        return {
          label: '🔴 CONSIDER POSTPONING',
          badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
          bannerBg: 'from-rose-500/10 via-red-500/5 to-white border-rose-300',
          dot: 'bg-rose-500',
        };
    }
  };

  const currentBadge = getStatusBadge(recResult.recommendationStatus);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-left space-y-8">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">
          <Calendar className="w-3.5 h-3.5 text-blue-700" />
          <span>Predictive Climate Scheduling</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-['Outfit',sans-serif] text-slate-900">
          Future Activity Planner
        </h1>
        <p className="mt-2 text-base text-slate-600">
          Plan outdoor routines days in advance, evaluate hourly air-quality forecasts, and discover safer clean-air windows.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form: Plan Inputs (Lg: 5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <form 
            id="future-activity-planner-form"
            onSubmit={handleCheckAirQuality} 
            className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-4"
          >
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Plan Outdoor Activity</span>
            </h2>

            {/* Destination */}
            <div>
              <label htmlFor="planner-destination-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Destination or Location</span>
              </label>
              <input
                id="planner-destination-input"
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Coimbatore, Chennai, Bengaluru"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm text-slate-900 bg-white"
              />
            </div>

            {/* Activity */}
            <div>
              <label htmlFor="planner-activity-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                <span>Activity</span>
              </label>
              <select
                id="planner-activity-select"
                value={activity}
                onChange={(e) => setActivity(e.target.value as ActivityType)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm text-slate-900 bg-white"
              >
                <option value="Walking">Walking</option>
                <option value="Running">Running</option>
                <option value="Cycling">Cycling</option>
                <option value="Outdoor Exercise">Outdoor Exercise</option>
                <option value="Travel">Travel</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Date & Time in 2 columns */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="planner-date-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>Date</span>
                </label>
                <select
                  id="planner-date-select"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm text-slate-900 bg-white"
                >
                  <option value="Today">Today</option>
                  <option value="Tomorrow">Tomorrow</option>
                  <option value="Day After Tomorrow">Day After Tomorrow</option>
                  <option value="This Saturday">This Saturday</option>
                  <option value="This Sunday">This Sunday</option>
                </select>
              </div>

              <div>
                <label htmlFor="planner-time-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Time</span>
                </label>
                <select
                  id="planner-time-select"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm text-slate-900 bg-white"
                >
                  <option value="6:00 AM">6:00 AM (Early Dawn)</option>
                  <option value="7:30 AM">7:30 AM (Morning Window)</option>
                  <option value="9:00 AM">9:00 AM (Morning Rush)</option>
                  <option value="1:00 PM">1:00 PM (Afternoon Smog)</option>
                  <option value="2:00 PM">2:00 PM (Midday Peak)</option>
                  <option value="5:30 PM">5:30 PM (Evening Commute)</option>
                  <option value="7:00 PM">7:00 PM (Evening Wind)</option>
                  <option value="8:30 PM">8:30 PM (Night Air)</option>
                </select>
              </div>
            </div>

            {/* Expected Duration */}
            <div>
              <label htmlFor="planner-duration-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5 text-slate-600" />
                <span>Expected Outdoor Duration</span>
              </label>
              <select
                id="planner-duration-select"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm text-slate-900 bg-white"
              >
                <option value="15 Minutes">15 Minutes (Brief Commute)</option>
                <option value="30 Minutes">30 Minutes (Short Workout)</option>
                <option value="45 Minutes">45 Minutes (Moderate Routine)</option>
                <option value="1 Hour">1 Hour (Standard Session)</option>
                <option value="2+ Hours">2+ Hours (Extended Exposure)</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              id="planner-check-air-quality-btn"
              type="submit"
              disabled={isCheckingForecast}
              className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-colors disabled:opacity-75"
            >
              {isCheckingForecast ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Retrieving Forecast Telemetry...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-emerald-400" />
                  <span>Check Air Quality</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Output: Future Recommendation Result (Lg: 7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div 
            id="future-recommendation-result-card"
            className={`rounded-3xl border-2 ${currentBadge.bannerBg} p-6 sm:p-8 shadow-md text-left space-y-6`}
          >
            
            {/* Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Future Recommendation Result
                </span>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-extrabold border ${currentBadge.badgeBg}`}>
                {currentBadge.label}
              </div>
            </div>

            {/* Target Parameters Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-white/90 border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Destination</span>
                <span className="font-bold text-slate-900 truncate block mt-0.5">{destination}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/90 border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Date & Time</span>
                <span className="font-bold text-slate-900 truncate block mt-0.5">{date}, {time}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/90 border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Activity</span>
                <span className="font-bold text-slate-900 truncate block mt-0.5">{activity}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/90 border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Duration</span>
                <span className="font-bold text-slate-900 truncate block mt-0.5">{duration}</span>
              </div>
            </div>

            {/* Forecast AQI & Category Score */}
            <div className="flex flex-wrap items-baseline gap-4">
              <div>
                <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Forecast AQI</span>
                <div className="text-4xl sm:text-5xl font-black font-['Outfit',sans-serif] text-slate-900 mt-1">
                  AQI {forecastAQI}
                </div>
              </div>
              <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-200 shadow-2xs text-slate-800">
                {forecastCategory} ({recResult.riskLevel} Risk)
              </span>
            </div>

            {/* Recommendation Explanation */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Personalized Action Guidance</span>
              </div>
              <p className="text-sm font-bold text-slate-900 leading-snug">
                “{recResult.title}”
              </p>
              <p className="text-xs text-slate-700 leading-relaxed">
                {recResult.personalizedExplanation}
              </p>
            </div>

            {/* "Why?" Section with Responsible Phrasing */}
            <div id="future-why-section" className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span>Why?</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                Based on the available air-quality forecast and your selected profile ({userProfile.healthSensitivity} sensitivity, age {userProfile.age}) and {activity.toLowerCase()} activity for {duration}, conditions may be less favorable for prolonged outdoor exposure.
              </p>
              {recResult.whySection.keyInfluencingFactors && (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px] text-slate-600">
                  {recResult.whySection.keyInfluencingFactors.map((factor, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Save Plan Button */}
            <div className="pt-2">
              <button
                id="future-save-plan-btn"
                onClick={handleSavePlan}
                className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
              >
                {saveToast ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-200" />
                    <span>Plan Successfully Saved to Itinerary!</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    <span>Save This Activity Plan</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Part 2: Find a Better Time Feature */}
      <section 
        id="find-a-better-time-section"
        className="rounded-3xl bg-linear-to-br from-slate-900 via-slate-800 to-teal-950 text-white p-6 sm:p-8 shadow-xl text-left space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-700/80">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Forecast Window Optimization</span>
            </div>
            <h2 className="text-2xl font-extrabold font-['Outfit',sans-serif]">
              Find a Better Time
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Based on the available forecast, these time windows may offer more favorable conditions.
            </p>
          </div>

          <div className="text-xs text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-xl self-start sm:self-auto">
            Selected: <strong>{time}</strong> (AQI {forecastAQI})
          </div>
        </div>

        {/* Suggested Better Times Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {betterTimeOptions.slice(0, 3).map((opt) => {
            const isProceed = opt.recommendationStatus === 'PROCEED';
            const isReduce = opt.recommendationStatus === 'REDUCE OUTDOOR EXPOSURE';

            return (
              <div
                key={opt.timeSlot}
                id={`better-time-card-${opt.timeSlot.replace(/[\s:]/g, '-')}`}
                className="p-5 rounded-2xl bg-white/10 border border-white/15 hover:border-emerald-400 hover:bg-white/15 transition-all text-left flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-white flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      <span>{opt.timeSlot}</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-extrabold ${
                      isProceed ? 'bg-emerald-400 text-slate-950' : isReduce ? 'bg-amber-400 text-slate-950' : 'bg-rose-400 text-slate-950'
                    }`}>
                      {isProceed ? 'PROCEED' : isReduce ? 'REDUCE EXPOSURE' : 'POSTPONE'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl font-black font-['Outfit',sans-serif] text-emerald-300">
                      AQI {opt.aqi}
                    </span>
                    <span className="text-xs text-slate-400">
                      ({opt.aqiCategory})
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-2 line-clamp-2">
                    {opt.explanation}
                  </p>
                </div>

                <button
                  id={`apply-better-time-${opt.timeSlot.replace(/[\s:]/g, '-')}`}
                  onClick={() => handleApplyBetterTime(opt)}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Switch to {opt.timeSlot}</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Saved Activity Plans Section */}
      <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 text-left space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold font-['Outfit',sans-serif] text-slate-900">
              Saved Activity Itinerary ({savedPlans.length})
            </h2>
            <p className="text-xs text-slate-500">
              Your personalized schedule with integrated air-quality safety statuses.
            </p>
          </div>
        </div>

        {savedPlans.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-sm">
            No saved plans yet. Use the form above to check and save your first outdoor session!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedPlans.map((plan) => {
              const isFavorable = plan.recommendationStatus === 'PROCEED';
              const isReduce = plan.recommendationStatus === 'REDUCE OUTDOOR EXPOSURE' || plan.recommendationStatus === 'REDUCE_EXPOSURE';

              return (
                <div
                  key={plan.id}
                  id={`saved-plan-card-${plan.id}`}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition-all flex flex-col justify-between space-y-3 text-left"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                        {plan.activity}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                        isFavorable ? 'bg-emerald-100 text-emerald-800' : isReduce ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {isFavorable ? '🟢 PROCEED' : isReduce ? '🟡 REDUCE EXPOSURE' : '🔴 POSTPONE'}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base">
                      {plan.destination}
                    </h3>
                    <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-2">
                      <span>📅 {plan.date}</span>
                      <span>•</span>
                      <span>⏰ {plan.time}</span>
                      <span>•</span>
                      <span>⏳ {plan.duration}</span>
                      <span>•</span>
                      <span className="font-semibold text-slate-800">AQI {plan.calculatedAQI}</span>
                    </div>

                    <p className="text-xs text-slate-600 mt-3 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                      {plan.whyExplanation}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 text-xs">
                    <span className="text-slate-400">Created at {plan.createdAt}</span>
                    <button
                      id={`delete-plan-${plan.id}`}
                      onClick={() => onDeletePlan(plan.id)}
                      className="text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 p-1 hover:bg-rose-50 rounded"
                      title="Delete plan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
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
