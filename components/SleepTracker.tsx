
import React from 'react';
import { Moon, Clock, Zap, Brain, Activity, TrendingUp, Info, Calendar } from 'lucide-react';
import { PatientState } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface SleepTrackerProps {
  patient: PatientState;
}

// Mock Hypnogram Data (Simulating sleep cycles)
const HYPNOGRAM_DATA = [
  { time: '22:00', stage: 3, label: 'Awake' }, // 3=Awake, 2=REM, 1=Light, 0=Deep
  { time: '22:30', stage: 1, label: 'Light' },
  { time: '23:00', stage: 0, label: 'Deep' },
  { time: '23:30', stage: 0, label: 'Deep' },
  { time: '00:00', stage: 1, label: 'Light' },
  { time: '00:30', stage: 2, label: 'REM' },
  { time: '01:00', stage: 1, label: 'Light' },
  { time: '01:30', stage: 0, label: 'Deep' },
  { time: '02:00', stage: 0, label: 'Deep' },
  { time: '02:30', stage: 1, label: 'Light' },
  { time: '03:00', stage: 2, label: 'REM' },
  { time: '03:30', stage: 2, label: 'REM' },
  { time: '04:00', stage: 1, label: 'Light' },
  { time: '04:30', stage: 1, label: 'Light' },
  { time: '05:00', stage: 2, label: 'REM' },
  { time: '05:30', stage: 1, label: 'Light' },
  { time: '06:00', stage: 3, label: 'Awake' },
];

