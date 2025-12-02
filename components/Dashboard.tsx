
import React from 'react';
import { Heart, Activity, Droplets, Wind, MapPin, PlayCircle, Maximize2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { PatientState, AlertLevel, AIInsight } from '../types';

interface DashboardProps {
  patient: PatientState;
  onSpeak: (text: string) => void;
  onSimulateChaos: () => void;
  aiInsight: AIInsight | null;
  loadingAi: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ patient, onSpeak, onSimulateChaos, aiInsight, loadingAi }) => {
  const isCritical = patient.status === AlertLevel.CRITICAL;
  const isWarning = patient.status === AlertLevel.WARNING;

  const StatusCard = ({ label, value, unit, icon: Icon, color, trend, subtext }: any) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
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
      <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{label}</h3>
      <div className="flex items-baseline space-x-2">
        <span className="text-3xl font-bold text-slate-800 dark:text-white">{value}</span>
        <span className="text-sm text-slate-400 dark:text-slate-500 font-medium">{unit}</span>
      </div>
      {subtext && <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{subtext}</p>}
      
      {/* Progress Bar Visual */}
      <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-4 overflow-hidden">
        <div className={`h-full rounded-full ${color.replace('text', 'bg').replace('bg-opacity-10', '')}`} style={{ width: '60%' }}></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <div className={`rounded-2xl p-6 text-white shadow-lg transition-colors duration-500 ${isCritical ? 'bg-red-600 animate-pulse' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'}`}>
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center overflow-hidden border-2 border-white border-opacity-30">
                 <img src="https://picsum.photos/200" alt="Patient" className="w-full h-full object-cover" />
              </div>
              <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${isCritical ? 'bg-red-300' : 'bg-green-300'}`}></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{patient.name}</h1>
              <p className="opacity-90 text-sm">Patient ID: {patient.id} • Age: {patient.age}</p>
            </div>
          </div>
          <div className="flex items-center bg-white bg-opacity-20 rounded-xl px-6 py-3 backdrop-blur-sm">
            {isCritical ? <AlertCircle size={24} className="mr-3" /> : <CheckCircle size={24} className="mr-3" />}
            <div className="text-left">
              <p className="text-xs uppercase tracking-wider font-bold opacity-75">Current Status</p>
              <p className="text-xl font-bold">{patient.status}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vitals Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatusCard 
            label="Heart Rate" 
            value={patient.heartRate.value} 
            unit="BPM" 
            icon={Heart} 
            color="bg-rose-500"
            subtext="Last updated: Just now"
          />
          <StatusCard 
            label="Blood Pressure" 
            value={`${patient.bloodPressure.systolic}/${patient.bloodPressure.diastolic}`} 
            unit="mmHg" 
            icon={Activity} 
            color="bg-blue-500"
            subtext="Normal range: 120/80"
          />
          <StatusCard 
            label="Blood Glucose" 
            value={patient.glucose.value} 
            unit="mg/dL" 
            icon={Droplets} 
            color="bg-amber-500"
            subtext="Before meal"
          />
          <StatusCard 
            label="SpO2 Level" 
            value={patient.oxygenLevel.value} 
            unit="%" 
            icon={Wind} 
            color="bg-cyan-500"
            subtext="Oxygen Saturation"
          />
        </div>

        {/* Right Column: AI & Map */}
        <div className="space-y-6">
          
          {/* AI Insights Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Sparkles size={120} />
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles size={20} className="text-yellow-300" />
              <h3 className="font-bold text-lg">AI Health Insights</h3>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm border border-white border-opacity-10 min-h-[140px] flex flex-col justify-center">
              {loadingAi ? (
                <div className="flex items-center space-x-2 animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  <span className="text-sm">Analyzing vitals...</span>
                </div>
              ) : (
                <>
                  <p className="text-sm leading-relaxed font-medium mb-3">
                    {aiInsight ? aiInsight.content : "System initializing..."}
                  </p>
                  <div className="flex justify-between items-end mt-auto">
                    <span className="text-xs opacity-60">Generated: {aiInsight?.timestamp}</span>
                    <button 
                      onClick={() => onSpeak(aiInsight?.content || "")}
                      className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all"
                      title="Read aloud"
                    >
                      <PlayCircle size={18} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Google Maps Embed */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-1 shadow-sm border border-slate-100 dark:border-slate-700">
             <div className="p-4 flex justify-between items-center">
                <div>
                   <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2"><MapPin size={16} className="text-emerald-500"/> Live Location</h3>
                   <p className="text-xs text-slate-500 dark:text-slate-400 truncate w-48">{patient.location.address}</p>
                </div>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${patient.location.lat},${patient.location.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-2 rounded-lg text-sm font-medium"
                >
                  Open Maps
                </a>
             </div>
             <div className="relative h-48 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700">
                <iframe
                  title="Patient Location"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://maps.google.com/maps?q=${patient.location.lat},${patient.location.lng}&z=15&output=embed`}
                ></iframe>
             </div>
          </div>
        </div>
      </div>
      
      {/* Simulation Control (Hidden feature in 'real' app, visible for MVP) */}
      <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6">
        <div className="flex items-center justify-between">
            <div>
                 <h4 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Developer Controls</h4>
                 <p className="text-xs text-slate-400 dark:text-slate-500">Use these to simulate emergency events for the demo.</p>
            </div>
            <button 
                onClick={onSimulateChaos}
                className="bg-slate-800 dark:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors"
            >
                Simulate Critical Event
            </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
