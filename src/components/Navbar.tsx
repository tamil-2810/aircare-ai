import React from 'react';
import { 
  Wind, 
  Home, 
  Activity, 
  Calendar, 
  Users, 
  Bell, 
  User, 
  Sparkles,
  MapPin,
  ShieldAlert,
  ChevronRight,
  Zap,
  Play
} from 'lucide-react';
import { PageTab, UserProfile, AQIData } from '../types';

interface NavbarProps {
  currentTab: PageTab;
  onSelectTab: (tab: PageTab) => void;
  userProfile: UserProfile;
  aqiData: AQIData;
  unreadAlertsCount: number;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  isGuidedDemoActive?: boolean;
  onStartGuidedDemo?: () => void;
  onOpenAQIModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  userProfile,
  aqiData,
  unreadAlertsCount,
  isDemoMode,
  onToggleDemoMode,
  isGuidedDemoActive = false,
  onStartGuidedDemo,
  onOpenAQIModal,
}) => {
  const navItems: { id: PageTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'planner', label: 'Plan Activity', icon: Calendar },
    { id: 'family', label: 'Family', icon: Users },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Logo & Tagline */}
          <div 
            id="brand-logo-button"
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500 via-teal-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <Wind className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold font-['Outfit',sans-serif] tracking-tight bg-linear-to-r from-emerald-700 via-teal-800 to-slate-900 bg-clip-text text-transparent">
                  AirCare AI
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200/60">
                  v1.0
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium hidden sm:inline-block">
                Breathe Smart. Live Better.
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'text-emerald-700 bg-emerald-50/90 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.id === 'alerts' && unreadAlertsCount > 0 && (
                    <span className="w-4 h-4 text-[10px] font-bold bg-amber-500 text-white rounded-full flex items-center justify-center animate-pulse">
                      {unreadAlertsCount}
                    </span>
                  )}
                  {isActive && (
                    <div className="absolute bottom-0 left-3.5 right-3.5 h-0.5 bg-emerald-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Header Status / Demo / Profile Indicator */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Guided Demo Button */}
            {onStartGuidedDemo && (
              <button
                id="header-start-demo-journey-btn"
                onClick={onStartGuidedDemo}
                className={`hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isGuidedDemoActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80'
                }`}
                title="Start 2-3 minute guided Hackathon presentation tour"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Guided Tour</span>
              </button>
            )}

            {/* Demo Mode Toggle Button */}
            <button
              id="header-demo-mode-toggle-btn"
              onClick={onToggleDemoMode}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs ${
                isDemoMode
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 ring-2 ring-amber-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
              title="Toggle Demo Mode with offline preset scenarios"
            >
              <Zap className={`w-3.5 h-3.5 ${isDemoMode ? 'fill-current' : 'text-amber-500'}`} />
              <span>{isDemoMode ? 'Demo Mode Active' : 'Demo Mode'}</span>
            </button>

            {/* Live AQI Mini Widget Pill */}
            <button
              id="header-aqi-pill"
              onClick={onOpenAQIModal}
              title="Click to learn about AQI index"
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100/80 transition-colors shadow-xs"
            >
              <span className={`w-2 h-2 rounded-full ${isDemoMode ? 'bg-amber-500' : 'bg-emerald-500 animate-ping'}`} />
              <MapPin className="w-3.5 h-3.5 text-amber-700 hidden sm:inline-block" />
              <span className="font-semibold">{aqiData.location}</span>
              <span className="px-1.5 py-0.5 bg-amber-200/70 rounded text-[11px] font-bold">
                AQI {aqiData.aqi}
              </span>
            </button>

            {/* Quick Profile Trigger */}
            <button
              id="header-user-profile-badge"
              onClick={() => onSelectTab('profile')}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-full border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-linear-to-tr from-emerald-600 to-teal-500 text-white font-bold text-xs flex items-center justify-center">
                {userProfile.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:flex flex-col text-left text-xs leading-tight">
                <span className="font-semibold text-slate-800 truncate max-w-[80px]">
                  {userProfile.name.split(' ')[0]}
                </span>
                <span className="text-[10px] text-slate-500 capitalize">
                  {userProfile.healthSensitivity} sens.
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
