import React, { useState, useEffect } from 'react';
import { 
  PageTab, 
  UserProfile, 
  AQIData, 
  FamilyMember, 
  AlertNotification, 
  ActivityPlan,
  ActivityType,
  AlertPreferences
} from './types';
import { 
  DEFAULT_USER_PROFILE, 
  INITIAL_AQI_DATA, 
  INITIAL_FAMILY_MEMBERS, 
  INITIAL_SAVED_PLANS
} from './data/mockData';
import { fetchAirQualityByLocation } from './services/airQualityService';
import { generateSmartAlerts } from './services/alertEngine';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { LandingPage } from './components/LandingPage';
import { ProfilePage } from './components/ProfilePage';
import { DashboardPage } from './components/DashboardPage';
import { ActivityPlannerPage } from './components/ActivityPlannerPage';
import { RecommendationPage } from './components/RecommendationPage';
import { FutureActivityPlannerPage } from './components/FutureActivityPlannerPage';
import { FamilyModePage } from './components/FamilyModePage';
import { AlertsPage } from './components/AlertsPage';
import { AQIInfoModal } from './components/AQIInfoModal';
import { AddFamilyModal } from './components/AddFamilyModal';
import { FamilyAdviceModal } from './components/FamilyAdviceModal';
import { DemoModeBanner, DemoScenario, DEMO_SCENARIOS } from './components/DemoModeBanner';
import { HackathonDemoJourney, HACKATHON_DEMO_STEPS } from './components/HackathonDemoJourney';

