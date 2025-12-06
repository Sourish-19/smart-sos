
import { GoogleGenAI } from "@google/genai";
import { PatientState, AIInsight } from "../types";

const SYSTEM_INSTRUCTION = `
You are an advanced AI medical assistant for an elderly care dashboard called SmartSOS.
Your audience is the patient (Margaret, 72) and her family caregivers.
Keep responses concise (under 40 words), empathetic, and clear.
Analyze the provided vitals (Heart Rate, BP, SpO2, Temperature) and give a specific health insight or recommendation.
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
  if (t.includes('temperature') || t.includes('temp') || t.includes('fever')) {
    const temp = patient.temperature.value.toFixed(1);
    return `Your body temperature is ${temp}°F. ${Number(temp) > 99.5 ? 'You might have a slight fever.' : 'This is normal.'}`;
  }
  if (t.includes('emergency') || t.includes('help') || t.includes('sos')) {
    return "If you are feeling unwell, please press the red SOS button immediately to contact your doctor.";
  }
  if (t.includes('thank')) {
    return "You're welcome. Stay safe!";
  }
  
  return "I am currently running in Demo Mode (Simulated AI). I can see your vitals are updated. You can ask me about your Heart Rate, Blood Pressure, or Emergency Protocols.";
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
      Temperature: ${patient.temperature.value} °F
      
      Generate a short health insight based on these numbers.
    `;

    // Using gemini-2.5-flash-lite for low-latency responses
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
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

    // 1. Extract Recent Logs (History)
    const recentLogs = patient.logs
      .slice(0, 3)
      .map(log => `- [${log.timestamp}] ${log.type}: ${log.notes}`)
      .join('\n      ') || "No recent incidents.";

    // 2. Extract Medication Adherence
    const totalMeds = patient.medications.length;
    const takenMeds = patient.medications.filter(m => m.taken).length;
    const pendingMeds = patient.medications.filter(m => !m.taken).map(m => m.name);
    
    const adherenceInfo = totalMeds > 0
      ? `${takenMeds}/${totalMeds} taken today. (Pending: ${pendingMeds.length > 0 ? pendingMeds.join(', ') : 'None'})`
      : "No active medications scheduled.";

    // 3. Inject Context
    const contextPrompt = `
      [SYSTEM CONTEXT - HIDDEN FROM USER]
      Patient Name: ${patient.name}
      
      Current Vitals:
      - Heart Rate: ${patient.heartRate.value} bpm
      - BP: ${patient.bloodPressure.systolic}/${patient.bloodPressure.diastolic} mmHg
      - SpO2: ${patient.oxygenLevel.value}%
      - Temperature: ${patient.temperature.value} °F
      - Status: ${patient.status}
      - Location: ${patient.location.address}

      Medical History Context:
      - Recent Alerts/Logs (Last 3):
      ${recentLogs}
      
      - Medication Adherence:
      ${adherenceInfo}
      
      Instruction: Answer the user's question acting as a helpful medical assistant. Be concise and reassuring. 
      Use the medical history or medication context if relevant to the user's question (e.g. if they ask about pills or past alerts).
      
      User Question: "${userMessage}"
    `;

    // Using gemini-3-pro-preview with thinking mode for complex queries
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: contextPrompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 } // Max thinking budget for deep reasoning
        // maxOutputTokens is intentionally omitted when using thinkingConfig
      }
    });

    return response.text || "I didn't catch that. Could you repeat?";
  } catch (error) {
    console.error("Chat API Error:", error);
    return simulateChatResponse(userMessage, patient);
  }
};

export const analyzeMedicationImage = async (base64Image: string): Promise<{ name: string; dosage: string; time: string; type: string } | null> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    // Simulation fallback
    return new Promise(resolve => setTimeout(() => resolve({
      name: "Simulated Med (No API Key)",
      dosage: "50mg",
      time: "09:00",
      type: "pill"
    }), 2000));
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image
          }
        },
        {
          text: `Analyze this image of a medication container or label. 
          Extract the following details:
          - Medication Name
          - Dosage (strength)
          - Recommended daily time (if not visible, default to '08:00')
          - Type/Form (strictly return one of: 'pill', 'liquid', 'injection')
          
          Return STRICT JSON ONLY. 
          - Do not use Markdown code blocks. 
          - Do not add any explanation text.
          - Do not include trailing commas.
          Format: { "name": "...", "dosage": "...", "time": "...", "type": "..." }`
        }
      ]
    });

    const text = response.text || "";
    
    // Robust extraction strategy
    // 1. Strip Markdown code blocks if they exist
    let cleanText = text.replace(/```json\n?|```/g, '').trim();
    
    // 2. Locate the first '{' and the last '}'
    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
        throw new Error("No JSON object found in response");
    }

    // 3. Extract the potential JSON string
    let jsonStr = cleanText.substring(firstBrace, lastBrace + 1);

    // 4. Attempt to parse
    try {
        return JSON.parse(jsonStr);
    } catch (parseError) {
        // Retry strategy: Sometimes model outputs multiple objects like {...} {...}
        // Try finding the *first* closing brace instead of the last
        const nextBrace = cleanText.indexOf('}', firstBrace);
        if (nextBrace !== -1 && nextBrace < lastBrace) {
            try {
                const shorterJson = cleanText.substring(firstBrace, nextBrace + 1);
                return JSON.parse(shorterJson);
            } catch (e) {
                // Ignore and throw original error
            }
        }
        
        // Sanitize trailing commas (common LLM JSON error)
        jsonStr = jsonStr.replace(/,\s*}/g, '}');
        return JSON.parse(jsonStr);
    }

  } catch (error) {
    console.error("Image Analysis Error:", error);
    return null;
  }
};
