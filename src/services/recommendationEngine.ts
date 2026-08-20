import {
  HealthSensitivity,
  ActivityType,
  RecommendationAction,
  RiskLevel,
  StructuredRecommendation,
  FactorsEvaluated,
} from '../types';

export interface RecommendationEngineInput {
  aqi: number;
  userAge?: number;
  healthSensitivity: HealthSensitivity;
  activity: ActivityType;
  duration: string;
  location?: string;
  plannedDateTime?: string;
  availableForecasts?: Array<{
    timeWindow: string;
    aqi: number;
    label: string;
  }>;
}

/**
 * Health Sensitivity Score Mapping:
 * None = 0
 * Mild = 1
 * Moderate = 2
 * High = 3
 */
export function getSensitivityScore(sensitivity: HealthSensitivity): number {
  switch (sensitivity) {
    case 'none':
      return 0;
    case 'mild':
      return 1;
    case 'moderate':
      return 2;
    case 'high':
      return 3;
    default:
      return 0;
  }
}

/**
 * Activity Intensity Level Mapping:
 * Walking = Low
 * Travel = Low
 * Cycling = Medium
 * Outdoor Exercise = High
 * Running = High
 * Other = Medium
 */
export function getActivityIntensity(activity: ActivityType): 'Low' | 'Medium' | 'High' {
  switch (activity) {
    case 'Walking':
    case 'Travel':
      return 'Low';
    case 'Cycling':
    case 'Other':
      return 'Medium';
    case 'Running':
    case 'Outdoor Exercise':
      return 'High';
    default:
      return 'Medium';
  }
}

/**
 * Duration Category Mapping:
 * < 30 mins = Lower Exposure
 * 30 to 60 mins = Medium Exposure
 * > 60 mins = Higher Exposure
 */
export function getDurationCategory(duration: string): 'Lower Exposure' | 'Medium Exposure' | 'Higher Exposure' {
  const lower = duration.toLowerCase();
  if (lower.includes('15') || lower.includes('20') || lower.includes('25') || lower.includes('less than 30')) {
    return 'Lower Exposure';
  }
  if (lower.includes('30 min') || lower.includes('45 min') || lower.includes('1 hour') || lower.includes('60 min')) {
    return 'Medium Exposure';
  }
  if (lower.includes('1.5') || lower.includes('2 hour') || lower.includes('3 hour') || lower.includes('more than 60')) {
    return 'Higher Exposure';
  }
  return 'Medium Exposure';
}

/**
 * AQI Standard Category Definition
 */