const SleepTracker: React.FC<SleepTrackerProps> = ({ patient }) => {
  const { sleep } = patient;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-teal-600';
    if (score >= 60) return 'from-amber-500 to-orange-600';
    return 'from-rose-500 to-red-600';
  };

  const StageCard = ({ label, percentage, color, icon: Icon, time }: any) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
      <div className="flex justify-between items-start">
        <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</span>
        <div className={`p-1.5 rounded-lg ${color} bg-opacity-10`}>
           <Icon size={16} className={color.replace('bg-', 'text-')} />
        </div>
      </div>
      <div>
        <div className="text-2xl font-black text-slate-900 dark:text-white mb-1">{percentage}%</div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{time}</div>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-700 h-1 mt-3 rounded-full overflow-hidden">
         <div className={`h-full ${color.replace('text', 'bg').replace('bg-opacity-10', '')}`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">Sleep Cycle</h2>
          <p className="text-slate-500 dark:text-slate-400">Analysis of your sleep quality and stages.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* HERO: Sleep Score */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#1e1b4b] to-[#312e81] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between min-h-[300px]">
           {/* Stars Background */}
           <div className="absolute inset-0 opacity-30">
              <div className="absolute top-10 left-10 w-1 h-1 bg-white rounded-full animate-pulse"></div>
              <div className="absolute top-20 left-40 w-1 h-1 bg-white rounded-full animate-pulse delay-75"></div>
              <div className="absolute top-5 right-20 w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-150"></div>
              <div className="absolute bottom-10 right-10 w-1 h-1 bg-white rounded-full animate-pulse delay-300"></div>
           </div>

           <div className="relative z-10 space-y-6 flex-1 text-center md:text-left">
              <div>
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/30 border border-indigo-400/30 rounded-full text-xs font-bold uppercase tracking-wider mb-4 text-indigo-200">
                    <Moon size={14} /> Last Night's Quality
                 </div>
                 <h3 className="text-5xl font-black tracking-tight mb-2">{sleep.duration}</h3>
                 <p className="text-indigo-200 font-medium text-lg">
                    Went to bed at <span className="text-white font-bold">{sleep.bedTime}</span> • Woke up at <span className="text-white font-bold">{sleep.wakeTime}</span>
                 </p>
              </div>
              
              <div className="flex gap-4 justify-center md:justify-start">
                 <div className="bg-indigo-900/50 p-4 rounded-xl border border-indigo-500/30 backdrop-blur-sm">
                    <p className="text-xs text-indigo-300 uppercase font-bold mb-1">Deep Sleep</p>
                    <p className="text-xl font-bold">{sleep.stages.deep}%</p>
                 </div>
                 <div className="bg-indigo-900/50 p-4 rounded-xl border border-indigo-500/30 backdrop-blur-sm">
                    <p className="text-xs text-indigo-300 uppercase font-bold mb-1">REM</p>
                    <p className="text-xl font-bold">{sleep.stages.rem}%</p>
                 </div>
              </div>
           </div>

           <div className="relative z-10 mt-8 md:mt-0 flex flex-col items-center">
              <div className="relative w-48 h-48 flex items-center justify-center">
                 {/* Glowing Ring */}
                 <div className={`absolute inset-0 rounded-full bg-gradient-to-tr ${getScoreGradient(sleep.score)} opacity-20 blur-xl animate-pulse`}></div>
                 <div className="w-full h-full rounded-full border-8 border-indigo-900/50 relative flex items-center justify-center bg-indigo-950/50 backdrop-blur-xl">
                    <div className="text-center">
                       <span className="block text-6xl font-black">{sleep.score}</span>
                       <span className={`text-sm font-bold uppercase tracking-widest ${getScoreColor(sleep.score)}`}>Score</span>
                    </div>
                 </div>
                 
                 {/* Moon Graphic positioned on ring */}
                 <div className="absolute -top-2 -right-2 bg-indigo-500 p-3 rounded-full shadow-lg border-4 border-[#1e1b4b]">
                    <Moon fill="currentColor" className="text-white" size={24} />
                 </div>
              </div>
              <p className="mt-6 text-sm font-medium text-indigo-200 max-w-[200px] text-center">
                 {sleep.score > 80 ? "Excellent sleep efficiency!" : "Sleep quality could be improved."}
              </p>
           </div>
        </div>

        {/* Weekly Trend */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
           <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Calendar size={20} className="text-indigo-500" />
              Weekly History
           </h3>
           <div className="flex-1 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={sleep.history}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip 
                       cursor={{fill: 'transparent'}}
                       contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backgroundColor: '#1e293b', color: '#fff'}}
                    />
                    <Bar dataKey="hours" radius={[6, 6, 6, 6]} barSize={20}>
                       {sleep.history.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.hours >= 7 ? '#6366f1' : '#cbd5e1'} />
                       ))}
                    </Bar>
                 </BarChart>
              </ResponsiveContainer>
           </div>
           <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-sm">
              <span className="text-slate-500 dark:text-slate-400">Avg. Duration</span>
              <span className="font-bold text-slate-900 dark:text-white">7h 05m</span>
           </div>
        </div>
      </div>

      {/* Sleep Stages Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         <StageCard label="Deep Sleep" percentage={sleep.stages.deep} time="1h 15m" color="bg-indigo-500" icon={Moon} />
         <StageCard label="Light Sleep" percentage={sleep.stages.light} time="4h 10m" color="bg-blue-400" icon={Activity} />
         <StageCard label="REM" percentage={sleep.stages.rem} time="1h 35m" color="bg-violet-500" icon={Brain} />
         <StageCard label="Awake" percentage={sleep.stages.awake} time="12m" color="bg-rose-400" icon={Zap} />
      </div>

      {/* Hypnogram Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
         <div className="flex items-center justify-between mb-8">
            <div>
               <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp size={20} className="text-emerald-500" />
                  Sleep Cycles
               </h3>
               <p className="text-sm text-slate-500 dark:text-slate-400">Timeline of sleep stages throughout the night</p>
            </div>
            <div className="flex gap-4 text-xs font-bold uppercase tracking-wider">
               <div className="flex items-center gap-1.5 text-slate-500"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Deep</div>
               <div className="flex items-center gap-1.5 text-slate-500"><div className="w-2 h-2 rounded-full bg-violet-500"></div> REM</div>
               <div className="flex items-center gap-1.5 text-slate-500"><div className="w-2 h-2 rounded-full bg-blue-400"></div> Light</div>
            </div>
         </div>
         
         <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={HYPNOGRAM_DATA}>
                  <defs>
                     <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.2} />
                        <stop offset="30%" stopColor="#8b5cf6" stopOpacity={0.4} />
                        <stop offset="60%" stopColor="#60a5fa" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.5} />
                     </linearGradient>
                  </defs>
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis 
                     hide 
                     domain={[0, 3]} 
                     ticks={[0, 1, 2, 3]}
                  />
                  <Tooltip 
                     contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#fff'}}
                     formatter={(value: any, name: any, props: any) => [props.payload.label, 'Stage']}
                  />
                  <Area 
                     type="stepAfter" 
                     dataKey="stage" 
                     stroke="#6366f1" 
                     strokeWidth={3} 
                     fill="url(#splitColor)" 
                     animationDuration={1500}
                  />
               </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>
    </div>
  );
};

export default SleepTracker;
