
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { PatientState } from '../types';

interface VitalsTrendsProps {
  patient: PatientState;
  isDarkMode: boolean;
}

const VitalsTrends: React.FC<VitalsTrendsProps> = ({ patient, isDarkMode }) => {
  const gridColor = isDarkMode ? "#334155" : "#e2e8f0";
  const textColor = isDarkMode ? "#94a3b8" : "#64748b";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Health Trends</h2>
           <p className="text-slate-500 dark:text-slate-400">Analysis of vital signs over the last 24 hours.</p>
        </div>
        <div className="flex space-x-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
           <button className="px-3 py-1 bg-white dark:bg-slate-600 shadow-sm rounded-md text-sm font-medium text-slate-800 dark:text-white">24H</button>
           <button className="px-3 py-1 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white">1W</button>
           <button className="px-3 py-1 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white">1M</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Heart Rate Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center">
            <span className="w-2 h-6 bg-rose-500 rounded-full mr-2"></span>
            Heart Rate (BPM)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={patient.heartRate.history}>
                <defs>
                  <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="time" hide />
                <YAxis domain={[40, 160]} tick={{fontSize: 12, fill: textColor}} stroke={gridColor} />
                <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: isDarkMode ? '#1e293b' : '#fff', color: isDarkMode ? '#fff' : '#000'}} 
                    itemStyle={{color: '#f43f5e', fontWeight: 'bold'}}
                />
                <Area type="monotone" dataKey="value" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorHr)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Blood Pressure Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center">
            <span className="w-2 h-6 bg-blue-500 rounded-full mr-2"></span>
            Blood Pressure (mmHg)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={patient.bloodPressure.history}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="time" hide />
                <YAxis domain={[50, 180]} tick={{fontSize: 12, fill: textColor}} stroke={gridColor} />
                <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: isDarkMode ? '#1e293b' : '#fff', color: isDarkMode ? '#fff' : '#000'}}
                />
                <Line type="monotone" dataKey="systolic" stroke="#3b82f6" strokeWidth={3} dot={false} name="Systolic" />
                <Line type="monotone" dataKey="diastolic" stroke="#93c5fd" strokeWidth={3} dot={false} name="Diastolic" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

       {/* Simple Text Summary */}
       <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 flex items-start space-x-4">
          <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg text-blue-600 dark:text-blue-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
              <h4 className="font-bold text-blue-900 dark:text-blue-100">Weekly Analysis</h4>
              <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
                  Heart rate variability is within the normal range for age 72. 
                  However, a slight elevation in systolic pressure was observed during the evening hours (6 PM - 8 PM). 
                  Recommended to reduce sodium intake at dinner.
              </p>
          </div>
       </div>
    </div>
  );
};

export default VitalsTrends;
