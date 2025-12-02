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

export const generateHealthInsight = async (patient: PatientState): Promise<AIInsight> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return {
        content: "API Key missing. Unable to generate AI insights.",
        timestamp: new Date().toLocaleTimeString(),
        type: 'info'
      };
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
    return {
      content: "Unable to reach AI service at this time.",
      timestamp: new Date().toLocaleTimeString(),
      type: 'info'
    };
  }
};

export const getChatResponse = async (userMessage: string, patient: PatientState): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return "I'm offline right now (API Key missing).";

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
    return "I'm having trouble connecting to the server.";
  }
};