
import React from 'react';
import { Heart, Activity, Thermometer, Wind, MapPin, PlayCircle, CheckCircle, AlertCircle, Sparkles, Footprints, Moon, Utensils, ArrowRight } from 'lucide-react';
import { PatientState, AlertLevel, AIInsight, PageView } from '../types';

interface DashboardProps {
  patient: PatientState;
  onSpeak: (text: string) => void;
  onSimulateChaos: () => void;
  onSimulateFall: () => void;
  aiInsight: AIInsight | null;
  loadingAi: boolean;
  onNavigate: (page: PageView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ patient, onSpeak, onSimulateChaos, onSimulateFall, aiInsight, loadingAi, onNavigate }) => {
  const isCritical = patient.status === AlertLevel.CRITICAL;
  const isWarning = patient.status === AlertLevel.WARNING;

  const StatusCard = ({ label, value, unit, icon: Icon, color, trend, subtext }: any) => (
    <div className={`bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:shadow-md transition-all h-full flex flex-col justify-between`}>
      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
        <Icon size={64} />
      </div>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600 dark:text-${color.split('-')[1]}-400`}>
          <Icon size={24} className={color.replace('bg-', 'text-')} />
        </div>
        {trend && (
          <span className={`text-sm font-medium ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
            {trend === 'up' ? '↑' : '↓'} Trend
          </span>
        )}
      </div>
      
      <div>
        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{label}</h3>
        <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-slate-800 dark:text-white">{value}</span>
            <span className="text-sm text-slate-400 dark:text-slate-500 font-medium">{unit}</span>
        </div>
        {subtext && <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{subtext}</p>}
      </div>
      
      {/* Progress Bar Visual */}
      <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-4 overflow-hidden">
        <div className={`h-full rounded-full ${color.replace('text', 'bg').replace('bg-opacity-10', '')}`} style={{ width: '60%' }}></div>
      </div>
    </div>
  );

  const WellnessCard = ({ label, value, subtext, icon: Icon, colorClass, bgClass, onClick }: any) => (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
    >
       <div className={`absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity ${colorClass}`}>
          <Icon size={80} />
       </div>
       <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${bgClass} ${colorClass}`}>
             <Icon size={24} />
          </div>
          <div className="flex-1">
             <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</h4>
             <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
             <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{subtext}</p>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 dark:text-slate-600">
             <ArrowRight size={20} />
          </div>
       </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. Status Header */}
      <div className={`rounded-3xl p-6 text-white shadow-xl transition-all duration-1000 ease-in-out transform border-2 ${
        isCritical 
          ? 'bg-red-600 border-red-500 animate-pulse shadow-[0_0_40px_rgba(220,38,38,0.6)] scale-[1.02] ring-4 ring-red-400/30' 
          : isWarning 
            ? 'bg-amber-500 border-amber-400 shadow-amber-500/40' 
            : 'bg-emerald-500 border-emerald-400 shadow-emerald-500/40 hover:scale-[1.005]'
      }`}>
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center overflow-hidden border-2 border-white border-opacity-30">
                 <img src="https://picsum.photos/200" alt="Patient" className="w-full h-full object-cover" />
              </div>
              <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white transition-colors duration-500 ${isCritical ? 'bg-red-300 animate-ping' : 'bg-green-300'}`}></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{patient.name}</h1>
              <p className="opacity-90 text-sm">Patient ID: {patient.id} • Age: {patient.age}</p>
            </div>
          </div>
          <div className={`flex items-center bg-white bg-opacity-20 rounded-xl px-6 py-3 backdrop-blur-sm transition-all duration-500 ${isCritical ? 'animate-bounce' : 'hover:bg-opacity-30'}`}>
            {isCritical ? <AlertCircle size={24} className="mr-3" /> : <CheckCircle size={24} className="mr-3" />}
            <div className="text-left">
              <p className="text-xs uppercase tracking-wider font-bold opacity-75">Current Status</p>
              <p className="text-xl font-bold">{patient.status}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Live Vitals Grid */}
      <div>
         <h2 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 ml-1">Live Vitals</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <StatusCard 
              label="Heart Rate" 
              value={patient.heartRate.value} 
              unit="BPM" 
              icon={Heart} 
              color="bg-rose-500"
              subtext="Updated now"
            />
            <StatusCard 
              label="Blood Pressure" 
              value={`${patient.bloodPressure.systolic}/${patient.bloodPressure.diastolic}`} 
              unit="mmHg" 
              icon={Activity} 
              color="bg-blue-500"
              subtext="Normal range"
            />
            <StatusCard 
              label="SpO2 Level" 
              value={patient.oxygenLevel.value} 
              unit="%" 
              icon={Wind} 
              color="bg-cyan-500"
              subtext="Oxygen Saturation"
            />
            <StatusCard 
              label="Body Temp" 
              value={patient.temperature.value.toFixed(1)} 
              unit="°F" 
              icon={Thermometer} 
              color="bg-amber-500"
              subtext="Normal: 97-99°F"
            />
         </div>
      </div>

      {/* 3. Wellness & Lifestyle Row */}
      <div>
         <h2 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 ml-1">Wellness & Lifestyle</h2>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            <WellnessCard 
               label="Daily Activity"
               value={`${patient.steps.value.toLocaleString()} Steps`}
               subtext={`${Math.round((patient.steps.value / patient.dailyStepGoal) * 100)}% of Daily Goal`}
               icon={Footprints}
               bgClass="bg-violet-100 dark:bg-violet-900/30"
               colorClass="text-violet-600 dark:text-violet-400"
               onClick={() => onNavigate('steps')}
            />
            <WellnessCard 
               label="Sleep Analysis"
               value={patient.sleep.duration}
               subtext={`Quality Score: ${patient.sleep.score}/100`}
               icon={Moon}
               bgClass="bg-indigo-100 dark:bg-indigo-900/30"
               colorClass="text-indigo-600 dark:text-indigo-400"
               onClick={() => onNavigate('sleep')}
            />
            <WellnessCard 
               label="Nutrition Intake"
               value={`${patient.nutrition.caloriesConsumed} kcal`}
               subtext={`${patient.nutrition.dailyCalorieTarget - patient.nutrition.caloriesConsumed} kcal remaining`}
               icon={Utensils}
               bgClass="bg-emerald-100 dark:bg-emerald-900/30"
               colorClass="text-emerald-600 dark:text-emerald-400"
               onClick={() => onNavigate('nutrition')}
            />
         </div>
      </div>

      {/* 4. Context & Location */}
      <div>
         <h2 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 ml-1">Context & Analysis</h2>
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* AI Insights Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden flex flex-col min-h-[240px]">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Sparkles size={140} />
              </div>
              <div className="flex items-center space-x-2 mb-6 shrink-0 relative z-10">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                   <Sparkles size={20} className="text-yellow-300" />
                </div>
                <h3 className="font-bold text-lg">AI Health Insights</h3>
              </div>
              
              <div className="bg-white bg-opacity-10 rounded-2xl p-6 backdrop-blur-md border border-white border-opacity-10 flex-1 flex flex-col justify-center relative z-10">
                {loadingAi ? (
                  <div className="flex items-center space-x-2 animate-pulse self-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    <span className="text-sm font-medium">Analyzing vitals pattern...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-base leading-relaxed font-medium mb-4">
                      {aiInsight ? aiInsight.content : "System initializing..."}
                    </p>
                    <div className="flex justify-between items-end mt-auto">
                      <span className="text-xs opacity-70 bg-black/20 px-3 py-1 rounded-full">Generated: {aiInsight?.timestamp}</span>
                      <button 
                        onClick={() => onSpeak(aiInsight?.content || "")}
                        className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 rounded-xl hover:bg-opacity-30 transition-all font-bold text-sm"
                      >
                        <PlayCircle size={16} /> Read Aloud
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Live Location Card */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-1 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col min-h-[240px]">
                 <div className="p-5 flex justify-between items-center shrink-0">
                    <div>
                       <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2"><MapPin size={18} className="text-emerald-500"/> Live Location</h3>
                       <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate max-w-[200px]">{patient.location.address}</p>
                    </div>
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${patient.location.lat},${patient.location.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-3 py-2 rounded-xl text-sm font-bold transition-colors"
                    >
                      Open Maps
                    </a>
                 </div>
                 <div className="relative w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700 flex-1">
                    <iframe
                      title="Patient Location"
                      className="absolute inset-0 w-full h-full grayscale-[50%] hover:grayscale-0 transition-all duration-500"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      src={`https://maps.google.com/maps?q=${patient.location.lat},${patient.location.lng}&z=15&output=embed`}
                    ></iframe>
                 </div>
            </div>

         </div>
      </div>
      
      {/* Simulation Control (Hidden feature for MVP Demo) */}
      <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6 opacity-60 hover:opacity-100 transition-opacity">
        <div className="flex items-center justify-between">
            <div>
                 <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Dev Controls</h4>
            </div>
            <div className="flex space-x-3">
              <button 
                  onClick={onSimulateFall}
                  className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                  Simulate Fall
              </button>
              <button 
                  onClick={onSimulateChaos}
                  className="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-4 py-2 rounded-lg text-xs font-bold hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-colors"
              >
                  Simulate Critical Event
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
