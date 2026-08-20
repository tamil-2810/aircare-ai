import React from 'react';
import { X, HeartHandshake, ShieldCheck, AlertTriangle, ShieldAlert, CheckCircle2, Home, Sparkles } from 'lucide-react';
import { FamilyMember, AQIData, ActivityType } from '../types';
import { evaluateRecommendation } from '../services/recommendationEngine';

interface FamilyAdviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  familyMembers: FamilyMember[];
  aqiData: AQIData;
}

export const FamilyAdviceModal: React.FC<FamilyAdviceModalProps> = ({
  isOpen,
  onClose,
  familyMembers,
  aqiData,
}) => {
  if (!isOpen) return null;

  // Evaluate dynamic recommendations for all family members
  const memberEvaluations = familyMembers.map((m) => {
    const rec = evaluateRecommendation({
      aqi: aqiData.aqi,
      userAge: m.age,
      healthSensitivity: m.sensitivity,
      activity: (m.preferredActivity || 'Walking') as ActivityType,
      duration: '45 Minutes',
      location: aqiData.location,
      plannedDateTime: 'Today',
    });
    return { member: m, rec };
  });

  const sensitiveCount = familyMembers.filter(
    (m) => m.sensitivity === 'moderate' || m.sensitivity === 'high'
  ).length;

  const postponeCount = memberEvaluations.filter(
    (e) => e.rec.recommendationStatus === 'CONSIDER POSTPONING'
  ).length;

  return (
    <div 
      id="family-advice-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
    >
      <div 
        id="family-advice-modal-container"
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 sm:p-8 text-left space-y-6 animate-in fade-in zoom-in-95 duration-200"
      >
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-100 text-teal-800">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Comprehensive Family Air Advisory</h2>
              <span className="text-xs text-slate-500">Tailored household strategy for {aqiData.location} (AQI {aqiData.aqi})</span>
            </div>
          </div>

          <button
            id="family-advice-modal-close-btn"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Highlight Banner */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
          <div className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Multi-Sensitivity Household Summary</span>
          </div>
          <p className="text-slate-700 leading-relaxed">
            {postponeCount > 0
              ? `Caution is advised for ${postponeCount} member(s). Consider shifting joint family outdoor workouts to indoor filtered spaces.`
              : sensitiveCount > 0
              ? `Your household has mixed sensitivities. Low-sensitivity members can proceed with early morning activities while sensitive members should limit peak afternoon outdoor exposure.`
              : `Air quality is favorable across all ${familyMembers.length} family members for outdoor activities.`}
          </p>
        </div>

        {/* Member-by-Member Breakdown */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Individual Member Action Protocols</h3>
          <div className="space-y-3">
            {memberEvaluations.map(({ member: m, rec }) => {
              const statusColor =
                rec.recommendationStatus === 'PROCEED'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : rec.recommendationStatus === 'REDUCE OUTDOOR EXPOSURE'
                  ? 'bg-amber-50 text-amber-900 border-amber-200'
                  : 'bg-rose-50 text-rose-900 border-rose-200';

              const statusBadge =
                rec.recommendationStatus === 'PROCEED'
                  ? '🟢 PROCEED'
                  : rec.recommendationStatus === 'REDUCE OUTDOOR EXPOSURE'
                  ? '🟡 REDUCE EXPOSURE'
                  : '🔴 POSTPONE';

              return (
                <div 
                  key={m.id} 
                  id={`advice-member-${m.id}`}
                  className={`p-4 rounded-2xl border ${statusColor} text-xs space-y-2`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl ${m.avatarColor} text-white font-bold flex items-center justify-center shrink-0`}>
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          {m.name} ({m.relationship}, Age {m.age})
                        </div>
                        <span className="text-slate-600 text-[11px] capitalize">
                          Sensitivity: <strong>{m.sensitivity}</strong> • Activity: {m.preferredActivity || 'Walking'}
                        </span>
                      </div>
                    </div>

                    <div className="font-extrabold text-xs px-2.5 py-1 rounded-lg bg-white/80 border border-current shadow-2xs self-start sm:self-auto">
                      {statusBadge}
                    </div>
                  </div>

                  <p className="text-xs text-slate-800 leading-relaxed">
                    {rec.personalizedExplanation}
                  </p>

                  {rec.generalPrecautions && rec.generalPrecautions.length > 0 && (
                    <div className="text-[11px] text-slate-700 bg-white/60 p-2 rounded-xl">
                      <strong className="text-slate-900">Key Precaution:</strong> {rec.generalPrecautions[0]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Household Indoor Air Tips */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <Home className="w-4 h-4 text-emerald-600" />
            <span>Household Clean-Air Checklist</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-600">
            <li>Keep windows sealed between 12:00 PM and 6:00 PM</li>
            <li>Run living room air purifier on continuous Auto mode</li>
            <li>Encourage all members to hydrate frequently with warm water</li>
            <li>Ensure rescue inhalers and antihistamines are easily accessible for sensitive members</li>
          </ul>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            id="family-advice-close-bottom-btn"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>

      </div>
    </div>
  );
};
