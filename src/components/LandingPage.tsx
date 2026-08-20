import React from 'react';
import { 
  Wind, 
  ArrowRight, 
  ShieldCheck, 
  Calendar, 
  Users, 
  BellRing, 
  Sparkles, 
  CheckCircle2, 
  HeartPulse, 
  Clock, 
  MapPin, 
  Activity,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Smile
} from 'lucide-react';
import { PageTab, UserProfile, AQIData } from '../types';

interface LandingPageProps {
  onNavigate: (tab: PageTab) => void;
  userProfile: UserProfile;
  aqiData: AQIData;
  onOpenQuickDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  userProfile,
  aqiData,
  onOpenQuickDemo,
}) => {
  const steps = [
    {
      number: '01',
      title: 'Create Profile',
      desc: 'Set your age, baseline sensitivity, and preferred outdoor activities.',
      icon: HeartPulse,
      badge: 'Step 1',
    },
    {
      number: '02',
      title: 'Check AQI',
      desc: 'Real-time air pollution tracking & multi-pollutant breakdown.',
      icon: Activity,
      badge: 'Step 2',
    },
    {
      number: '03',
      title: 'AI Analysis',
      desc: 'Smart algorithms cross-reference respiratory strain and exposure times.',
      icon: Sparkles,
      badge: 'Step 3',
    },
    {
      number: '04',
      title: 'Get Advice',
      desc: 'Receive clear decisions: Proceed, Reduce Exposure, or Reschedule.',
      icon: ShieldCheck,
      badge: 'Step 4',
    },
  ];

  const features = [
    {
      id: 'feat-1',
      title: 'Personalized Guidance',
      desc: 'Beyond a raw number: tailored advice calculated from your specific respiratory profile and cardio exertion level.',
      icon: ShieldCheck,
      color: 'from-emerald-500 to-teal-600',
      actionTab: 'profile' as PageTab,
      highlight: 'Tailored for You',
    },
    {
      id: 'feat-2',
      title: 'Activity Planning',
      desc: 'Plan runs, cycling trips, or walks. Discover ideal low-pollution time windows to maximize outdoor health benefits.',
      icon: Calendar,
      color: 'from-blue-500 to-cyan-600',
      actionTab: 'planner' as PageTab,
      highlight: 'Smart Windows',
    },
    {
      id: 'feat-3',
      title: 'Family Mode',
      desc: 'Manage multiple profiles from children to elderly parents with individual health sensitivities and custom household alerts.',
      icon: Users,
      color: 'from-indigo-500 to-purple-600',
      actionTab: 'family' as PageTab,
      highlight: 'Multi-Member',
    },
    {
      id: 'feat-4',
      title: 'Smart Alerts',
      desc: 'Proactive warnings for sudden smog spikes and notifications when clean atmospheric windows open up.',
      icon: BellRing,
      color: 'from-amber-500 to-orange-600',
      actionTab: 'alerts' as PageTab,
      highlight: 'Proactive',
    },
  ];

  return (
    <div className="min-h-screen pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 bg-linear-to-b from-emerald-50/60 via-teal-50/30 to-slate-50 border-b border-slate-200/60">
        {/* Soft background ambient rings */}
        <div className="absolute top-0 right-1/4 -translate-y-1/2 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 translate-y-1/3 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-6 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Next-Gen Climate Health Intelligence</span>
              </div>

              {/* Title & Tagline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-['Outfit',sans-serif] tracking-tight text-slate-900 leading-[1.15]">
                Breathe Smart.{' '}
                <span className="bg-linear-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                  Live Better.
                </span>
              </h1>

              <p className="mt-5 text-lg sm:text-xl text-slate-600 max-w-2xl font-normal leading-relaxed">
                Personalized air-quality guidance based on your profile, activity, location, and planned time.
              </p>

              {/* Key Value Pill Question */}
              <div className="mt-6 p-3.5 sm:p-4 rounded-xl bg-white border border-emerald-200/90 shadow-sm flex items-start gap-3.5 max-w-xl">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                  <Wind className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    The AirCare AI Question
                  </div>
                  <div className="text-sm font-semibold text-slate-800 mt-0.5">
                    “What does the air quality mean for me, and what should I do?”
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4 w-full sm:w-auto">
                <button
                  id="hero-get-started-button"
                  onClick={() => onNavigate('profile')}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-base shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  id="hero-view-dashboard-button"
                  onClick={() => onNavigate('dashboard')}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-slate-300 hover:border-emerald-400 hover:bg-emerald-50/40 text-slate-700 font-semibold text-base shadow-xs hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>Explore Live AQI</span>
                </button>
              </div>

              {/* Trust highlights */}
              <div className="mt-8 pt-6 border-t border-slate-200/80 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>No Raw Jargon Overload</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>3-Tier Actionable Decisions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Family Sensitive Guard</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Preview Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md bg-white rounded-2xl p-6 shadow-xl border border-slate-200/90 hover:border-emerald-300 transition-all duration-300">
                {/* Header of card */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Live Personalized Simulation
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                    {aqiData.location}
                  </span>
                </div>

                {/* AQI vs Decision comparison */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-left">
                    <span className="text-xs font-semibold text-slate-500">Raw City AQI</span>
                    <div className="text-3xl font-extrabold text-amber-600 mt-1">165</div>
                    <span className="text-[11px] font-medium text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full inline-block mt-1">
                      Unhealthy
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-left">
                    <span className="text-xs font-semibold text-emerald-800">Your Action Plan</span>
                    <div className="text-sm font-bold text-amber-900 mt-1 leading-snug">
                      ⚠️ Reduce Outdoor Exposure
                    </div>
                    <span className="text-[11px] text-emerald-700 mt-1 block">
                      Shift run to 6:00 AM (AQI 82)
                    </span>
                  </div>
                </div>

                {/* Profile mini factor context */}
                <div className="mt-4 p-3 rounded-xl bg-slate-50/80 border border-slate-100 text-xs space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>User:</span>
                    <span className="font-semibold text-slate-800">{userProfile.name} (Age {userProfile.age})</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Health Sensitivity:</span>
                    <span className="font-semibold text-amber-700 capitalize">{userProfile.healthSensitivity}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Planned Activity:</span>
                    <span className="font-semibold text-slate-800">{userProfile.preferredActivity} • {userProfile.expectedDuration}</span>
                  </div>
                </div>

                {/* CTA inside preview */}
                <button
                  id="landing-quick-plan-button"
                  onClick={() => onNavigate('planner')}
                  className="mt-5 w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Plan Custom Outdoor Activity</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* "How It Works" Section */}
      <section className="py-16 bg-white border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              The Decision Pipeline
            </h2>
            <p className="mt-2 text-3xl font-extrabold font-['Outfit',sans-serif] text-slate-900 sm:text-4xl">
              How AirCare AI Works
            </p>
            <p className="mt-3 text-base text-slate-600">
              Simple 4-step intelligence turning raw environmental data into healthy daily choices.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="relative p-6 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all duration-200 group text-left"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-slate-300 group-hover:text-emerald-500 transition-colors font-['Outfit',sans-serif]">
                      {step.number}
                    </span>
                    <div className="p-2.5 rounded-xl bg-white shadow-xs text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1.5">{step.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Pipeline visual flow bar */}
          <div className="mt-8 p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs font-semibold text-emerald-900">
            <span className="px-3 py-1 bg-white rounded-lg shadow-xs">1. Create Profile</span>
            <ArrowRight className="w-4 h-4 text-emerald-600" />
            <span className="px-3 py-1 bg-white rounded-lg shadow-xs">2. Check AQI</span>
            <ArrowRight className="w-4 h-4 text-emerald-600" />
            <span className="px-3 py-1 bg-white rounded-lg shadow-xs">3. AI Analysis</span>
            <ArrowRight className="w-4 h-4 text-emerald-600" />
            <span className="px-3 py-1 bg-emerald-600 text-white rounded-lg shadow-xs">
              4. Get Personalized Advice
            </span>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Core Capabilities
            </h2>
            <p className="mt-2 text-3xl font-extrabold font-['Outfit',sans-serif] text-slate-900 sm:text-4xl">
              Engineered for Real-World Health
            </p>
            <p className="mt-3 text-base text-slate-600">
              Explore the four pillars supporting clean breathing and confident outdoor living.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.id}
                  id={`feature-card-${f.id}`}
                  onClick={() => onNavigate(f.actionTab)}
                  className="group cursor-pointer p-7 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-400 hover:shadow-lg transition-all duration-200 flex flex-col justify-between text-left"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${f.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 group-hover:bg-emerald-100 group-hover:text-emerald-800 transition-colors">
                        {f.highlight}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {f.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                      {f.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-semibold text-emerald-700">
                    <span>Explore {f.title}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to action banner */}
      <section className="mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-linear-to-r from-emerald-800 via-teal-900 to-slate-900 text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden text-left">
          <div className="absolute right-0 top-0 translate-x-1/3 -translate-y-1/3 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-2xl relative z-10">
            <h3 className="text-2xl sm:text-3xl font-extrabold font-['Outfit',sans-serif] tracking-tight">
              Ready to take control of your personal outdoor health?
            </h3>
            <p className="mt-3 text-slate-300 text-base">
              Set up your profile in 30 seconds to receive instant actionable air quality advice.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button
                id="cta-bottom-profile-btn"
                onClick={() => onNavigate('profile')}
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md transition-colors"
              >
                Configure Health Profile
              </button>
              <button
                id="cta-bottom-planner-btn"
                onClick={() => onNavigate('planner')}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-colors"
              >
                Plan Activity
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
