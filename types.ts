
export type PageView = 'dashboard' | 'trends' | 'medications' | 'logs' | 'settings' | 'health-tips' | 'nutrition';

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
  steps: VitalSign; // New: IoT Steps Data
  status: AlertLevel;
  medications: Medication[];
  logs: EmergencyLog[];
  contacts: EmergencyContact[];
  location: { lat: number; lng: number; address: string };
  nutrition: NutritionState; // New: Nutrition Data
}

export interface AIInsight {
  content: string;
  timestamp: string;
  type: 'info' | 'warning' | 'positive';
}
