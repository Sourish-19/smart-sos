
export type PageView = 'dashboard' | 'trends' | 'medications' | 'logs' | 'settings' | 'health-tips' | 'nutrition' | 'steps' | 'sleep';

export enum AlertLevel {
  STABLE = 'STABLE',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL'
}

export interface VitalSign {
  value: number;
  unit: string;
  label: string;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
  history: { time: string; value: number }[];
}

export interface BloodPressure {
  systolic: number;
  diastolic: number;
  history: { time: string; systolic: number; diastolic: number }[];
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
  reminderSent?: boolean; 
  type: 'pill' | 'liquid' | 'injection';
}

export interface EmergencyLog {
  id: string;
  timestamp: string;
  type: string;
  resolved: boolean;
  notes: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  isPrimary: boolean;
}

// Nutrition & Diet Types
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface NutritionState {
  isConfigured: boolean; // New flag for onboarding
  weight: number; // kg
  height: number; // cm
  goal: 'lose' | 'maintain' | 'gain';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active';
  dailyCalorieTarget: number;
  caloriesConsumed: number;
  macros: {
    protein: number; // grams
    carbs: number;
    fats: number;
  };
  meals: {
    breakfast: FoodItem[];
    lunch: FoodItem[];
    dinner: FoodItem[];
    snack: FoodItem[];
  };
  waterIntake: number; // glasses
}

export interface StepRecord {
  date: string; // YYYY-MM-DD or Day Name
  count: number;
  target: number;
  met: boolean;
}

// Sleep Types
export interface SleepState {
  score: number; // 0-100
  duration: string; // e.g., "7h 12m"
  bedTime: string;
  wakeTime: string;
  stages: {
    deep: number; // percentage
    light: number;
    rem: number;
    awake: number;
  };
  history: { day: string; hours: number; score: number }[]; // Last 7 days
}

export interface PatientState {
  name: string;
  age: number;
  id: string;
  phoneNumber?: string; 
  telegramBotToken?: string; 
  telegramChatId?: string;   
  heartRate: VitalSign;
  bloodPressure: BloodPressure;
  oxygenLevel: VitalSign;
  temperature: VitalSign; 
  steps: VitalSign; 
  dailyStepGoal: number; 
  stepPoints: number; 
  stepHistory: StepRecord[]; 
  sleep: SleepState; // New: Sleep Data
  status: AlertLevel;
  medications: Medication[];
  logs: EmergencyLog[];
  contacts: EmergencyContact[];
  location: { lat: number; lng: number; address: string };
  nutrition: NutritionState; 
}

export interface AIInsight {
  content: string;
  timestamp: string;
  type: 'info' | 'warning' | 'positive';
}
