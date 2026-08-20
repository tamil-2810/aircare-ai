import React, { useState } from 'react';
import { 
  User, 
  Heart, 
  Activity, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  ArrowRight,
  Info,
  Flame,
  Stethoscope
} from 'lucide-react';
import { UserProfile, HealthSensitivity, ActivityType, PageTab } from '../types';
import { evaluateRecommendation } from '../services/recommendationEngine';

interface ProfilePageProps {
  initialProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onNavigate: (tab: PageTab) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  initialProfile,
  onSaveProfile,
  onNavigate,
}) => {
  const [formData, setFormData] = useState<UserProfile>(initialProfile);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Live simulation of the recommendation for Coimbatore (AQI 165)
  const sampleRec = evaluateRecommendation({
    aqi: 165,
    userAge: formData.age,
    healthSensitivity: formData.healthSensitivity,
    activity: formData.preferredActivity,
    duration: formData.expectedDuration,
    location: 'Coimbatore',
  });

  const sensitivityOptions: {
    value: HealthSensitivity;
    label: string;
    description: string;
    badgeColor: string;
    recommendedFor: string;
  }[] = [
    {
      value: 'none',
      label: 'None',
      description: 'No history of respiratory, cardiovascular, or allergic sensitivities. Standard healthy endurance.',
      badgeColor: 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800',
      recommendedFor: 'Healthy adults & youth with no symptoms',
    },
    {
      value: 'mild',
      label: 'Mild',
      description: 'Occasional eye or throat irritation during heavy smog days or dry dusty seasons.',
      badgeColor: 'border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900',
      recommendedFor: 'Occasional seasonal cough or dust sensitivity',
    },
    {
      value: 'moderate',
      label: 'Moderate',
      description: 'Mild asthma, active pollen allergies, sinus vulnerability, or recovering from chest cold.',
      badgeColor: 'border-amber-300 bg-amber-50/70 hover:bg-amber-100 text-amber-900',
      recommendedFor: 'Diagnosed asthma, seniors, pregnant individuals',
    },
    {
      value: 'high',
      label: 'High',
      description: 'Chronic pulmonary condition (COPD), heart condition, acute asthma, or severe particle reactivity.',
      badgeColor: 'border-rose-300 bg-rose-50/70 hover:bg-rose-100 text-rose-900',
      recommendedFor: 'High clinical vulnerability, respiratory therapy patients',
    },
  ];

  const activitiesList: { value: ActivityType; label: string; iconEmoji: string; intensity: string }[] = [
    { value: 'Walking', label: 'Walking', iconEmoji: '🚶', intensity: 'Low Cardio' },
    { value: 'Running', label: 'Running', iconEmoji: '🏃', intensity: 'High Cardio' },
    { value: 'Cycling', label: 'Cycling', iconEmoji: '🚴', intensity: 'High Cardio' },
    { value: 'Outdoor Exercise', label: 'Outdoor Exercise', iconEmoji: '🧘', intensity: 'Moderate Cardio' },
    { value: 'Travel', label: 'Travel / Commute', iconEmoji: '🚗', intensity: 'Low Cardio' },
    { value: 'Other', label: 'Other Activities', iconEmoji: '⚡', intensity: 'Custom Exertion' },
  ];

  const durationOptions = [
    '30 Minutes',
    '45 Minutes',
    '1 Hour',
    '1.5 Hours',
    '2 Hours',
    '3+ Hours',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      onNavigate('dashboard');
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/90 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
          <User className="w-3.5 h-3.5 text-emerald-700" />
          <span>Health & Activity Baseline</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-['Outfit',sans-serif] text-slate-900">
          Personal Profile
        </h1>
        <p className="mt-2 text-base text-slate-600">
          AirCare AI calibrates particulate inhalation risk specifically against your sensitivity, age, and workout intensity.
        </p>
      </div>

      {/* Main Profile Form Card */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 text-left space-y-8">
          
          {/* Section 1: Basic Demographics */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-emerald-600" />
              <span>Personal Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Name */}
              <div>
                <label htmlFor="user-name-input" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Full Name
                </label>
                <input
                  id="user-name-input"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Alex Tamil"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 text-sm"
                />
              </div>

              {/* Age */}
              <div>
                <label htmlFor="user-age-input" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Age (Years)
                </label>
                <input
                  id="user-age-input"
                  type="number"
                  required
                  min="3"
                  max="115"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 text-sm"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Children (&lt;18) and seniors (60+) receive specialized sensitivity offsets.
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Health Sensitivity */}
          <div className="pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                <span>Health Sensitivity</span>
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                Current: <span className="capitalize font-bold text-emerald-700">{formData.healthSensitivity}</span>
              </span>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Select how your respiratory system responds to smog, fine dust, or pollutants:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {sensitivityOptions.map((opt) => {
                const isSelected = formData.healthSensitivity === opt.value;
                return (
                  <button
                    type="button"
                    key={opt.value}
                    id={`sensitivity-opt-${opt.value}`}
                    onClick={() => setFormData({ ...formData, healthSensitivity: opt.value })}
                    className={`p-4 rounded-xl border text-left transition-all duration-150 relative ${
                      isSelected
                        ? 'border-emerald-600 ring-2 ring-emerald-500/30 bg-emerald-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm text-slate-900 capitalize flex items-center gap-2">
                        {opt.label}
                        {isSelected && (
                          <Check className="w-4 h-4 text-emerald-600" />
                        )}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase">
                        {opt.value === 'high' ? 'Strict Advisory' : opt.value === 'moderate' ? 'Caution Tier' : 'Standard Tier'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mb-2">
                      {opt.description}
                    </p>
                    <div className="text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-100">
                      Ideal for: <span className="text-slate-700">{opt.recommendedFor}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Preferred Outdoor Activity */}
          <div className="pt-6 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-blue-600" />
              <span>Preferred Outdoor Activity</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {activitiesList.map((act) => {
                const isSelected = formData.preferredActivity === act.value;
                return (
                  <button
                    type="button"
                    key={act.value}
                    id={`activity-pref-${act.value.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => setFormData({ ...formData, preferredActivity: act.value })}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20 text-emerald-950 font-bold'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="text-2xl mb-1.5">{act.iconEmoji}</div>
                    <div className="text-sm font-semibold">{act.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{act.intensity}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Expected Outdoor Duration */}
          <div className="pt-6 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-indigo-600" />
              <span>Expected Outdoor Duration</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {durationOptions.map((dur) => {
                const isSelected = formData.expectedDuration === dur;
                return (
                  <button
                    type="button"
                    key={dur}
                    id={`duration-opt-${dur.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => setFormData({ ...formData, expectedDuration: dur })}
                    className={`py-2.5 px-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {dur}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Additional Health Notes (Optional) */}
          <div className="pt-6 border-t border-slate-100">
            <label htmlFor="user-condition-notes" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Specific Respiratory Conditions or Notes (Optional)
            </label>
            <input
              id="user-condition-notes"
              type="text"
              value={formData.respiratoryCondition || ''}
              onChange={(e) => setFormData({ ...formData, respiratoryCondition: e.target.value })}
              placeholder="e.g. Mild seasonal allergies, uses inhaler post-run, dust sensitivity"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 text-sm"
            />
          </div>

          {/* Live Recommendation Engine Preview Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Live Engine Calibration (Simulating Coimbatore AQI 165)</span>
              </div>
              <p className="text-xs text-slate-500">
                Calculated outcome for {formData.preferredActivity} ({formData.expectedDuration}) with {formData.healthSensitivity} sensitivity.
              </p>
            </div>

            <span className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 text-center ${
              sampleRec.recommendationStatus === 'CONSIDER POSTPONING' ? 'bg-rose-100 text-rose-900 border border-rose-300' :
              sampleRec.recommendationStatus === 'REDUCE OUTDOOR EXPOSURE' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
              'bg-emerald-100 text-emerald-900 border border-emerald-300'
            }`}>
              {sampleRec.recommendationStatus === 'CONSIDER POSTPONING' ? '🔴 CONSIDER POSTPONING' :
               sampleRec.recommendationStatus === 'REDUCE OUTDOOR EXPOSURE' ? '🟡 REDUCE OUTDOOR EXPOSURE' :
               '🟢 PROCEED'}
            </span>
          </div>

        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl">
          <div className="text-xs text-emerald-900 text-left">
            <span className="font-bold">Ready to apply!</span> Your recommendations across Dashboard, Planner, and Alerts will automatically synchronize.
          </div>

          <button
            type="submit"
            id="profile-save-continue-btn"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-base shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all"
          >
            {savedSuccess ? (
              <>
                <Check className="w-5 h-5 text-emerald-200" />
                <span>Profile Saved! Redirecting...</span>
              </>
            ) : (
              <>
                <span>Save & Continue</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
