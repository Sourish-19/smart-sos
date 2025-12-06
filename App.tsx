
import React, { useState, useEffect, useCallback } from 'react';
import { Menu, Mic, AlertTriangle, Phone, Moon, Sun } from 'lucide-react';
import { generateHealthInsight } from './services/geminiService';
import { authService, User } from './services/authService';
import { sendTelegramMessage } from './services/telegramService';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import VitalsTrends from './components/VitalsTrends';
import Medications from './components/Medications';
import EmergencyLog from './components/EmergencyLog';
import Settings from './components/Settings';
import Auth from './components/Auth';
import LandingPage from './components/LandingPage';
import ChatAssistant from './components/ChatAssistant';
import NotificationSystem, { Notification, NotificationType } from './components/NotificationSystem';
import { PageView, PatientState, AlertLevel, AIInsight, Medication, EmergencyLog as EmergencyLogType, EmergencyContact } from './types';

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
  temperature: { value: 98.6, unit: '°F', label: 'Temperature', trend: 'stable', lastUpdated: 'Now', history: [] },
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
  const patientRef = React.useRef(patient);

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
      telegramChatId: user.telegramChatId || ''
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

    // Check compliance every 30 seconds for MVP demo purposes
    const complianceInterval = setInterval(async () => {
      setPatient(prev => {
        // Use ref to access latest props if needed, but here we are inside setPatient updater
        // so 'prev' is accurate for state, but we need 'patientRef' for side effects that rely on latest generic data if any.
        // Actually, 'prev' has the tokens too if they were saved to state. 
        // But to be safe for side effects:
        
        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        
        const getMinutesFromMidnight = (timeStr: string) => {
          const [h, m] = timeStr.split(':').map(Number);
          return h * 60 + m;
        };

        const currentTotalMinutes = currentHours * 60 + currentMinutes;
        
        let complianceUpdateNeeded = false;
        const newLogs: EmergencyLogType[] = [];

        const updatedMeds = prev.medications.map(med => {
           if (med.taken || med.reminderSent) return med;

           const medTotalMinutes = getMinutesFromMidnight(med.time);
           
           if (currentTotalMinutes > medTotalMinutes) {
              complianceUpdateNeeded = true;
              
              const logEntry: EmergencyLogType = {
                id: Date.now().toString() + Math.random(),
                timestamp: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                type: 'Medication Alert',
                resolved: false,
                notes: `Alert: Medication Missed (${med.name}). Notification sent to caregiver.`
              };
              newLogs.push(logEntry);

              // Side Effects - triggered here but using data from 'prev' which is current
              const msg = `⚠️ *Medication Reminder*\n\nPatient ${prev.name} missed their dose of *${med.name}* at ${med.time}. Please check on them.`;
              
              // We call the external helper, passing tokens directly from 'prev' to be safe
              if (prev.telegramBotToken && prev.telegramChatId) {
                  sendTelegramMessage(prev.telegramBotToken, prev.telegramChatId, msg);
              }
              
              speak(`Reminder: You missed your ${med.name}. A notification has been sent to your caregiver.`);
              addNotification('whatsapp', 'Medication Reminder', `You missed your ${med.name} dose at ${med.time}. Please take it now.`);

              return { ...med, reminderSent: true };
           }
           return med;
        });

        if (complianceUpdateNeeded) {
          return {
            ...prev,
            medications: updatedMeds,
            logs: [...newLogs, ...prev.logs]
          };
        }
        
        return prev;
      });
    }, 30000);

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

        const newHrHistory = [...prev.heartRate.history.slice(1), { time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}), value: newHr }];
        const newBpHistory = [...prev.bloodPressure.history.slice(1), { time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}), systolic: newSys, diastolic: prev.bloodPressure.diastolic }];

        return {
          ...prev,
          heartRate: { ...prev.heartRate, value: Math.floor(newHr), history: newHrHistory },
          bloodPressure: { ...prev.bloodPressure, systolic: Math.floor(newSys), history: newBpHistory },
          temperature: { ...prev.temperature, value: newTemp }
        };
      });
    }, 2000); 

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleManualSOS = () => {
    setIsTestMode(false);
    const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const newLog: EmergencyLogType = {
      id: Date.now().toString(),
      timestamp: timestamp,
      type: 'Critical Vitals Spike',
      resolved: false,
      notes: 'Heart rate > 140 BPM detected via manual simulation.'
    };

    setPatient(prev => ({ 
      ...prev, 
      status: AlertLevel.CRITICAL,
      logs: [newLog, ...prev.logs] 
    }));
    
    setShowSOSModal(true);
    setSosCountdown(10);
    speak("Warning. Heart rate anomaly detected. Emergency protocols initiated.");
    addNotification('system', 'CRITICAL ALERT', 'Abnormal heart rate detected. Emergency contacts are being notified.');
    
    // Send Telegram immediately
    notifyCaregiver(`🚨 *SOS EMERGENCY ALERT* 🚨\n\nPatient: ${patientRef.current.name}\nStatus: CRITICAL (Heart Rate Spike)\nLocation: ${patientRef.current.location.address}\n\nPlease respond immediately.`);
    
    setTimeout(() => fetchInsight({...patientRef.current, status: AlertLevel.CRITICAL}), 1000);
  };

  const triggerChaos = () => {
     handleManualSOS();
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

  // --- SOS Countdown Logic ---
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (showSOSModal && sosCountdown > 0) {
      timer = setTimeout(() => setSosCountdown(c => c - 1), 1000);
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
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
            <button 
                onClick={() => speak("I am listening. How can I help you?")}
                className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
                <Mic size={18} />
                <span className="font-medium text-sm">Voice Assistant</span>
            </button>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block"></div>
            <button 
                onClick={handleManualSOS} 
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold shadow-md flex items-center gap-2 transition-transform hover:scale-105"
            >
                <AlertTriangle size={18} />
                <span>SOS</span>
            </button>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {currentPage === 'dashboard' && (
              <Dashboard 
                patient={patient} 
                onSpeak={speak} 
                onSimulateChaos={triggerChaos}
                aiInsight={aiInsight}
                loadingAi={loadingAi}
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
      </div>

      {/* Floating Chat Assistant */}
      <ChatAssistant patient={patient} />

      {/* SOS Modal Overlay */}
      {showSOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-900 bg-opacity-90 backdrop-blur-sm animate-in fade-in duration-200">
           <div className={`bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl text-center border-4 relative ${isTestMode ? 'border-blue-500' : 'border-red-500'}`}>
               <div className={`absolute -top-6 left-1/2 transform -translate-x-1/2 text-white p-4 rounded-full shadow-lg animate-bounce ${isTestMode ? 'bg-blue-600' : 'bg-red-600'}`}>
                   {isTestMode ? <Phone size={32} /> : <AlertTriangle size={32} />}
               </div>
               
               <h2 className={`text-3xl font-black mt-8 mb-2 ${isTestMode ? 'text-blue-600' : 'text-slate-900 dark:text-white'}`}>
                 {isTestMode ? 'SYSTEM TEST' : 'EMERGENCY SOS'}
               </h2>
               <p className="text-slate-500 dark:text-slate-400 mb-8">
                 {isTestMode ? 'Testing alarm speakers and notification systems...' : 'Contacting Emergency Services & Family...'}
               </p>
               
               <div className={`text-6xl font-black mb-8 font-mono ${isTestMode ? 'text-blue-600' : 'text-red-600'}`}>
                   00:0{sosCountdown}
               </div>
               
               <div className="space-y-3">
                   {!isTestMode && (
                     <button className="w-full bg-slate-900 dark:bg-slate-700 text-white py-4 rounded-xl font-bold text-lg">
                         Contacting {patient.contacts.find(c => c.isPrimary)?.name || 'Doctor'}...
                     </button>
                   )}
                   <button 
                       onClick={resolveEmergency}
                       className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                   >
                       Cancel / I'm Safe
                   </button>
               </div>
           </div>
        </div>
      )}
    </div>
  );
}

export default App;
