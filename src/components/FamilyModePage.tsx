import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Heart, 
  HeartHandshake, 
  Activity, 
  Sparkles, 
  CheckCircle2, 
  Trash2, 
  Edit3,
  Info,
  ChevronRight,
  Home,
  Clock,
  RotateCcw,
  MapPin
} from 'lucide-react';
import { FamilyMember, UserProfile, AQIData, PageTab, ActivityType, RecommendationStatus } from '../types';
import { evaluateRecommendation } from '../services/recommendationEngine';

interface FamilyModePageProps {
  familyMembers: FamilyMember[];
  userProfile: UserProfile;
  aqiData: AQIData;
  onOpenAddModal: () => void;
  onOpenEditModal: (member: FamilyMember) => void;
  onOpenAdviceModal: () => void;
  onDeleteFamilyMember: (id: string) => void;
  onResetDemoMembers?: () => void;
  onNavigate: (tab: PageTab) => void;
}

export const FamilyModePage: React.FC<FamilyModePageProps> = ({
  familyMembers,
  userProfile,
  aqiData,
  onOpenAddModal,
  onOpenEditModal,
  onOpenAdviceModal,
  onDeleteFamilyMember,
  onResetDemoMembers,
  onNavigate,
}) => {
  // Local simulated AQI override for quick testing if desired
  const [activeAQI, setActiveAQI] = useState<number>(aqiData.aqi);

  // Keep simulated activeAQI synced when live aqiData updates
  React.useEffect(() => {
    setActiveAQI(aqiData.aqi);
  }, [aqiData.aqi]);

  // Compute recommendation for every member dynamically
  const memberEvaluations = familyMembers.map((member) => {
    const rec = evaluateRecommendation({
      aqi: activeAQI,
      userAge: member.age,
      healthSensitivity: member.sensitivity,
      activity: (member.preferredActivity || 'Walking') as ActivityType,
      duration: '45 Minutes',
      location: aqiData.location,
      plannedDateTime: 'Today',
    });

    return {
      member,
      rec,
      status: rec.recommendationStatus,
    };
  });

  // Calculate Family Summary statistics
  const totalMembers = familyMembers.length;
  const proceedCount = memberEvaluations.filter((e) => e.status === 'PROCEED').length;
  const reduceCount = memberEvaluations.filter((e) => e.status === 'REDUCE OUTDOOR EXPOSURE').length;
  const postponeCount = memberEvaluations.filter((e) => e.status === 'CONSIDER POSTPONING').length;
  const attentionCount = reduceCount + postponeCount;

  // Determine Most Cautious Overall Family Recommendation
  let overallStatus: RecommendationStatus = 'PROCEED';
  let overallHeadline = 'All Family Members Can Safely Proceed';
  let overallBannerBg = 'from-emerald-500/10 via-teal-500/5 to-emerald-500/10 border-emerald-300';
  let overallBadgeBg = 'bg-emerald-100 text-emerald-900 border-emerald-300';
  let overallIcon = ShieldCheck;
  let overallIconColor = 'text-emerald-600';
  let overallAdvisory =
    'Air quality is in a safe range for all household members. Great opportunity for joint family walks, cycling, and outdoor recreation.';

  if (postponeCount > 0) {
    overallStatus = 'CONSIDER POSTPONING';
    overallHeadline = `High Caution: Consider Postponing Outdoor Group Plans`;
    overallBannerBg = 'from-rose-500/10 via-red-500/5 to-orange-500/10 border-rose-300';
    overallBadgeBg = 'bg-rose-100 text-rose-900 border-rose-300';
    overallIcon = ShieldAlert;
    overallIconColor = 'text-rose-600';
    overallAdvisory = `If any family member receives CONSIDER POSTPONING (${postponeCount} member${postponeCount > 1 ? 's' : ''} affected), the family should consider adjusting outdoor plans, rescheduling activities, or switching to indoor exercises in HEPA-filtered rooms.`;
  } else if (reduceCount > 0) {
    overallStatus = 'REDUCE OUTDOOR EXPOSURE';
    overallHeadline = `Moderate Precaution: Reduce Outdoor Exposure for Sensitive Members`;
    overallBannerBg = 'from-amber-500/10 via-orange-500/5 to-teal-500/10 border-amber-300';
    overallBadgeBg = 'bg-amber-100 text-amber-900 border-amber-300';
    overallIcon = AlertTriangle;
    overallIconColor = 'text-amber-600';
    overallAdvisory = `${reduceCount} of your ${totalMembers} family member${totalMembers > 1 ? 's' : ''} should reduce outdoor exertion and avoid heavy cardio during peak daylight hours. Stagger outdoor routines or wear masks.`;
  }

  const OverallIconComponent = overallIcon;

  const getSensitivityBadge = (sens: string) => {
    switch (sens) {
      case 'none':
        return { label: 'None', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
      case 'mild':
        return { label: 'Mild', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'moderate':
        return { label: 'Moderate', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'high':
        return { label: 'High', bg: 'bg-rose-100 text-rose-900 border-rose-300' };
      default:
        return { label: sens, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const getStatusBadge = (status: RecommendationStatus) => {
    switch (status) {
      case 'PROCEED':
        return {
          label: '🟢 PROCEED',
          cardBorder: 'border-slate-200 hover:border-emerald-300',
          badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 'REDUCE OUTDOOR EXPOSURE':
        return {
          label: '🟡 REDUCE OUTDOOR EXPOSURE',
          cardBorder: 'border-amber-200 hover:border-amber-400',
          badgeBg: 'bg-amber-50 text-amber-900 border-amber-300',
          dot: 'bg-amber-500',
        };
      case 'CONSIDER POSTPONING':
        return {
          label: '🔴 CONSIDER POSTPONING',
          cardBorder: 'border-rose-200 hover:border-rose-400',
          badgeBg: 'bg-rose-50 text-rose-900 border-rose-300',
          dot: 'bg-rose-500',
        };
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-left space-y-8">
      
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5 text-indigo-700" />
            <span>Multi-Profile Household Shield</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-['Outfit',sans-serif] text-slate-900">
            Family Mode
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage individual family profiles and safeguard sensitive members with automated personalized air-quality recommendations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onResetDemoMembers && (
            <button
              id="family-reset-demo-btn"
              onClick={onResetDemoMembers}
              title="Reset to default demo members"
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Demo Family</span>
            </button>
          )}

          <button
            id="family-add-member-btn"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Family Member</span>
          </button>
        </div>
      </div>

      {/* Prominent Family Air Quality Summary Section */}
      <section 
        id="family-air-quality-summary"
        className={`rounded-3xl bg-linear-to-br ${overallBannerBg} border-2 p-6 sm:p-8 shadow-md text-left relative overflow-hidden`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="max-w-3xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${overallBadgeBg}`}>
                <OverallIconComponent className="w-3.5 h-3.5" />
                <span>Overall: {overallStatus}</span>
              </div>
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-600" />
                <span>{aqiData.location} (AQI {activeAQI})</span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold font-['Outfit',sans-serif] text-slate-900">
              Family Air Quality Summary
            </h2>

            {/* Dynamic Summary Sentence */}
            <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {attentionCount > 0
                ? `Current air quality may require extra attention for ${attentionCount} out of ${totalMembers} family member${totalMembers > 1 ? 's' : ''}.`
                : `Current air quality is suitable for all ${totalMembers} family members.`}
            </p>

            {/* Most Cautious Guidance */}
            <p className="text-sm text-slate-700 leading-relaxed">
              {overallAdvisory}
            </p>

            {/* 3-Column Breakdown Badges */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="p-3 rounded-2xl bg-white/90 border border-emerald-200 text-center">
                <div className="text-lg sm:text-2xl font-extrabold text-emerald-700">{proceedCount}</div>
                <div className="text-[11px] sm:text-xs font-bold text-emerald-900">🟢 Proceed</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/90 border border-amber-200 text-center">
                <div className="text-lg sm:text-2xl font-extrabold text-amber-700">{reduceCount}</div>
                <div className="text-[11px] sm:text-xs font-bold text-amber-900">🟡 Reduce Exp.</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/90 border border-rose-200 text-center">
                <div className="text-lg sm:text-2xl font-extrabold text-rose-700">{postponeCount}</div>
                <div className="text-[11px] sm:text-xs font-bold text-rose-900">🔴 Postpone</div>
              </div>
            </div>
          </div>

          {/* Action Button: View Full Family Advice */}
          <div className="shrink-0 flex flex-col gap-2.5">
            <button
              id="view-family-advice-btn"
              onClick={onOpenAdviceModal}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-colors"
            >
              <HeartHandshake className="w-4 h-4 text-emerald-400" />
              <span>View Family Advice</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Grid of Individual Family Members with Personalized Recommendations */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold font-['Outfit',sans-serif] text-slate-900">
              Household Profiles ({familyMembers.length})
            </h2>
            <p className="text-xs text-slate-500">
              Every member receives an individually evaluated recommendation based on age, sensitivity, and active AQI.
            </p>
          </div>
        </div>

        {familyMembers.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No family members added yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Add your parents, spouse, children, or siblings to monitor their personalized air quality guidance.
            </p>
            <button
              onClick={onOpenAddModal}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Member Now</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {memberEvaluations.map(({ member, rec, status }) => {
              const sensBadge = getSensitivityBadge(member.sensitivity);
              const statusBadge = getStatusBadge(status);

              return (
                <div
                  key={member.id}
                  id={`family-member-card-${member.id}`}
                  className={`p-6 rounded-3xl bg-white border ${statusBadge.cardBorder} shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between space-y-4`}
                >
                  <div>
                    {/* Top Bar: Avatar, Info & Action Buttons */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl ${member.avatarColor} text-white font-bold text-lg flex items-center justify-center shadow-xs shrink-0`}>
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 leading-tight">{member.name}</h3>
                          <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="font-semibold text-slate-700">{member.relationship}</span>
                            <span>•</span>
                            <span>Age {member.age}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons (Edit & Delete) */}
                      <div className="flex items-center gap-1">
                        <button
                          id={`family-member-edit-${member.id}`}
                          onClick={() => onOpenEditModal(member)}
                          className="text-slate-400 hover:text-emerald-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Edit member"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          id={`family-member-delete-${member.id}`}
                          onClick={() => onDeleteFamilyMember(member.id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Delete member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Sensitivity Pill & Location */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
                      <span className="text-xs text-slate-500 font-semibold">Health Sensitivity:</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${sensBadge.bg}`}>
                        {sensBadge.label}
                      </span>
                    </div>

                    {/* Recommendation Badge & Action Explanation */}
                    <div className={`mt-2 p-4 rounded-2xl border ${statusBadge.badgeBg} text-left space-y-2`}>
                      <div className="flex items-center justify-between text-xs font-extrabold">
                        <span className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
                          <span>{statusBadge.label}</span>
                        </span>
                        <span className="text-[11px] font-semibold opacity-80">
                          AQI: {activeAQI}
                        </span>
                      </div>
                      
                      <p className="text-xs font-medium leading-relaxed text-slate-800">
                        {rec.personalizedExplanation}
                      </p>

                      {rec.generalPrecautions && rec.generalPrecautions.length > 0 && (
                        <div className="pt-1 text-[11px] text-slate-600">
                          <span className="font-bold text-slate-700">Recommended: </span>
                          <span>{rec.generalPrecautions[0]}</span>
                        </div>
                      )}
                    </div>

                    {member.customNotes && (
                      <p className="text-[11px] text-slate-500 italic mt-2.5">
                        Note: {member.customNotes}
                      </p>
                    )}
                  </div>

                  {/* Footer Card Row */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700">
                    <span className="text-slate-500">
                      Routine: <strong className="text-slate-800">{member.preferredActivity || 'Walking'}</strong>
                    </span>
                    <button
                      onClick={onOpenAdviceModal}
                      className="hover:underline flex items-center gap-1 text-emerald-800"
                    >
                      <span>Full Advice</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Household Clean-Air Tips Grid */}
      <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 text-left">
        <h2 className="text-xl font-extrabold font-['Outfit',sans-serif] text-slate-900 mb-4 flex items-center gap-2">
          <Home className="w-5 h-5 text-emerald-600" />
          <span>Household Environmental Protocol</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">🪟 Window Scheduling</h3>
            <p className="text-xs text-slate-600">
              Keep external windows sealed between 1:00 PM and 6:00 PM when outdoor particulate levels peak in {aqiData.location}.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">🌀 Air Purifier Settings</h3>
            <p className="text-xs text-slate-600">
              Run living room HEPA units on Medium speed; increase bedroom filtration 30 minutes before sleep.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">🚴 Staggered Outdoor Routines</h3>
            <p className="text-xs text-slate-600">
              Low-sensitivity members can jog at 6:00 AM; sensitive members should do gentle indoor stretching.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