export function getAQICategory(aqi: number): string {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

/**
 * Core Rule-Based Decision Engine
 * 
 * Synthesizes:
 * AQI + Health Sensitivity (0-3) + Activity Intensity (Low/Med/High) + Duration + Age + Location + Time
 * into:
 * 1. PROCEED
 * 2. REDUCE OUTDOOR EXPOSURE
 * 3. CONSIDER POSTPONING
 */
export function evaluateRecommendation(input: RecommendationEngineInput): StructuredRecommendation {
  const {
    aqi,
    userAge = 21,
    healthSensitivity,
    activity,
    duration,
    location = 'Coimbatore',
    plannedDateTime = 'Tomorrow, 6:00 AM',
  } = input;

  const sensitivityLevel = getSensitivityScore(healthSensitivity);
  const activityIntensity = getActivityIntensity(activity);
  const durationCat = getDurationCategory(duration);
  const aqiCategory = getAQICategory(aqi);

  // Age sensitivity modifier (vulnerable age brackets)
  const isVulnerableAge = userAge < 12 || userAge >= 60;
  const effectiveSensitivity = isVulnerableAge ? Math.min(sensitivityLevel + 1, 3) : sensitivityLevel;

  let recommendationStatus: RecommendationAction = 'PROCEED';
  let riskLevel: RiskLevel = 'Low';
  let personalizedExplanation = '';
  const keyInfluencingFactors: string[] = [];

  // ==========================================
  // DECISION MATRIX IMPLEMENTATION
  // ==========================================

  if (aqi < 51) {
    // ------------------------------------------
    // AQI < 51: PROCEED
    // ------------------------------------------
    recommendationStatus = 'PROCEED';
    riskLevel = 'Low';
    personalizedExplanation =
      'Air quality is ideal for all outdoor activities. Ambient particulate concentrations are well within safe thresholds.';
    keyInfluencingFactors.push(`Low AQI (${aqi} - Good) provides clean breathing conditions.`);
  } else if (aqi >= 51 && aqi <= 100) {
    // ------------------------------------------
    // AQI 51 - 100: Usually PROCEED, awareness for sensitive users
    // ------------------------------------------
    if (effectiveSensitivity === 3 && activityIntensity === 'High' && durationCat === 'Higher Exposure') {
      recommendationStatus = 'REDUCE OUTDOOR EXPOSURE';
      riskLevel = 'Moderate';
      personalizedExplanation =
        'While general air quality is acceptable, prolonged intense exertion may cause respiratory fatigue due to your high sensitivity level.';
      keyInfluencingFactors.push(`Moderate AQI (${aqi}) combined with high sensitivity (${healthSensitivity}) and prolonged ${activity.toLowerCase()}.`);
    } else if (effectiveSensitivity >= 2) {
      recommendationStatus = 'PROCEED';
      riskLevel = 'Moderate';
      personalizedExplanation =
        'Air quality is generally acceptable. However, individuals with active respiratory sensitivities should remain mindful during extended exertion.';
      keyInfluencingFactors.push(`Moderate AQI (${aqi}) with ${healthSensitivity} sensitivity awareness.`);
    } else {
      recommendationStatus = 'PROCEED';
      riskLevel = 'Low';
      personalizedExplanation =
        'Conditions are favorable for your planned outdoor activity based on your profile.';
      keyInfluencingFactors.push(`Acceptable AQI (${aqi}) suitable for ${activity.toLowerCase()}.`);
    }
  } else if (aqi >= 101 && aqi <= 150) {
    // ------------------------------------------
    // AQI 101 - 150: Sensitive users OR high-intensity activities -> REDUCE OUTDOOR EXPOSURE
    // ------------------------------------------
    if (effectiveSensitivity >= 2 && activityIntensity === 'High') {
      recommendationStatus = 'CONSIDER POSTPONING';
      riskLevel = 'High';
      personalizedExplanation =
        'Elevated particulate matter in the Unhealthy for Sensitive Groups range combined with high cardio demand poses noticeable airway strain.';
      keyInfluencingFactors.push(`AQI ${aqi} (Unhealthy for Sensitive Groups)`);
      keyInfluencingFactors.push(`${healthSensitivity} sensitivity`);
      keyInfluencingFactors.push(`High intensity ${activity.toLowerCase()}`);
    } else if (effectiveSensitivity >= 1 || activityIntensity === 'High' || durationCat === 'Higher Exposure') {
      recommendationStatus = 'REDUCE OUTDOOR EXPOSURE';
      riskLevel = 'Moderate';
      personalizedExplanation =
        'Air pollution is elevated for sensitive groups. Consider reducing duration or switching to a lighter pace.';
      keyInfluencingFactors.push(`AQI ${aqi} elevated for ${activity.toLowerCase()} over ${duration}.`);
    } else {
      recommendationStatus = 'PROCEED';
      riskLevel = 'Moderate';
      personalizedExplanation =
        'Low-intensity activity for shorter duration is acceptable with hydration and routine monitoring.';
      keyInfluencingFactors.push(`Low-intensity ${activity.toLowerCase()} keeps particulate intake manageable.`);
    }
  } else if (aqi >= 151 && aqi <= 200) {
    // ------------------------------------------
    // AQI 151 - 200: Moderate or High sensitivity -> CONSIDER POSTPONING prolonged/intense activity
    // Other users -> REDUCE OUTDOOR EXPOSURE
    // ------------------------------------------
    if (effectiveSensitivity >= 2 || (effectiveSensitivity >= 1 && activityIntensity === 'High') || (activityIntensity === 'High' && durationCat !== 'Lower Exposure')) {
      recommendationStatus = 'CONSIDER POSTPONING';
      riskLevel = 'High';
      personalizedExplanation =
        'Current air quality may be unfavorable for a prolonged high-intensity outdoor activity based on your selected sensitivity and activity.';
      keyInfluencingFactors.push(`AQI: ${aqi} (Unhealthy)`);
      keyInfluencingFactors.push(`Sensitivity: ${healthSensitivity.charAt(0).toUpperCase() + healthSensitivity.slice(1)}`);
      keyInfluencingFactors.push(`Activity: ${activity} (${activityIntensity} Intensity)`);
      keyInfluencingFactors.push(`Duration: ${duration}`);
    } else {
      recommendationStatus = 'REDUCE OUTDOOR EXPOSURE';
      riskLevel = 'High';
      personalizedExplanation =
        'Unhealthy air quality index. Shorten outdoor duration and avoid high-cardio bursts to minimize particle deposition in lungs.';
      keyInfluencingFactors.push(`AQI ${aqi} (Unhealthy) exceeds standard outdoor exercise safety thresholds.`);
    }
  } else {
    // ------------------------------------------
    // AQI > 200: CONSIDER POSTPONING for all outdoor activities
    // ------------------------------------------
    recommendationStatus = 'CONSIDER POSTPONING';
    riskLevel = 'Very High';
    personalizedExplanation =
      'Hazardous / Very Unhealthy air quality. All individuals should avoid strenuous outdoor physical activities.';
    keyInfluencingFactors.push(`Very High AQI (${aqi}) poses significant acute respiratory risk to the entire population.`);
  }

  // ==========================================
  // GENERAL PRECAUTIONS (Tailored to Outcome)
  // ==========================================
  const generalPrecautions: string[] = [
    'Consider reducing prolonged outdoor exposure.',
    'Consider adjusting the activity time.',
    'Monitor changing air-quality conditions.',
    'Follow appropriate health guidance when necessary.',
  ];

  // Specific additional contextual precautions
  if (recommendationStatus === 'CONSIDER POSTPONING') {
    generalPrecautions.push('Opt for indoor exercise in a space equipped with HEPA air filtration.');
    generalPrecautions.push('Wear a certified N95 particulate respirator if spending essential time near traffic.');
  }

  // ==========================================
  // BETTER TIME FEATURE (Forecast Comparison)
  // ==========================================
  // Diurnal comparison: If current time is poor (e.g. 165 AQI), look for morning slots (e.g. 82 AQI)
  let betterTimeSuggestion = {
    hasBetterTime: true,
    suggestedWindow: 'Tomorrow: 6:00 AM – 7:00 AM',
    predictedAQI: 82,
    predictedCategory: 'Moderate',
    message: 'Better conditions may be available tomorrow between 6:00 AM and 7:00 AM, based on the current forecast data.',
  };

  if (aqi <= 85) {
    betterTimeSuggestion = {
      hasBetterTime: false,
      suggestedWindow: 'Current window is favorable',
      predictedAQI: aqi,
      predictedCategory: aqiCategory,
      message: 'Conditions during your selected time are currently among the most favorable in the forecast model.',
    };
  }

  // Structured Factors Evaluated
  const factorsEvaluated: FactorsEvaluated = {
    aqi,
    aqiCategory,
    userAge,
    healthSensitivity,
    sensitivityScore: sensitivityLevel,
    activity,
    activityIntensity,
    duration,
    durationCategory: durationCat,
    location,
    plannedDateTime,
  };

  // Why section breakdown
  const whySection = {
    heading: 'Why am I seeing this recommendation?',
    keyInfluencingFactors,
    detailedRationale: personalizedExplanation,
  };

  return {
    recommendationStatus,
    riskLevel,
    title:
      recommendationStatus === 'PROCEED'
        ? 'PROCEED'
        : recommendationStatus === 'REDUCE OUTDOOR EXPOSURE'
        ? 'REDUCE OUTDOOR EXPOSURE'
        : 'CONSIDER POSTPONING',
    personalizedExplanation,
    factorsEvaluated,
    generalPrecautions,
    betterTimeSuggestion,
    whySection,
  };
}

/**
 * Legacy compatibility adapter for components that expect the earlier signature
 */
export function generateRecommendation(
  aqi: number,
  sensitivity: HealthSensitivity,
  activity: ActivityType,
  duration: string,
  destination: string = 'Coimbatore'
) {
  const result = evaluateRecommendation({
    aqi,
    healthSensitivity: sensitivity,
    activity,
    duration,
    location: destination,
  });

  const legacyStatus =
    result.recommendationStatus === 'PROCEED'
      ? 'PROCEED'
      : result.recommendationStatus === 'REDUCE OUTDOOR EXPOSURE'
      ? 'REDUCE_EXPOSURE'
      : 'POSTPONE';

  const theme: 'emerald' | 'amber' | 'rose' =
    result.recommendationStatus === 'PROCEED'
      ? 'emerald'
      : result.recommendationStatus === 'REDUCE OUTDOOR EXPOSURE'
      ? 'amber'
      : 'rose';

  const statusBadge =
    result.recommendationStatus === 'PROCEED'
      ? '🟢 PROCEED'
      : result.recommendationStatus === 'REDUCE OUTDOOR EXPOSURE'
      ? '🟡 REDUCE OUTDOOR EXPOSURE'
      : '🔴 CONSIDER POSTPONING';

  return {
    status: legacyStatus,
    recommendationAction: result.recommendationStatus,
    statusBadge,
    statusHeadline: result.recommendationStatus,
    theme,
    riskScore:
      result.riskLevel === 'Low'
        ? 20
        : result.riskLevel === 'Moderate'
        ? 50
        : result.riskLevel === 'High'
        ? 80
        : 95,
    riskLevel: result.riskLevel,
    factors: {
      aqi: result.factorsEvaluated.aqi,
      sensitivity: result.factorsEvaluated.healthSensitivity,
      activity: result.factorsEvaluated.activity,
      duration: result.factorsEvaluated.duration,
      intensityLevel: result.factorsEvaluated.activityIntensity,
    },
    whyExplanation: result.personalizedExplanation,
    precautions: result.generalPrecautions.map((title) => ({
      title,
      description:
        title.includes('reducing')
          ? 'Shorten outdoor duration to minimize cumulative lung particle inhalation.'
          : title.includes('adjusting')
          ? 'Check cooler early-morning hours when traffic dispersion is superior.'
          : title.includes('Monitor')
          ? 'Air quality can shift with sudden wind or localized traffic spikes.'
          : 'Keep inhalers or N95 protection ready for sensitive respiratory conditions.',
      icon: 'shield' as const,
    })),
    betterTimeSuggestion: {
      timeWindow: result.betterTimeSuggestion.suggestedWindow,
      predictedAQI: result.betterTimeSuggestion.predictedAQI,
      status: result.betterTimeSuggestion.predictedCategory,
      reason: result.betterTimeSuggestion.message,
    },
    structuredResult: result,
  };
}
