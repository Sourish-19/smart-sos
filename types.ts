
export type PageView = 'dashboard' | 'trends' | 'medications' | 'logs' | 'settings';

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
  reminderSent?: boolean; // New field to track notifications
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

export interface PatientState {
  name: string;
  age: number;
  id: string;
  phoneNumber?: string; // Added for WhatsApp notifications
  heartRate: VitalSign;
  bloodPressure: BloodPressure;
  oxygenLevel: VitalSign;
  glucose: VitalSign;
  status: AlertLevel;
  medications: Medication[];
  logs: EmergencyLog[];
  contacts: EmergencyContact[];
  location: { lat: number; lng: number; address: string };
}

export interface AIInsight {
  content: string;
  timestamp: string;
  type: 'info' | 'warning' | 'positive';
}