import { 
  AlertNotification, 
  AQIData, 
  UserProfile, 
  FamilyMember, 
  ActivityPlan, 
  AlertPreferences 
} from '../types';

export interface AlertEngineParams {
  aqiData: AQIData;
  userProfile: UserProfile;
  familyMembers: FamilyMember[];
  savedPlans: ActivityPlan[];
  alertPreferences: AlertPreferences;
  readAlertIds: string[];
  dismissedAlertIds: string[];
  customAlerts?: AlertNotification[];
}

/**
 * Dynamically synthesizes contextual smart alerts based on live AQI,
 * user health profile, family sensitivity, and planned activities.
 */
export function generateSmartAlerts({
  aqiData,
  userProfile,
  familyMembers,
  savedPlans,
  alertPreferences,
  readAlertIds,
  dismissedAlertIds,
  customAlerts = [],
}: AlertEngineParams): AlertNotification[] {
  const generated: AlertNotification[] = [];
  const readSet = new Set(readAlertIds);
  const dismissedSet = new Set(dismissedAlertIds);

  // 1. High AQI Alert
  if (alertPreferences.enableAirQualityAlerts) {
    const isSensitive = userProfile.healthSensitivity === 'moderate' || userProfile.healthSensitivity === 'high';
    const isElevated = aqiData.aqi > 100;

    if (aqiData.aqi > 150 || (isElevated && isSensitive)) {
      const id = `alert-high-aqi-${aqiData.location.toLowerCase().replace(/\s+/g, '-')}`;
      generated.push({
        id,
        title: `High AQI Alert in ${aqiData.location}`,
        category: 'Air Quality Alert',
        alertType: 'high_aqi',
        severity: aqiData.aqi > 150 ? 'high' : 'medium',
        message: 'Air quality is currently unfavorable for some sensitive users.',
        timeContext: `Active now in ${aqiData.location}`,
        aqi: aqiData.aqi,
        recommendationStatus: aqiData.aqi > 150 ? 'CONSIDER POSTPONING' : 'REDUCE OUTDOOR EXPOSURE',
        timestamp: 'Live Active',
        isRead: readSet.has(id),
      });
    }
  }

  // 2. Planned Activity Alert
  if (alertPreferences.enablePlannedActivityAlerts && savedPlans.length > 0) {
    savedPlans.forEach((plan) => {
      if (plan.calculatedAQI > 100 || plan.recommendationStatus !== 'PROCEED') {
        const id = `alert-plan-${plan.id}`;
        generated.push({
          id,
          title: `Planned ${plan.activity} Alert`,
          category: 'Air Quality Alert',
          alertType: 'planned_activity',
          severity: plan.calculatedAQI > 150 ? 'high' : 'medium',
          message: 'Your planned outdoor activity tomorrow may have less favorable air-quality conditions.',
          timeContext: `${plan.date}, ${plan.time} in ${plan.destination}`,
          aqi: plan.calculatedAQI,
          recommendationStatus: plan.recommendationStatus,
          timestamp: 'Forecast Alert',
          isRead: readSet.has(id),
        });
      }
    });
  }

  // 3. Better Time Suggestions Alert
  if (alertPreferences.enableBetterTimeSuggestions && (aqiData.aqi > 90 || savedPlans.some(p => p.calculatedAQI > 100))) {
    const id = `alert-better-time-${aqiData.location.toLowerCase().replace(/\s+/g, '-')}`;
    generated.push({
      id,
      title: 'Better Time Alert',
      category: 'Favorable Window',
      alertType: 'better_time',
      severity: 'low',
      message: 'Conditions may be more favorable during an alternative time window based on the available forecast.',
      timeContext: 'Tomorrow Dawn (6:00 AM – 7:30 AM)',
      aqi: 82,
      recommendationStatus: 'PROCEED',
      betterTimeWindows: [
        { timeWindow: '6:00 AM', aqi: 82, condition: 'Clean Dawn Breeze' },
        { timeWindow: '7:00 PM', aqi: 95, condition: 'Evening Wind Dispersion' },
      ],
      timestamp: 'Forecast Insight',
      isRead: readSet.has(id),
    });
  }

  // 4. Family Alert
  if (alertPreferences.enableFamilyAlerts && familyMembers.length > 0) {
    const sensitiveMembers = familyMembers.filter(
      (m) => m.sensitivity === 'moderate' || m.sensitivity === 'high'
    );
    const count = sensitiveMembers.length;

    if (count > 0 && aqiData.aqi > 90) {
      const id = `alert-family-notice-${count}`;
      generated.push({
        id,
        title: 'Family Alert',
        category: 'Health Advisory',
        alertType: 'family',
        severity: aqiData.aqi > 150 ? 'high' : 'medium',
        message: 'Some family members may be more sensitive to the current air-quality conditions.',
        timeContext: `Current Household Policy for ${aqiData.location}`,
        aqi: aqiData.aqi,
        recommendationStatus: aqiData.aqi > 150 ? 'CONSIDER POSTPONING' : 'REDUCE OUTDOOR EXPOSURE',
        timestamp: 'Household Shield',
        isRead: readSet.has(id),
      });
    }
  }

  // Combine with any user custom/simulated alerts
  const combined = [...customAlerts, ...generated];

  // Filter out dismissed alerts and eliminate duplicate IDs
  const seenIds = new Set<string>();
  const filtered = combined.filter((alert) => {
    if (dismissedSet.has(alert.id)) return false;
    if (seenIds.has(alert.id)) return false;
    seenIds.add(alert.id);
    return true;
  });

  return filtered;
}
