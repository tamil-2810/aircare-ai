export type HealthSensitivity = 'none' | 'mild' | 'moderate' | 'high';

export type ActivityType =
  | 'Walking'
  | 'Running'
  | 'Cycling'
  | 'Outdoor Exercise'
  | 'Travel'
  | 'Other';

export type RecommendationAction =
  | 'PROCEED'
  | 'REDUCE OUTDOOR EXPOSURE'
  | 'CONSIDER POSTPONING';

export type RecommendationStatus =
  | 'PROCEED'
  | 'REDUCE OUTDOOR EXPOSURE'
  | 'CONSIDER POSTPONING'
  | 'REDUCE_EXPOSURE'
  | 'POSTPONE';

export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Very High';

export interface UserProfile {
  name: string;
  age: number;
  healthSensitivity: HealthSensitivity;
  preferredActivity: ActivityType;
  expectedDuration: string;
  respiratoryCondition?: string;
}

export interface PollutantInfo {
  name: string;
  value: number;
  unit: string;
  status: 'Good' | 'Moderate' | 'Unhealthy for Sensitive' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  description: string;
  safeLimit: string;
}

export interface ForecastSlot {
  id: string;
  label: string;
  timeRange: string;
  aqi: number;
  status: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  temp: number;
  condition: string;
  recommendationSnippet: string;
}

export interface AQIData {
  location: string;
  country: string;
  aqi: number;
  status: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  primaryPollutant: string;
  pollutants: {
    pm25: PollutantInfo;
    pm10: PollutantInfo;
    o3: PollutantInfo;
    no2: PollutantInfo;
    co: PollutantInfo;
  };
  forecast: ForecastSlot[];
  lastUpdated: string;
  dataSource?: 'open-meteo-live' | 'waqi-live' | 'mock-fallback';
  isRealData?: boolean;
  weather: {
    temp: number;
    humidity: number;
    windSpeed: number;
    uvIndex: number;
    condition: string;
  };
  meaningForYou: string;
}

export interface FactorsEvaluated {
  aqi: number;
  aqiCategory: string;
  userAge: number;
  healthSensitivity: HealthSensitivity;
  sensitivityScore: number;
  activity: ActivityType;
  activityIntensity: 'Low' | 'Medium' | 'High';
  duration: string;
  durationCategory: 'Lower Exposure' | 'Medium Exposure' | 'Higher Exposure';
  location: string;
  plannedDateTime: string;
}

export interface StructuredRecommendation {
  recommendationStatus: RecommendationAction;
  riskLevel: RiskLevel;
  title: string;
  personalizedExplanation: string;
  factorsEvaluated: FactorsEvaluated;
  generalPrecautions: string[];
  betterTimeSuggestion: {
    hasBetterTime: boolean;
    suggestedWindow: string;
    predictedAQI: number;
    predictedCategory: string;
    message: string;
  };
  whySection: {
    heading: string;
    keyInfluencingFactors: string[];
    detailedRationale: string;
  };
}

export interface ActivityPlan {
  id: string;
  activity: ActivityType;
  destination: string;
  date: string;
  time: string;
  duration: string;
  userSensitivity?: HealthSensitivity;
  calculatedAQI: number;
  recommendationStatus: RecommendationAction | RecommendationStatus;
  statusText: string;
  statusColor: string;
  whyExplanation: string;
  precautions: string[];
  betterTimeSuggestion: {
    timeWindow: string;
    predictedAQI: number;
    status: string;
    reason: string;
  };
  createdAt: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  age: number;
  sensitivity: HealthSensitivity;
  preferredActivity?: ActivityType;
  riskStatus: 'Safe' | 'Mild Risk' | 'Moderate Risk' | 'High Risk';
  avatarColor: string;
  customNotes?: string;
}

export interface BetterTimeOption {
  timeSlot: string;
  aqi: number;
  aqiCategory: string;
  recommendationStatus: RecommendationAction;
  isOptimal?: boolean;
  explanation: string;
}

export interface AlertPreferences {
  enableAirQualityAlerts: boolean;
  enablePlannedActivityAlerts: boolean;
  enableFamilyAlerts: boolean;
  enableBetterTimeSuggestions: boolean;
}

export interface AlertNotification {
  id: string;
  title: string;
  category: 'Air Quality Alert' | 'Favorable Window' | 'Health Advisory';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timeContext: string;
  precautions?: string[];
  betterTimeWindows?: {
    timeWindow: string;
    aqi: number;
    condition: string;
  }[];
  timestamp: string;
  isRead: boolean;
  isDismissed?: boolean;
  alertType?: 'high_aqi' | 'planned_activity' | 'better_time' | 'family' | 'health_advisory';
  aqi?: number;
  recommendationStatus?: RecommendationAction | RecommendationStatus;
}

export type PageTab =
  | 'home'
  | 'dashboard'
  | 'planner'
  | 'recommendation'
  | 'future-planner'
  | 'family'
  | 'alerts'
  | 'profile';
