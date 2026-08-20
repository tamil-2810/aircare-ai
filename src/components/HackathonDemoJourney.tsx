import React from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Sparkles, 
  Play, 
  Users, 
  Calendar, 
  Activity, 
  Bell, 
  ShieldCheck,
  User,
  Compass
} from 'lucide-react';
import { PageTab } from '../types';

export interface DemoStep {
  step: number;
  title: string;
  tab: PageTab;
  tagline: string;
  actionPrompt: string;
}

export const HACKATHON_DEMO_STEPS: DemoStep[] = [
  {
    step: 1,
    title: 'Create Profile',
    tab: 'profile',
    tagline: 'Step 1 of 7: Health & Activity Baseline',
    actionPrompt: 'Set personal health sensitivity, age, and default exercise preferences.',
  },
  {
    step: 2,
    title: 'Select Activity',
    tab: 'planner',
    tagline: 'Step 2 of 7: Activity Scheduling',
    actionPrompt: 'Pick an outdoor routine (e.g. 6:00 AM 1-hour Run in Coimbatore).',
  },
  {
    step: 3,
    title: 'Check Air Quality',
    tab: 'dashboard',
    tagline: 'Step 3 of 7: Atmospheric Analysis',
    actionPrompt: 'Review live AQI, PM2.5, PM10, Ozone, and station measurements.',
  },
  {
    step: 4,
    title: 'View Recommendation',
    tab: 'recommendation',
    tagline: 'Step 4 of 7: Biometric Guidance',
    actionPrompt: 'Inspect What is happening, Why it matters, and What should I do.',
  },
  {
    step: 5,
    title: 'Find a Better Time',
    tab: 'future-planner',
    tagline: 'Step 5 of 7: Clean-Air Forecasting',
    actionPrompt: 'Discover optimal morning windows with low particulate exposure.',
  },
  {
    step: 6,
    title: 'Check Family Impact',
    tab: 'family',
    tagline: 'Step 6 of 7: Household Shield',
    actionPrompt: 'Evaluate personalized advisory for children, parents, and elders.',
  },
  {
    step: 7,
    title: 'View Smart Alerts',
    tab: 'alerts',
    tagline: 'Step 7 of 7: Contextual Alerts',
    actionPrompt: 'Manage real-time notifications with personalized toggle preferences.',
  },
];

interface HackathonDemoJourneyProps {
  isActive: boolean;
  currentStepIndex: number;
  onNavigateToStep: (stepIndex: number) => void;
  onCloseDemo: () => void;
}

export const HackathonDemoJourney: React.FC<HackathonDemoJourneyProps> = ({
  isActive,
  currentStepIndex,
  onNavigateToStep,
  onCloseDemo,
}) => {
  if (!isActive) return null;

  const currentStep = HACKATHON_DEMO_STEPS[currentStepIndex] || HACKATHON_DEMO_STEPS[0];
  const progressPercent = ((currentStepIndex + 1) / HACKATHON_DEMO_STEPS.length) * 100;

  return (
    <div 
      id="hackathon-guided-demo-bar"
      className="sticky top-16 sm:top-18 z-30 bg-white/95 backdrop-blur-md border-b border-emerald-300 shadow-md py-3 px-4 transition-all"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 text-left">
        
        {/* Step Indicator & Info */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
            {currentStep.step}/7
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black font-['Outfit',sans-serif] text-slate-900">
                {currentStep.tagline} — {currentStep.title}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                2–3 Min Hackathon Tour
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-tight mt-0.5 hidden sm:block">
              {currentStep.actionPrompt}
            </p>
          </div>
        </div>

        {/* Progress Bar & Navigation Controls */}
        <div className="flex items-center gap-3 self-end md:self-auto w-full md:w-auto justify-between md:justify-end">
          
          {/* Progress bar pill */}
          <div className="w-24 sm:w-32 bg-slate-100 h-2 rounded-full overflow-hidden shrink-0">
            <div 
              className="bg-emerald-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="demo-journey-prev-btn"
              disabled={currentStepIndex === 0}
              onClick={() => onNavigateToStep(Math.max(0, currentStepIndex - 1))}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back</span>
            </button>

            {currentStepIndex < HACKATHON_DEMO_STEPS.length - 1 ? (
              <button
                id="demo-journey-next-btn"
                onClick={() => onNavigateToStep(currentStepIndex + 1)}
                className="px-3.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1 shadow-xs transition-colors"
              >
                <span>Next: {HACKATHON_DEMO_STEPS[currentStepIndex + 1].title}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                id="demo-journey-finish-btn"
                onClick={onCloseDemo}
                className="px-3.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center gap-1 shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tour Complete!</span>
              </button>
            )}

            <button
              id="demo-journey-exit-btn"
              onClick={onCloseDemo}
              title="Exit Guided Tour"
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
