
import React from 'react';
import { AlertTriangle, CheckCircle, Clock, FileText } from 'lucide-react';
import { EmergencyLog } from '../types';

interface EmergencyLogProps {
  logs: EmergencyLog[];
}

const EmergencyLog: React.FC<EmergencyLogProps> = ({ logs }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
       <div className="flex items-center justify-between">
           <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Emergency Incident Log</h2>
              <p className="text-slate-500 dark:text-slate-400">Historical record of SOS triggers and critical health anomalies.</p>
           </div>
           <div className="hidden sm:flex space-x-2">
             <span className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300">
               Total Incidents: {logs.length}
             </span>
           </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider w-1/4">Event Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${log.type.includes('Test') ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300'}`}>
                            <AlertTriangle size={18} />
                          </div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{log.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-slate-600 dark:text-slate-400 font-mono text-sm">
                          <Clock size={14} className="mr-2 text-slate-400" />
                          {log.timestamp}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {log.resolved ? (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle size={12} />
                            <span>Resolved</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800 animate-pulse">
                            <AlertTriangle size={12} />
                            <span>Active Alert</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                          <FileText size={14} className="mt-0.5 mr-2 text-slate-400 flex-shrink-0" />
                          <span className="line-clamp-2 group-hover:line-clamp-none transition-all">{log.notes}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <CheckCircle size={48} className="mb-3 text-emerald-100 dark:text-emerald-900" />
                        <p className="font-medium text-slate-500 dark:text-slate-400">No incidents recorded</p>
                        <p className="text-sm">System is stable. No emergency events found in history.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
    </div>
  );
};

export default EmergencyLog;