const DEFAULT_ALERT_PREFERENCES: AlertPreferences = {
  enableAirQualityAlerts: true,
  enablePlannedActivityAlerts: true,
  enableFamilyAlerts: true,
  enableBetterTimeSuggestions: true,
};

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<PageTab>('home');

  // Demo Mode States (with localStorage persistence)
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('aircare_demo_mode');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [activeScenarioId, setActiveScenarioId] = useState<string>('unfavorable');

  // Guided Hackathon Tour State
  const [isGuidedDemoActive, setIsGuidedDemoActive] = useState<boolean>(false);
  const [currentDemoStepIndex, setCurrentDemoStepIndex] = useState<number>(0);

  // Application Data States (with localStorage persistence)
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('aircare_user_profile');
      return saved ? JSON.parse(saved) : DEFAULT_USER_PROFILE;
    } catch {
      return DEFAULT_USER_PROFILE;
    }
  });

  const [aqiData, setAqiData] = useState<AQIData>(INITIAL_AQI_DATA);

  // Family Members with localStorage persistence
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => {
    try {
      const saved = localStorage.getItem('aircare_family_members');
      return saved ? JSON.parse(saved) : INITIAL_FAMILY_MEMBERS;
    } catch {
      return INITIAL_FAMILY_MEMBERS;
    }
  });

  // Saved Plans with localStorage persistence
  const [savedPlans, setSavedPlans] = useState<ActivityPlan[]>(() => {
    try {
      const saved = localStorage.getItem('aircare_saved_plans');
      return saved ? JSON.parse(saved) : INITIAL_SAVED_PLANS;
    } catch {
      return INITIAL_SAVED_PLANS;
    }
  });

  // Alert Preferences with localStorage persistence
  const [alertPreferences, setAlertPreferences] = useState<AlertPreferences>(() => {
    try {
      const saved = localStorage.getItem('aircare_alert_preferences');
      return saved ? JSON.parse(saved) : DEFAULT_ALERT_PREFERENCES;
    } catch {
      return DEFAULT_ALERT_PREFERENCES;
    }
  });

  // Read & Dismissed Alert IDs with localStorage persistence
  const [readAlertIds, setReadAlertIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('aircare_read_alert_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('aircare_dismissed_alert_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Custom user-triggered test alerts
  const [customAlerts, setCustomAlerts] = useState<AlertNotification[]>([]);

  // Live API States
  const [isLoadingAQI, setIsLoadingAQI] = useState<boolean>(false);
  const [aqiError, setAqiError] = useState<string | null>(null);
  const [isRealData, setIsRealData] = useState<boolean>(true);

  // Active plan for evaluation
  const [currentPlan, setCurrentPlan] = useState<Partial<ActivityPlan>>({
    activity: 'Running',
    destination: 'Coimbatore',
    date: 'Tomorrow',
    time: '6:00 AM',
    duration: '1 Hour',
    calculatedAQI: 165,
  });

  // Modal States
  const [isAQIModalOpen, setIsAQIModalOpen] = useState(false);
  const [isAddFamilyModalOpen, setIsAddFamilyModalOpen] = useState(false);
  const [editingFamilyMember, setEditingFamilyMember] = useState<FamilyMember | null>(null);
  const [isFamilyAdviceModalOpen, setIsFamilyAdviceModalOpen] = useState(false);

  // Persist demo mode
  useEffect(() => {
    try {
      localStorage.setItem('aircare_demo_mode', JSON.stringify(isDemoMode));
    } catch (e) {
      console.warn('Failed to save demo mode:', e);
    }
  }, [isDemoMode]);

  // Persist family members
  useEffect(() => {
    try {
      localStorage.setItem('aircare_family_members', JSON.stringify(familyMembers));
    } catch (e) {
      console.warn('Failed to save family members to localStorage:', e);
    }
  }, [familyMembers]);

  // Persist user profile
  useEffect(() => {
    try {
      localStorage.setItem('aircare_user_profile', JSON.stringify(userProfile));
    } catch (e) {
      console.warn('Failed to save user profile to localStorage:', e);
    }
  }, [userProfile]);

  // Persist saved plans
  useEffect(() => {
    try {
      localStorage.setItem('aircare_saved_plans', JSON.stringify(savedPlans));
    } catch (e) {
      console.warn('Failed to save plans to localStorage:', e);
    }
  }, [savedPlans]);

  // Persist alert preferences
  useEffect(() => {
    try {
      localStorage.setItem('aircare_alert_preferences', JSON.stringify(alertPreferences));
    } catch (e) {
      console.warn('Failed to save alert preferences to localStorage:', e);
    }
  }, [alertPreferences]);

  // Persist read alert ids
  useEffect(() => {
    try {
      localStorage.setItem('aircare_read_alert_ids', JSON.stringify(readAlertIds));
    } catch (e) {
      console.warn('Failed to save read alerts:', e);
    }
  }, [readAlertIds]);

  // Persist dismissed alert ids
  useEffect(() => {
    try {
      localStorage.setItem('aircare_dismissed_alert_ids', JSON.stringify(dismissedAlertIds));
    } catch (e) {
      console.warn('Failed to save dismissed alerts:', e);
    }
  }, [dismissedAlertIds]);

  // Dynamically synthesize alerts
  const dynamicAlerts = generateSmartAlerts({
    aqiData,
    userProfile,
    familyMembers,
    savedPlans,
    alertPreferences,
    readAlertIds,
    dismissedAlertIds,
    customAlerts,
  });

  // Fetch Live Air Quality function
  const fetchLiveAQI = async (cityName: string, coords?: { latitude: number; longitude: number }) => {
    if (isDemoMode) {
      setIsDemoMode(false);
    }
    setIsLoadingAQI(true);
    setAqiError(null);

    try {
      const result = await fetchAirQualityByLocation(cityName, coords);
      if (result.success) {
        setAqiData(result.data);
        setIsRealData(result.isRealData);
        // Sync with current plan
        setCurrentPlan((prev) => ({
          ...prev,
          destination: result.data.location,
          calculatedAQI: result.data.aqi,
        }));
      } else {
        setAqiError(result.message || 'Unable to retrieve the latest air-quality information.');
        setAqiData(result.data);
        setIsRealData(false);
      }
    } catch (err: any) {
      console.error('Air quality service fetch error:', err);
      setAqiError('Unable to retrieve the latest air-quality information.');
    } finally {
      setIsLoadingAQI(false);
    }
  };

  // Initial fetch for Coimbatore on application boot
  useEffect(() => {
    if (!isDemoMode) {
      fetchLiveAQI('Coimbatore');
    }
  }, []);

  // Demo Scenario Handler
  const handleSelectDemoScenario = (scenario: DemoScenario) => {
    setIsDemoMode(true);
    setActiveScenarioId(scenario.id);
    setIsLoadingAQI(false);
    setAqiError(null);
    setIsRealData(false);

    // Update AQI data to match scenario
    setAqiData({
      location: scenario.location,
      country: 'India',
      aqi: scenario.aqi,
      status: scenario.aqi <= 50 ? 'Good' : scenario.aqi <= 100 ? 'Moderate' : scenario.aqi <= 150 ? 'Unhealthy for Sensitive Groups' : 'Unhealthy',
      meaningForYou: scenario.aqi <= 50 ? 'Ideal conditions for outdoor routines.' : scenario.aqi <= 110 ? 'Acceptable air quality with mild sensitivity caution.' : 'Unfavorable air quality for prolonged strenuous outdoor routines.',
      actionRecommendation: scenario.expectedStatus,
      dominantPollutant: 'PM2.5',
      pollutants: [
        { name: 'PM2.5', code: 'pm25', value: scenario.aqi * 0.7, unit: 'µg/m³', status: scenario.aqi > 100 ? 'Unhealthy' : 'Good' },
        { name: 'PM10', code: 'pm10', value: scenario.aqi * 1.2, unit: 'µg/m³', status: scenario.aqi > 100 ? 'Moderate' : 'Good' },
        { name: 'Ozone', code: 'o3', value: scenario.aqi * 0.4, unit: 'µg/m³', status: 'Good' },
      ],
      hourlyForecast: [
        { time: '6:00 AM', aqi: 82, condition: 'Clean' },
        { time: '12:00 PM', aqi: 140, condition: 'Hazy' },
        { time: '6:00 PM', aqi: scenario.aqi, condition: 'Peak' },
      ],
      lastUpdated: 'Prototype Demo Scenario',
    });

    // Update User Profile
    setUserProfile((prev) => ({
      ...prev,
      healthSensitivity: scenario.healthSensitivity,
      preferredActivity: scenario.activity,
      expectedDuration: scenario.duration,
    }));

    // Update Current Plan
    setCurrentPlan({
      activity: scenario.activity,
      destination: scenario.location,
      date: 'Tomorrow',
      time: '6:00 AM',
      duration: scenario.duration,
      calculatedAQI: scenario.aqi,
    });
  };

  // Toggle Demo Mode
  const handleToggleDemoMode = () => {
    if (isDemoMode) {
      setIsDemoMode(false);
      fetchLiveAQI(aqiData.location || 'Coimbatore');
    } else {
      const defaultSc = DEMO_SCENARIOS.find((s) => s.id === activeScenarioId) || DEMO_SCENARIOS[2];
      handleSelectDemoScenario(defaultSc);
    }
  };

  // Guided Demo Tour Handlers
  const handleStartGuidedDemo = () => {
    setIsGuidedDemoActive(true);
    setCurrentDemoStepIndex(0);
    setCurrentTab(HACKATHON_DEMO_STEPS[0].tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToDemoStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < HACKATHON_DEMO_STEPS.length) {
      setCurrentDemoStepIndex(stepIndex);
      setCurrentTab(HACKATHON_DEMO_STEPS[stepIndex].tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCloseGuidedDemo = () => {
    setIsGuidedDemoActive(false);
  };

  // Unread Alerts Count
  const unreadAlertsCount = dynamicAlerts.filter((a) => !a.isRead).length;

  // City Switcher / Search handler
  const handleSelectCity = (cityName: string) => {
    fetchLiveAQI(cityName);
  };

  // Plan Check Air Quality handler
  const handleCheckAirQuality = async (planData: {
    activity: ActivityType;
    destination: string;
    date: string;
    time: string;
    duration: string;
  }) => {
    setIsLoadingAQI(true);
    let targetAQI = aqiData.aqi;

    try {
      const result = await fetchAirQualityByLocation(planData.destination);
      if (result.success) {
        setAqiData(result.data);
        setIsRealData(result.isRealData);
        targetAQI = result.data.aqi;
      }
    } catch (e) {
      console.warn('Fallback to local state AQI');
    } finally {
      setIsLoadingAQI(false);
    }

    setCurrentPlan({
      activity: planData.activity,
      destination: planData.destination,
      date: planData.date,
      time: planData.time,
      duration: planData.duration,
      calculatedAQI: targetAQI,
    });
    setCurrentTab('recommendation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Save new plan
  const handleSavePlan = (newPlan: ActivityPlan) => {
    setSavedPlans([newPlan, ...savedPlans.filter((p) => p.id !== newPlan.id)]);
  };

  // Delete plan
  const handleDeletePlan = (id: string) => {
    setSavedPlans(savedPlans.filter((p) => p.id !== id));
  };

  // Family Member Management
  const handleOpenAddFamilyModal = () => {
    setEditingFamilyMember(null);
    setIsAddFamilyModalOpen(true);
  };

  const handleOpenEditFamilyModal = (member: FamilyMember) => {
    setEditingFamilyMember(member);
    setIsAddFamilyModalOpen(true);
  };

  const handleAddFamilyMember = (newMember: FamilyMember) => {
    setFamilyMembers((prev) => [...prev, newMember]);
  };

  const handleUpdateFamilyMember = (updatedMember: FamilyMember) => {
    setFamilyMembers((prev) =>
      prev.map((m) => (m.id === updatedMember.id ? updatedMember : m))
    );
  };

  const handleDeleteFamilyMember = (id: string) => {
    setFamilyMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleResetDemoMembers = () => {
    setFamilyMembers(INITIAL_FAMILY_MEMBERS);
    try {
      localStorage.setItem('aircare_family_members', JSON.stringify(INITIAL_FAMILY_MEMBERS));
    } catch (e) {
      console.warn('Failed to reset family members in localStorage:', e);
    }
  };

  // Alerts Management
  const handleMarkAlertRead = (id: string) => {
    setReadAlertIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handleDismissAlert = (id: string) => {
    setDismissedAlertIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handleTriggerTestAlert = () => {
    const testAlert: AlertNotification = {
      id: `alert-test-${Date.now()}`,
      title: 'Sudden Smog Surge',
      category: 'Air Quality Alert',
      alertType: 'high_aqi',
      severity: 'high',
      message: `Localized dust and thermal stagnation detected in ${aqiData.location}. Particulate levels have elevated.`,
      timeContext: 'Active Next 2 Hours',
      aqi: 178,
      recommendationStatus: 'CONSIDER POSTPONING',
      betterTimeWindows: [
        { timeWindow: '6:00 AM Tomorrow', aqi: 78, condition: 'Clean Breeze' },
      ],
      timestamp: 'Just now',
      isRead: false,
    };
    setCustomAlerts((prev) => [testAlert, ...prev]);
  };

  const handleResetAlerts = () => {
    setReadAlertIds([]);
    setDismissedAlertIds([]);
    setCustomAlerts([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-200 selection:text-emerald-950 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Top Main Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        userProfile={userProfile}
        aqiData={aqiData}
        unreadAlertsCount={unreadAlertsCount}
        isDemoMode={isDemoMode}
        onToggleDemoMode={handleToggleDemoMode}
        isGuidedDemoActive={isGuidedDemoActive}
        onStartGuidedDemo={handleStartGuidedDemo}
        onOpenAQIModal={() => setIsAQIModalOpen(true)}
      />

      {/* Demo Mode Persistent Control Banner */}
      <DemoModeBanner
        isDemoMode={isDemoMode}
        activeScenarioId={activeScenarioId}
        onSelectScenario={handleSelectDemoScenario}
        onExitDemoMode={() => {
          setIsDemoMode(false);
          fetchLiveAQI('Coimbatore');
        }}
      />

      {/* Optional Hackathon Guided Demo Journey Strip */}
      <HackathonDemoJourney
        isActive={isGuidedDemoActive}
        currentStepIndex={currentDemoStepIndex}
        onNavigateToStep={handleNavigateToDemoStep}
        onCloseDemo={handleCloseGuidedDemo}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-20 md:pb-12">
        {currentTab === 'home' && (
          <LandingPage
            onNavigate={(tab) => {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            userProfile={userProfile}
            aqiData={aqiData}
            onOpenQuickDemo={() => {
              setCurrentTab('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'profile' && (
          <ProfilePage
            initialProfile={userProfile}
            onSaveProfile={(updated) => setUserProfile(updated)}
            onNavigate={(tab) => {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardPage
            aqiData={aqiData}
            userProfile={userProfile}
            isLoadingAQI={isLoadingAQI}
            aqiError={aqiError}
            isRealData={isRealData && !isDemoMode}
            onNavigate={(tab) => {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectCity={handleSelectCity}
            onSearchLocation={fetchLiveAQI}
            onRetry={() => fetchLiveAQI(aqiData.location)}
            onSwitchToDemoMode={() => handleSelectDemoScenario(DEMO_SCENARIOS[2])}
            onOpenAQIModal={() => setIsAQIModalOpen(true)}
          />
        )}

        {currentTab === 'planner' && (
          <ActivityPlannerPage
            userProfile={userProfile}
            currentDestination={aqiData.location}
            isLoadingAQI={isLoadingAQI}
            onCheckAirQuality={handleCheckAirQuality}
            onNavigate={(tab) => {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'recommendation' && (
          <RecommendationPage
            userProfile={userProfile}
            currentPlan={currentPlan}
            onSavePlan={handleSavePlan}
            onNavigate={(tab) => {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'future-planner' && (
          <FutureActivityPlannerPage
            userProfile={userProfile}
            savedPlans={savedPlans}
            onSavePlan={handleSavePlan}
            onDeletePlan={handleDeletePlan}
            onNavigate={(tab) => {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'family' && (
          <FamilyModePage
            familyMembers={familyMembers}
            userProfile={userProfile}
            aqiData={aqiData}
            onOpenAddModal={handleOpenAddFamilyModal}
            onOpenEditModal={handleOpenEditFamilyModal}
            onOpenAdviceModal={() => setIsFamilyAdviceModalOpen(true)}
            onDeleteFamilyMember={handleDeleteFamilyMember}
            onResetDemoMembers={handleResetDemoMembers}
            onNavigate={(tab) => {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'alerts' && (
          <AlertsPage
            alerts={dynamicAlerts}
            userProfile={userProfile}
            aqiData={aqiData}
            familyMembers={familyMembers}
            savedPlans={savedPlans}
            alertPreferences={alertPreferences}
            onUpdateAlertPreferences={setAlertPreferences}
            onMarkRead={handleMarkAlertRead}
            onDismissAlert={handleDismissAlert}
            onTriggerTestAlert={handleTriggerTestAlert}
            onResetAlerts={handleResetAlerts}
            onNavigate={(tab) => {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="hidden md:block bg-white border-t border-slate-200/80 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-['Outfit',sans-serif] text-sm font-bold text-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>AirCare AI</span>
            <span className="text-xs font-normal text-slate-400">— Breathe Smart. Live Better.</span>
          </div>
          <div className="text-slate-500">
            Personalized Air Quality & Smart Activity Advisory • Student Hackathon Prototype
          </div>
          <div className="flex items-center gap-4 text-slate-600 font-medium">
            <button onClick={() => setIsAQIModalOpen(true)} className="hover:text-emerald-700">AQI Guide</button>
            <button onClick={() => setCurrentTab('profile')} className="hover:text-emerald-700">Health Profile</button>
            <button onClick={() => setCurrentTab('family')} className="hover:text-emerald-700">Family Shield</button>
            <button onClick={() => setCurrentTab('future-planner')} className="hover:text-emerald-700">Future Planner</button>
          </div>
        </div>
      </footer>

      {/* Fixed Mobile Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        unreadAlertsCount={unreadAlertsCount}
      />

      {/* Global Interactive Modals */}
      <AQIInfoModal
        isOpen={isAQIModalOpen}
        onClose={() => setIsAQIModalOpen(false)}
      />

      <AddFamilyModal
        isOpen={isAddFamilyModalOpen}
        onClose={() => {
          setIsAddFamilyModalOpen(false);
          setEditingFamilyMember(null);
        }}
        onAddMember={handleAddFamilyMember}
        onUpdateMember={handleUpdateFamilyMember}
        memberToEdit={editingFamilyMember}
      />

      <FamilyAdviceModal
        isOpen={isFamilyAdviceModalOpen}
        onClose={() => setIsFamilyAdviceModalOpen(false)}
        familyMembers={familyMembers}
        aqiData={aqiData}
      />
    </div>
  );
}
