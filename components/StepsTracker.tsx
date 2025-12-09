
import React, { useState } from 'react';
import { Footprints, Trophy, Calendar, Target, TrendingUp, Zap, Edit2, CheckCircle, ChevronRight } from 'lucide-react';
import { PatientState } from '../types';
import { createPortal } from 'react-dom';

interface StepsTrackerProps {
  patient: PatientState;
  onUpdateGoal: (newGoal: number) => void;
}

const StepsTracker: React.FC<StepsTrackerProps> = ({ patient, onUpdateGoal }) => {
  const [isSettingGoal, setIsSettingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(patient.dailyStepGoal);
  
  const percentage = Math.min((patient.steps.value / patient.dailyStepGoal) * 100, 100);
  const radius = 100; // Increased radius slightly for better proportion in 256x256 box
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const modalRoot = document.getElementById('modal-root') || document.body;

  const handleSaveGoal = () => {
    onUpdateGoal(tempGoal);
    setIsSettingGoal(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header with Score */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">Activity & Steps</h2>
          <p className="text-slate-500 dark:text-slate-400">Track your movement and earn rewards for consistency.</p>
        </div>
        <div className="bg-gradient-to-r from-amber-200 to-yellow-400 dark:from-amber-600 dark:to-yellow-600 px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3 transform hover:scale-105 transition-transform cursor-default">
           <div className="bg-white/30 p-2 rounded-full">
             <Trophy size={24} className="text-slate-900 dark:text-white" />
           </div>
           <div>
             <p className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-yellow-100 opacity-80">Total Score</p>
             <p className="text-2xl font-black text-slate-900 dark:text-white">{patient.stepPoints.toLocaleString()} <span className="text-sm font-bold opacity-70">pts</span></p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* MAIN CIRCULAR PROGRESS CARD */}
        <div className="bg-slate-900 dark:bg-slate-800 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[450px]">
           {/* Decorative Background */}
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-indigo-900/50 to-slate-900/50 z-0"></div>
           <div className="absolute -top-20 -right-20 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl"></div>
           <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>

           <div className="relative z-10 flex flex-col items-center">
              
              {/* Chart Container - Explicit Dimensions for Perfect Centering */}
              <div className="relative w-64 h-64 mb-8">
                 {/* SVG Circle Progress */}
                 <svg className="w-full h-full transform -rotate-90" viewBox="0 0 256 256">
                    <defs>
                      <linearGradient id="stepGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#d946ef" />
                      </linearGradient>
                    </defs>
                    {/* Track */}
                    <circle
                      cx="128"
                      cy="128"
                      r={radius}
                      stroke="currentColor"
                      strokeWidth="16"
                      fill="transparent"
                      className="text-slate-800"
                    />
                    {/* Progress */}
                    <circle
                      cx="128"
                      cy="128"
                      r={radius}
                      stroke="url(#stepGradient)"
                      strokeWidth="16"
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(139,92,246,0.5)]"
                    />
                 </svg>
                 
                 {/* Center Content - Absolute Positioning within the relative 64x64 container */}
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <Footprints size={28} className="text-violet-400 mb-1 animate-bounce" />
                    <span className="text-5xl font-black tracking-tighter leading-none">{patient.steps.value.toLocaleString()}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Steps Today</span>
                 </div>
              </div>

              <div className="flex items-center gap-2 mb-8 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700 backdrop-blur-sm">
                 <Target size={16} className="text-emerald-400" />
                 <span className="text-sm font-medium text-slate-300">Goal: <span className="text-white font-bold">{patient.dailyStepGoal.toLocaleString()}</span></span>
                 <button 
                   onClick={() => setIsSettingGoal(true)}
                   className="ml-2 p-1 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white"
                 >
                   <Edit2 size={12} />
                 </button>
              </div>

              {patient.steps.value >= patient.dailyStepGoal ? (
                 <div className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 animate-in zoom-in shadow-lg shadow-emerald-500/20">
                    <Zap fill="currentColor" /> GOAL CRUSHED!
                 </div>
              ) : (
                 <div className="text-center space-y-2">
                    <p className="text-slate-400 text-sm">
                       <span className="font-bold text-white">{(patient.dailyStepGoal - patient.steps.value).toLocaleString()}</span> steps to go!
                    </p>
                    <div className="h-1.5 w-32 bg-slate-800 rounded-full mx-auto overflow-hidden">
                       <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 animate-pulse" style={{width: `${percentage}%`}}></div>
                    </div>
                 </div>
              )}
           </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
           
           {/* Streak Calendar */}
           <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-6">
                 <div className="bg-orange-100 dark:bg-orange-900/30 p-2.5 rounded-xl text-orange-600 dark:text-orange-400">
                    <Calendar size={24} />
                 </div>
                 <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">Streak Calendar</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Last 7 Days Activity</p>
                 </div>
              </div>

              <div className="flex justify-between items-center">
                 {patient.stepHistory.slice(-7).map((record, index) => (
                    <div key={index} className="flex flex-col items-center gap-3">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                          record.met 
                             ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200 dark:shadow-none scale-110' 
                             : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-400'
                       }`}>
                          {record.met ? <CheckCircle size={20} /> : <span className="text-[10px] font-bold">{record.count > 0 ? 'Run' : '-'}</span>}
                       </div>
                       <span className="text-xs font-bold text-slate-400 uppercase">{record.date.slice(0, 3)}</span>
                    </div>
                 ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                 <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Current Streak</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                       {patient.stepHistory.filter(h => h.met).length} <span className="text-base font-medium text-slate-500">Days</span>
                       <span className="text-orange-500"><TrendingUp size={20} /></span>
                    </p>
                 </div>
                 <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Weekly Avg</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">
                       {Math.round(patient.stepHistory.reduce((acc, curr) => acc + curr.count, 0) / patient.stepHistory.length).toLocaleString()}
                    </p>
                 </div>
              </div>
           </div>

           {/* IoT Source Info */}
           <div className="bg-blue-50 dark:bg-blue-900/20 rounded-3xl p-6 border border-blue-100 dark:border-blue-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-white dark:bg-blue-900 rounded-full flex items-center justify-center shadow-sm">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
                 </div>
                 <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Live Sync Active</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Source: Simulated IoT Wearable</p>
                 </div>
              </div>
              <ChevronRight className="text-slate-400" />
           </div>

        </div>
      </div>

      {/* Goal Setting Modal */}
      {isSettingGoal && modalRoot && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsSettingGoal(false)} />
           <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-8 shadow-2xl relative z-10 animate-in zoom-in-95">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 text-center">Set Daily Goal</h3>
              
              <div className="flex items-center justify-center gap-4 mb-8">
                 <button 
                   onClick={() => setTempGoal(prev => Math.max(1000, prev - 500))}
                   className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                 >
                    -500
                 </button>
                 <div className="text-center w-24">
                    <span className="text-3xl font-black text-blue-600 dark:text-blue-400">{tempGoal.toLocaleString()}</span>
                    <span className="block text-xs text-slate-400 font-bold uppercase">Steps</span>
                 </div>
                 <button 
                   onClick={() => setTempGoal(prev => prev + 500)}
                   className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                 >
                    +500
                 </button>
              </div>

              <button 
                onClick={handleSaveGoal}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-blue-200 dark:shadow-none"
              >
                Update Goal
              </button>
           </div>
        </div>,
        modalRoot
      )}
    </div>
  );
};

export default StepsTracker;
