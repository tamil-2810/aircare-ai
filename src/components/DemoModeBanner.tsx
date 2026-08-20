import React from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  X, 
  Radio, 
  Play, 
  RotateCcw,
  Zap,
  Info
} from 'lucide-react';
import { HealthSensitivity, ActivityType, AQIData, UserProfile } from '../types';

export interface DemoScenario {
  id: 'good' | 'moderate' | 'unfavorable';
  name: string;
  title: string;
  location: string;
  aqi: number;
  healthSensitivity: HealthSensitivity;
  activity: ActivityType;
  duration: string;
  expectedStatus: 'PROCEED' | 'REDUCE OUTDOOR EXPOSURE' | 'CONSIDER POSTPONING';
  statusBadge: string;
  description: string;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'good',
    name: 'Scenario 1: Good Air Quality',
    title: 'Good Air Quality (AQI 45)',
    location: 'Coimbatore',
    aqi: 45,
    healthSensitivity: 'none',
    activity: 'Walking',
    duration: '30 Minutes',
    expectedStatus: 'PROCEED',
    statusBadge: '🟢 PROCEED',
    description: 'Coimbatore • AQI 45 • No Sensitivity • Walking (30 min)',
  },
  {
    id: 'moderate',
    name: 'Scenario 2: Moderate Conditions',
    title: 'Moderate Conditions (AQI 110)',
    location: 'Coimbatore',
    aqi: 110,
    healthSensitivity: 'mild',
    activity: 'Cycling',
    duration: '1 Hour',
    expectedStatus: 'REDUCE OUTDOOR EXPOSURE',
    statusBadge: '🟡 REDUCE OUTDOOR EXPOSURE',
    description: 'Coimbatore • AQI 110 • Mild Sensitivity • Cycling (1 hr)',
  },
  {
    id: 'unfavorable',
    name: 'Scenario 3: Unfavorable Conditions',
    title: 'Unfavorable Conditions (AQI 165)',
    location: 'Coimbatore',
    aqi: 165,
    healthSensitivity: 'high',
    activity: 'Running',
    duration: '1 Hour',
    expectedStatus: 'CONSIDER POSTPONING',
    statusBadge: '🔴 CONSIDER POSTPONING',
    description: 'Coimbatore • AQI 165 • High Sensitivity • Running (1 hr)',
  },
];

interface DemoModeBannerProps {
  isDemoMode: boolean;
  activeScenarioId?: string;
  onSelectScenario: (scenario: DemoScenario) => void;
  onExitDemoMode: () => void;
  onOpenDemoSelector?: () => void;
}

export const DemoModeBanner: React.FC<DemoModeBannerProps> = ({
  isDemoMode,
  activeScenarioId,
  onSelectScenario,
  onExitDemoMode,
}) => {
  if (!isDemoMode) return null;

  return (
    <div 
      id="demo-mode-alert-strip"
      className="bg-slate-900 text-white border-b border-amber-500/40 px-4 py-2.5 shadow-md relative z-30"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Left: Prominent Disclaimer Label */}
        <div className="flex items-center gap-2.5">
          <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-xs">
            <Zap className="w-3 h-3" />
            <span>Demo Data</span>
          </span>
          <span className="font-bold text-amber-200">
            For Prototype Demonstration
          </span>
          <span className="text-slate-400 hidden sm:inline">
            (Live API disconnected for offline evaluation)
          </span>
        </div>

        {/* Middle: 1-Click Scenario Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {DEMO_SCENARIOS.map((sc) => {
            const isSelected = activeScenarioId === sc.id;
            return (
              <button
                key={sc.id}
                id={`demo-scenario-btn-${sc.id}`}
                onClick={() => onSelectScenario(sc)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 shadow-sm'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
                title={sc.description}
              >
                <span>{sc.statusBadge.split(' ')[0]}</span>
                <span>{sc.id === 'good' ? 'Good (45)' : sc.id === 'moderate' ? 'Moderate (110)' : 'Unfavorable (165)'}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Exit / Switch back to live data */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="exit-demo-mode-btn"
            onClick={onExitDemoMode}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-semibold text-[11px] flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3 text-emerald-400" />
            <span>Switch to Live API</span>
          </button>
        </div>

      </div>
    </div>
  );
};
