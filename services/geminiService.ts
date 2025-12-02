import { GoogleGenAI } from "@google/genai";
import { PatientState, AIInsight } from "../types";

const SYSTEM_INSTRUCTION = `
You are an advanced AI medical assistant for an elderly care dashboard called SmartSOS.
Your audience is the patient (Margaret, 72) and her family caregivers.
Keep responses concise (under 40 words), empathetic, and clear.
Analyze the provided vitals (Heart Rate, BP, SpO2, Glucose) and give a specific health insight or recommendation.
If vitals are normal, give positive reinforcement.
If vitals are abnormal, suggest a safe, non-medical immediate action (e.g., "Sit down", "Drink water") and suggest checking with a doctor.
`;

// --- SIMULATION HELPERS (Fallback when API Key is missing) ---

const simulateInsight = (patient: PatientState): AIInsight => {
  const isCritical = patient.status === 'CRITICAL';
  const isWarning = patient.status === 'WARNING';
  
  if (isCritical) {
    return {
      content: "⚠️ CRITICAL ALERT: Heart rate spike detected (>120 BPM). Emergency protocols recommended immediately.",
      timestamp: new Date().toLocaleTimeString(),
      type: 'warning'
    };
  }
  if (isWarning) {
    return {
      content: "Observation: Slight elevation in blood pressure detected. Advise patient to sit and hydrate.",
      timestamp: new Date().toLocaleTimeString(),
      type: 'warning'
    };
  }
  return {
    content: "Health Status: Stable. Vitals are within normal ranges. Keep up the good work!",
    timestamp: new Date().toLocaleTimeString(),
    type: 'positive'
  };
};

const simulateChatResponse = (text: string, patient: PatientState): string => {
  const t = text.toLowerCase();
  
  if (t.includes('hello') || t.includes('hi')) {
    return `Hello ${patient.name}. I am monitoring your health. Your current status is ${patient.status}.`;
  }
  if (t.includes('heart') || t.includes('rate') || t.includes('bpm')) {
    const hr = patient.heartRate.value;
    return `Your heart rate is currently ${hr} BPM. ${hr > 100 ? 'This is elevated. Please sit down and rest.' : 'This is a healthy resting rate.'}`;
  }
  if (t.includes('blood') || t.includes('pressure') || t.includes('bp')) {
    const { systolic, diastolic } = patient.bloodPressure;
    return `Your blood pressure is ${systolic}/${diastolic} mmHg. ${systolic > 130 ? 'It is slightly high.' : 'It is within the normal range.'}`;
  }
  if (t.includes('emergency') || t.includes('help') || t.includes('sos')) {
    return "If you are feeling unwell, please press the red SOS button immediately to contact your doctor.";
  }
  if (t.includes('thank')) {
    return "You're welcome. Stay safe!";
  }
  
  return "I am active and monitoring your vitals. I can provide updates on your Heart Rate or Blood Pressure, or assist with Emergency protocols. How can I help?";
};

// --- API SERVICES ---

const getApiKey = () => {
  try {
    return process.env.API_KEY;
  } catch (e) {
    return null;
  }
};

export const generateHealthInsight = async (patient: PatientState): Promise<AIInsight> => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      console.warn("API Key missing. Using Simulated Insight.");
      return simulateInsight(patient);
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      Current Status: ${patient.status}
      Heart Rate: ${patient.heartRate.value} bpm
      Blood Pressure: ${patient.bloodPressure.systolic}/${patient.bloodPressure.diastolic} mmHg
      Oxygen: ${patient.oxygenLevel.value}%
      Glucose: ${patient.glucose.value} mg/dL
      
      Generate a short health insight based on these numbers.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        maxOutputTokens: 100,
      }
    });

    const text = response.text || "Vitals monitored. Consult a doctor for detailed analysis.";

    let type: 'info' | 'warning' | 'positive' = 'info';
    if (patient.status === 'CRITICAL' || patient.status === 'WARNING') type = 'warning';
    else if (text.toLowerCase().includes('good') || text.toLowerCase().includes('excellent') || text.toLowerCase().includes('stable')) type = 'positive';

    return {
      content: text,
      timestamp: new Date().toLocaleTimeString(),
      type
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback to simulation on API error
    return simulateInsight(patient);
  }
};

export const getChatResponse = async (userMessage: string, patient: PatientState): Promise<string> => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
        return simulateChatResponse(userMessage, patient);
    }

    const ai = new GoogleGenAI({ apiKey });

    // We inject the current patient state as context in the prompt to ensure the AI considers the LATEST data.
    const contextPrompt = `
      [SYSTEM CONTEXT - HIDDEN FROM USER]
      Patient Name: ${patient.name}
      Current Vitals:
      - Heart Rate: ${patient.heartRate.value} bpm
      - BP: ${patient.bloodPressure.systolic}/${patient.bloodPressure.diastolic} mmHg
      - SpO2: ${patient.oxygenLevel.value}%
      - Glucose: ${patient.glucose.value} mg/dL
      - Status: ${patient.status}
      - Location: ${patient.location.address}
      
      Instruction: Answer the user's question acting as a helpful medical assistant. Be concise and reassuring.
      User Question: "${userMessage}"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contextPrompt,
    });

    return response.text || "I didn't catch that. Could you repeat?";
  } catch (error) {
    console.error("Chat API Error:", error);
    return simulateChatResponse(userMessage, patient);
  }
};