
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Menu, Mic, AlertTriangle, Phone, Moon, Sun, Activity, Bell, X, Trash2 } from 'lucide-react';
import { generateHealthInsight } from './services/geminiService';
import { authService, User } from './services/authService';
import { sendTelegramMessage } from './services/telegramService';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import VitalsTrends from './components/VitalsTrends';
import Medications from './components/Medications';
import EmergencyLog from './components/EmergencyLog';
import Settings from './components/Settings';
import HealthTips from './components/HealthTips';
import NutritionTracker from './components/NutritionTracker';
import StepsTracker from './components/StepsTracker';
import SleepTracker from './components/SleepTracker';
import Auth from './components/Auth';
import LandingPage from './components/LandingPage';
import ChatAssistant from './components/ChatAssistant';
import NotificationSystem, { Notification, NotificationType } from './components/NotificationSystem';
import { PageView, PatientState, AlertLevel, AIInsight, Medication, EmergencyLog as EmergencyLogType, EmergencyContact, NutritionState } from './types';

// Helper to generate mock history for steps
const generateStepHistory = () => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days.map((day, i) => ({
    date: day,
    count: Math.floor(Math.random() * 8000) + 2000,
    target: 6000,
    met: Math.random() > 0.4
  }));
};

// Initial Mock Data Structure (Actual data will be hydrated with User info)
const INITIAL_PATIENT: PatientState = {
  id: "PT-89234",
  name: "Guest User",
  age: 65,
  phoneNumber: "",
  telegramBotToken: "",
  telegramChatId: "",
  status: AlertLevel.STABLE,
  location: { lat: 34.0522, lng: -118.2437, address: "142 Oak Street, Springfield" },
  heartRate: { 
    value: 72, unit: 'BPM', label: 'Heart Rate', trend: 'stable', lastUpdated: 'Now',
    history: Array.from({length: 20}, (_, i) => ({ time: `${i}:00`, value: 70 + Math.random() * 5 }))
  },
  bloodPressure: {
    systolic: 118, diastolic: 76,
    history: Array.from({length: 20}, (_, i) => ({ time: `${i}:00`, systolic: 115 + Math.random() * 10, diastolic: 75 + Math.random() * 5 }))
  },
  oxygenLevel: { value: 98, unit: '%', label: 'SpO2', trend: 'stable', lastUpdated: 'Now', history: [] },
  temperature: { 
    value: 98.6, unit: '°F', label: 'Temperature', trend: 'stable', lastUpdated: 'Now', 
    history: Array.from({length: 20}, (_, i) => ({ time: `${i}:00`, value: 98.4 + Math.random() * 0.5 })) 
  },
  steps: {
    value: 4250, unit: 'steps', label: 'Steps', trend: 'up', lastUpdated: 'Now', history: []
  },
  dailyStepGoal: 6000,
  stepPoints: 1250,
  stepHistory: generateStepHistory(),
  sleep: {
    score: 85,
    duration: "7h 12m",
    bedTime: "10:30 PM",
    wakeTime: "06:45 AM",
    stages: { deep: 18, light: 58, rem: 22, awake: 2 },
    history: [
        { day: 'Sun', hours: 6.5, score: 72 },
        { day: 'Mon', hours: 7.2, score: 85 },
        { day: 'Tue', hours: 6.8, score: 78 },
        { day: 'Wed', hours: 7.5, score: 88 },
        { day: 'Thu', hours: 7.0, score: 82 },
        { day: 'Fri', hours: 5.5, score: 60 },
        { day: 'Sat', hours: 8.0, score: 92 },
    ]
  },
  nutrition: {
    isConfigured: false, // Default to false to trigger onboarding
    weight: 0, // kg
    height: 0, // cm
    goal: 'maintain',
    activityLevel: 'light',
    dailyCalorieTarget: 2000,
    caloriesConsumed: 0,
    macros: { protein: 0, carbs: 0, fats: 0 },
    meals: { breakfast: [], lunch: [], dinner: [], snack: [] },
    waterIntake: 0
  },
  medications: [
    { id: '1', name: 'Lisinopril', dosage: '10mg', time: '08:00', taken: true, type: 'pill', reminderSent: false },
    { id: '2', name: 'Metformin', dosage: '500mg', time: '12:00', taken: false, type: 'pill', reminderSent: false },
    { id: '3', name: 'Aspirin', dosage: '81mg', time: '21:00', taken: false, type: 'pill', reminderSent: false }
  ],
  logs: [],
  contacts: [
    { id: 'c1', name: 'Dr. Michael Chen', relation: 'Cardiologist', phone: '555-0123', isPrimary: true },
    { id: 'c2', name: 'Sarah Thompson', relation: 'Daughter', phone: '555-0199', isPrimary: false }
  ]
};

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageView>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [patient, setPatient] = useState<PatientState>(INITIAL_PATIENT);
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(5);
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const patientRef = React.useRef(patient);
  
  // Audio Context Ref for Siren
  const audioContextRef = useRef<AudioContext | null>(null);

  // Keep ref synced with state
  useEffect(() => {
    patientRef.current = patient;
  }, [patient]);

  // --- Theme Logic ---
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // --- Auth & Session Init ---
  useEffect(() => {
    // Check for active session on load
    const user = authService.getCurrentUser();
    if (user) {
      handleLoginSuccess(user);
      setShowLanding(false); // Skip landing if already logged in
    } else {
      setShowLanding(true);
    }
  }, []);

  const handleLoginSuccess = (user: User) => {
    setPatient(prev => ({
      ...prev,
      name: user.name,
      age: user.age,
      phoneNumber: user.phoneNumber,
      telegramBotToken: user.telegramBotToken || '',
      telegramChatId: user.telegramChatId || '',
      nutrition: user.nutrition || prev.nutrition
    }));
    setIsAuthenticated(true);
    setShowLanding(false);
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentPage('dashboard');
    setShowLanding(true); // Return to landing page on logout
  };

  const handleLaunchApp = () => {
    setShowLanding(false);
  };

  // --- Notifications Helper ---
  const addNotification = (type: NotificationType, title: string, message: string) => {
    const newNotif: Notification = {
      id: Date.now().toString() + Math.random(),
      type,
      title,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // --- Telegram Helper ---
  const notifyCaregiver = async (message: string) => {
     // Use ref to get latest tokens even inside closures/timers
     const currentPatient = patientRef.current;
     if (currentPatient.telegramBotToken && currentPatient.telegramChatId) {
        await sendTelegramMessage(currentPatient.telegramBotToken, currentPatient.telegramChatId, message);
     }
  };

  // --- Geolocation ---
  const getAddressFromCoords = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      return data.display_name.split(',')[0] + ", " + data.address.city;
    } catch (e) {
      return "Location Updated";
    }
  };

  useEffect(() => {
    if (isAuthenticated && 'geolocation' in navigator) {
      const watcher = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const address = await getAddressFromCoords(latitude, longitude);
          setPatient(prev => ({
            ...prev,
            location: { lat: latitude, lng: longitude, address }
          }));
        },
        (error) => console.log("Geo Error", error),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watcher);
    }
  }, [isAuthenticated]);

  // --- Voice Assistant ---
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Slightly slower for elderly
      window.speechSynthesis.speak(utterance);
    }
  };

  // --- Siren Sound Helper ---
  const playBeep = (frequency: number = 800, duration: number = 0.1) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.value = frequency;
    
    // Fade out to avoid clicking
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  };

  // --- AI Logic ---
  const fetchInsight = useCallback(async (currentData: PatientState) => {
    setLoadingAi(true);
    const insight = await generateHealthInsight(currentData);
    setAiInsight(insight);
    setLoadingAi(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchInsight(patient);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // --- Medication Compliance Logic ---
  useEffect(() => {
    if (!isAuthenticated) return;

    // Check compliance every 10 seconds for MVP responsiveness
    const complianceInterval = setInterval(async () => {
      const currentPatient = patientRef.current;
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTotalMinutes = currentHours * 60 + currentMinutes;

      // Identify Primary Caregiver
      const primaryContact = currentPatient.contacts.find(c => c.isPrimary) || currentPatient.contacts[0];
      const contactInfo = primaryContact 
          ? `${primaryContact.name} (${primaryContact.phone})` 
          : "Emergency Services";

      const getMinutesFromMidnight = (timeStr: string) => {
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
      };

      let updatesNeeded = false;
      const newLogs: EmergencyLogType[] = [];
      const medsToNotify: Medication[] = [];

      const updatedMeds = currentPatient.medications.map(med => {
         if (med.taken || med.reminderSent) return med;

         const medTotalMinutes = getMinutesFromMidnight(med.time);
         
         // Threshold: check if time has passed
         if (currentTotalMinutes > medTotalMinutes) {
            updatesNeeded = true;
            medsToNotify.push(med);
            
            const logEntry: EmergencyLogType = {
              id: Date.now().toString() + Math.random(),
              timestamp: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
              type: 'Medication Alert',
              resolved: false,
              notes: `Missed Dose: ${med.name}. Alert sent to ${contactInfo}.`
            };
            newLogs.push(logEntry);

            return { ...med, reminderSent: true };
         }
         return med;
      });

      if (updatesNeeded) {
        // 1. Perform Side Effects
        medsToNotify.forEach(med => {
            const msg = `⚠️ *Medication Reminder*\n\nPatient ${currentPatient.name} missed their dose of *${med.name}* at ${med.time}.\n\nAlerting primary contact: ${contactInfo}`;
            notifyCaregiver(msg);
            
            const spokenMsg = `Attention. You missed your ${med.name}. I have notified ${primaryContact ? primaryContact.name : 'your caregiver'}.`;
            speak(spokenMsg);
            
            addNotification('whatsapp', 'Medication Missed', `Alert sent to ${contactInfo}. Please take ${med.name}.`);
        });

        // 2. Update State
        setPatient(prev => ({
          ...prev,
          medications: updatedMeds,
          logs: [...newLogs, ...prev.logs]
        }));
      }
    }, 10000);

    return () => clearInterval(complianceInterval);
  }, [isAuthenticated]);

  // --- Simulation Logic ---
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      setPatient(prev => {
        const isCritical = prev.status === AlertLevel.CRITICAL;
        
        let newHr = isCritical 
            ? 130 + Math.random() * 40 
            : 72 + (Math.random() * 4 - 2);

        let newSys = isCritical 
            ? 160 + Math.random() * 20 
            : 118 + (Math.random() * 6 - 3);

        // Simulate Temperature fluctuations
        let newTemp = 98.6 + (Math.random() * 0.8 - 0.4); // 98.2 to 99.0

        // IoT Steps Simulation: Increment occasionally
        const stepInc = Math.random() > 0.6 ? Math.floor(Math.random() * 8) + 2 : 0;
        
        // Award points if goal met (simulation logic)
        let newPoints = prev.stepPoints;
        if (prev.steps.value + stepInc >= prev.dailyStepGoal && prev.steps.value < prev.dailyStepGoal) {
            newPoints += 50; // Bonus for crossing line
            addNotification('system', 'Daily Goal Reached!', `You've hit ${prev.dailyStepGoal} steps. +50 pts!`);
        }

        const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});

        const newHrHistory = [...prev.heartRate.history.slice(1), { time: timestamp, value: newHr }];
        const newBpHistory = [...prev.bloodPressure.history.slice(1), { time: timestamp, systolic: newSys, diastolic: prev.bloodPressure.diastolic }];
        const newTempHistory = [...prev.temperature.history.slice(1), { time: timestamp, value: newTemp }];

        return {
          ...prev,
          heartRate: { ...prev.heartRate, value: Math.floor(newHr), history: newHrHistory },
          bloodPressure: { ...prev.bloodPressure, systolic: Math.floor(newSys), history: newBpHistory },
          temperature: { ...prev.temperature, value: newTemp, history: newTempHistory },
          steps: { ...prev.steps, value: prev.steps.value + stepInc },
          stepPoints: newPoints
        };
      });
    }, 2000); 

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleUpdateStepGoal = (newGoal: number) => {
    setPatient(prev => ({
        ...prev,
        dailyStepGoal: newGoal
    }));
    addNotification('system', 'Goal Updated', `Daily step target set to ${newGoal.toLocaleString()}`);
  };

  const handleManualSOS = (type: 'cardiac' | 'fall' = 'cardiac') => {
    setIsTestMode(false);
    const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    let notes = 'Heart rate > 140 BPM detected via manual simulation.';
    let alertMsg = 'CRITICAL (Heart Rate Spike)';
    
    if (type === 'fall') {
      notes = 'Sudden impact detected. User unresponsive.';
      alertMsg = 'CRITICAL (Fall Detected)';
    }

    const newLog: EmergencyLogType = {
      id: Date.now().toString(),
      timestamp: timestamp,
      type: type === 'fall' ? 'Fall Detection' : 'Critical Vitals Spike',
      resolved: false,
      notes: notes
    };

    setPatient(prev => ({ 
      ...prev, 
      status: AlertLevel.CRITICAL,
      logs: [newLog, ...prev.logs] 
    }));
    
    setShowSOSModal(true);
    setSosCountdown(10);
    
    if (type === 'fall') {
      speak("Fall detected. Calling emergency contacts in 10 seconds.");
      addNotification('system', 'FALL DETECTED', 'Hard impact detected. Alerting contacts.');
    } else {
      speak("Warning. Heart rate anomaly detected. Emergency protocols initiated.");
      addNotification('system', 'CRITICAL ALERT', 'Abnormal heart rate detected. Emergency contacts are being notified.');
    }
    
    // Send Telegram immediately
    notifyCaregiver(`🚨 *SOS EMERGENCY ALERT* 🚨\n\nPatient: ${patientRef.current.name}\nStatus: ${alertMsg}\nLocation: ${patientRef.current.location.address}\n\nPlease respond immediately.`);
    
    setTimeout(() => fetchInsight({...patientRef.current, status: AlertLevel.CRITICAL}), 1000);
  };

  const triggerChaos = () => {
     handleManualSOS('cardiac');
  };
  
  const triggerFall = () => {
    handleManualSOS('fall');
  };

  const handleSystemTest = () => {
    setIsTestMode(true);
    const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const newLog: EmergencyLogType = {
      id: Date.now().toString(),
      timestamp: timestamp,
      type: 'System Test',
      resolved: true,
      notes: 'User initiated alarm system diagnostic check.'
    };
    
    setPatient(prev => ({
      ...prev,
      logs: [newLog, ...prev.logs]
    }));

    setShowSOSModal(true);
    setSosCountdown(5);
    speak("System test initiated. Alarm speakers functional.");
  };

  const handleNotificationTest = async () => {
     addNotification('whatsapp', 'Telegram Bot', 'Sending test message to your connected device...');
     const success = await sendTelegramMessage(patient.telegramBotToken || '', patient.telegramChatId || '', "🏥 *SmartSOS Test Message*\n\nYour notification system is working correctly.");
     
     if (success) {
         speak("Test message sent successfully.");
         addNotification('whatsapp', 'Telegram Bot', 'Success! Check your Telegram app.');
     } else {
         speak("Could not send message. Please check your bot token.");
         addNotification('system', 'Connection Failed', 'Could not send real Telegram message. Please check your Bot Token and Chat ID in settings.');
     }
  };

  const resolveEmergency = () => {
    setPatient(prev => ({ 
      ...prev, 
      status: AlertLevel.STABLE,
      logs: prev.logs.map(log => 
        !log.resolved 
          ? { ...log, resolved: true, notes: log.notes + ' [User Acknowledged]' } 
          : log
      )
    }));
    
    setShowSOSModal(false);
    speak("Alarm cancelled. Systems returning to normal.");
    if (!isTestMode) {
      notifyCaregiver(`✅ *Alert Resolved*\n\nPatient ${patientRef.current.name} has cancelled the SOS alarm and marked themselves as safe.`);
      fetchInsight({...patientRef.current, status: AlertLevel.STABLE});
    }
    setIsTestMode(false);
  };

  // --- Medication Logic ---
  const handleToggleMedication = (id: string) => {
    setPatient(prev => ({
      ...prev,
      medications: prev.medications.map(med => 
        med.id === id ? { ...med, taken: !med.taken } : med
      )
    }));
  };

  const handleAddMedication = (newMed: Omit<Medication, 'id' | 'taken'>) => {
    const medToAdd: Medication = {
      ...newMed,
      id: Date.now().toString(),
      taken: false,
      reminderSent: false
    };
    setPatient(prev => ({
      ...prev,
      medications: [...prev.medications, medToAdd]
    }));
  };

  // --- Settings Logic ---
  const handleUpdateProfile = async (updates: Partial<PatientState>) => {
    setPatient(prev => ({ ...prev, ...updates }));
    
    // Persist changes to authService (simulated backend)
    const user = authService.getCurrentUser();
    if (user) {
        const userUpdates: Partial<User> = {};
        if (updates.name) userUpdates.name = updates.name;
        if (updates.age) userUpdates.age = updates.age;
        if (updates.phoneNumber) userUpdates.phoneNumber = updates.phoneNumber;
        if (updates.telegramBotToken !== undefined) userUpdates.telegramBotToken = updates.telegramBotToken;
        if (updates.telegramChatId !== undefined) userUpdates.telegramChatId = updates.telegramChatId;
        
        if (Object.keys(userUpdates).length > 0) {
            await authService.updateUser(user.id, userUpdates);
        }
    }
  };

  const handleAddContact = (contact: Omit<EmergencyContact, 'id'>) => {
    const newContact: EmergencyContact = { ...contact, id: Date.now().toString() };
    setPatient(prev => ({ ...prev, contacts: [...prev.contacts, newContact] }));
  };

  const handleRemoveContact = (id: string) => {
    setPatient(prev => ({ ...prev, contacts: prev.contacts.filter(c => c.id !== id) }));
  };
  
  const handleUpdateNutrition = async (newNutrition: NutritionState) => {
    setPatient(prev => ({
        ...prev,
        nutrition: newNutrition
    }));

    // Persist nutrition state to authService
    const user = authService.getCurrentUser();
    if (user) {
      await authService.updateUser(user.id, { nutrition: newNutrition });
    }
  };

  // --- SOS Countdown Logic & Audio ---
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    
    if (showSOSModal && sosCountdown > 0) {
      // Audio Effect: Higher pitch as time runs out
      const pitch = 800 + (10 - sosCountdown) * 100;
      playBeep(pitch, 0.15);
      
      timer = setTimeout(() => setSosCountdown(c => c - 1), 1000);
    } else if (showSOSModal && sosCountdown === 0) {
      // Timer finished - Continuous alarm could go here
    }
    
    return () => clearTimeout(timer);
  }, [showSOSModal, sosCountdown]);

  // --- RENDER FLOW ---

  // 1. Landing Page
  if (showLanding) {
    return (
      <LandingPage 
        onLaunch={handleLaunchApp} 
        isDarkMode={isDarkMode} 
        onToggleTheme={() => setIsDarkMode(!isDarkMode)} 
      />
    );
  }

  // 2. Authentication
  if (!isAuthenticated) {
    return <Auth onLogin={handleLoginSuccess} />;
  }

  // 3. Main Dashboard App
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans transition-colors duration-200">
      
      {/* Notifications Layer */}
      <NotificationSystem notifications={notifications} onClose={removeNotification} />

      {/* SOS Modal Overlay */}
      {showSOSModal && (
        <div className="fixed inset-0 bg-red-600 bg-opacity-90 z-50 flex items-center justify-center animate-in fade-in zoom-in duration-300 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 max-w-lg w-full mx-4 text-center shadow-2xl border-4 border-red-500">
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 dark:bg-red-900/50 p-6 rounded-full animate-ping">
                <AlertTriangle size={64} className="text-red-600 dark:text-red-500" />
              </div>
            </div>
            
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2">EMERGENCY ALERT</h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 font-medium mb-8">
              {isTestMode ? "System Test Initiated" : "Calling Emergency Contacts in..."}
            </p>
            
            <div className="text-8xl font-black text-red-600 dark:text-red-500 mb-8 font-mono tracking-tighter">
              00:0{sosCountdown}
            </div>
            
            <div className="space-y-4">
              <button 
                onClick={resolveEmergency}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-xl font-bold text-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-lg"
              >
                {isTestMode ? "End System Test" : "I AM SAFE - CANCEL ALARM"}
              </button>
              {!isTestMode && (
                 <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Do not close this window. GPS location is being broadcast.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out z-30`}>
        <Sidebar 
          currentPage={currentPage} 
          onNavigate={(page) => { setCurrentPage(page); setIsSidebarOpen(false); }} 
          userName={patient.name}
          onLogout={handleLogout}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Topbar */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-16 flex items-center justify-between px-4 sm:px-6 z-10 transition-colors duration-200">
          <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-slate-500 dark:text-slate-400">
            <Menu />
          </button>

          <div className="flex items-center space-x-2 md:space-x-4 ml-auto">
             <div className="relative">
                <button
                  onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                  className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative"
                  title="Notifications"
                >
                  <Bell size={20} />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                  )}
                </button>

                {/* Notification Dropdown Panel */}
                {showNotificationPanel && (
                  <div className="absolute top-12 right-0 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 origin-top-right">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                       <h3 className="font-bold text-slate-900 dark:text-white text-sm">Notifications</h3>
                       {notifications.length > 0 && (
                         <button 
                           onClick={() => setNotifications([])} 
                           className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                         >
                           <Trash2 size={12}/> Clear All
                         </button>
                       )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                       {notifications.length === 0 ? (
                          <div className="p-8 text-center">
                             <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-full inline-block mb-2">
                                <Bell className="text-slate-400" size={20}/>
                             </div>
                             <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No new notifications</p>
                          </div>
                       ) : (
                          notifications.map((n) => (
                            <div key={n.id} className="p-4 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                               <div className="flex justify-between items-start mb-1">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${n.type === 'whatsapp' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                                    {n.type === 'whatsapp' ? 'Message' : 'System Alert'}
                                  </span>
                                  <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                               </div>
                               <h4 className="font-bold text-sm text-slate-800 dark:text-white mt-1">{n.title}</h4>
                               <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                            </div>
                          ))
                       )}
                    </div>
                  </div>
                )}
             </div>

            <button 
              onClick={() => speak(`Hello ${patient.name}. Your vitals are being monitored. Heart rate is ${patient.heartRate.value} beats per minute.`)}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
              <Mic size={18} />
              <span className="text-sm font-bold hidden sm:inline">Voice Assistant</span>
            </button>
            
            <button 
              onClick={() => handleManualSOS('cardiac')}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-lg shadow-red-200 dark:shadow-none transition-all animate-pulse font-bold active:scale-95"
            >
              <AlertTriangle size={18} />
              <span className="hidden sm:inline">SOS EMERGENCY</span>
              <span className="sm:hidden">SOS</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {currentPage === 'dashboard' && (
              <Dashboard 
                patient={patient} 
                onSpeak={speak} 
                onSimulateChaos={triggerChaos} 
                onSimulateFall={triggerFall}
                aiInsight={aiInsight}
                loadingAi={loadingAi}
                onNavigate={setCurrentPage}
              />
            )}
            {currentPage === 'trends' && <VitalsTrends patient={patient} isDarkMode={isDarkMode} />}
            {currentPage === 'medications' && (
              <Medications 
                medications={patient.medications} 
                onToggleTaken={handleToggleMedication}
                onAddMedication={handleAddMedication}
              />
            )}
            {currentPage === 'logs' && <EmergencyLog logs={patient.logs} />}
            {currentPage === 'health-tips' && <HealthTips onNotification={addNotification} />}
            {currentPage === 'nutrition' && (
                <NutritionTracker 
                    patient={patient} 
                    onUpdateNutrition={handleUpdateNutrition} 
                />
            )}
            {currentPage === 'steps' && (
                <StepsTracker 
                    patient={patient}
                    onUpdateGoal={handleUpdateStepGoal}
                />
            )}
            {currentPage === 'sleep' && (
                <SleepTracker patient={patient} />
            )}
            {currentPage === 'settings' && (
              <Settings 
                patient={patient}
                onUpdateProfile={handleUpdateProfile}
                onAddContact={handleAddContact}
                onRemoveContact={handleRemoveContact}
                onTestAlarm={handleSystemTest}
                onTestWhatsApp={handleNotificationTest}
              />
            )}
          </div>
        </main>
        
        {/* Floating Chat Bot */}
        {currentPage !== 'settings' && (
           <ChatAssistant patient={patient} />
        )}
      </div>
    </div>
  );
}

export default App;
