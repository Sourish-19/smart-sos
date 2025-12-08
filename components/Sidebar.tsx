
import React from 'react';
import { LayoutDashboard, Activity, Pill, AlertTriangle, Settings, User, LogOut, Sun, Moon, Sparkles, Utensils } from 'lucide-react';
import { PageView } from '../types';

interface SidebarProps {
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
  userName: string;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, userName, onLogout, isDarkMode, onToggleTheme }) => {
  const NavItem = ({ page, icon: Icon, label, alertCount }: { page: PageView; icon: any; label: string; alertCount?: number }) => (
    <button
      onClick={() => onNavigate(page)}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors mb-1 ${
        currentPage === page
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none'
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
      {alertCount && alertCount > 0 && (
        <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {alertCount}
        </span>
      )}
    </button>
  );

  return (
    <div className="flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen sticky top-0 transition-colors duration-200">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-2">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Activity className="text-white" size={24} />
        </div>
        <span className="text-xl font-bold text-slate-800 dark:text-white">SmartSOS</span>
      </div>

      <div className="flex-1 px-4 py-6 overflow-y-auto hide-scrollbar">
        <div className="mb-6">
          <p className="px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Menu</p>
          <NavItem page="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem page="trends" icon={Activity} label="Vitals Trends" />
          <NavItem page="medications" icon={Pill} label="Medications" />
          <NavItem page="logs" icon={AlertTriangle} label="Emergency Log" alertCount={2} />
        </div>

        <div>
           <p className="px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Wellness</p>
           <NavItem page="nutrition" icon={Utensils} label="Diet & Nutrition" />
           <NavItem page="health-tips" icon={Sparkles} label="Health Tips" />
        </div>

        <div className="mt-6">
          <p className="px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Account</p>
          <NavItem page="settings" icon={Settings} label="Settings & Profile" />
        </div>
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={onToggleTheme}
          className="w-full flex items-center space-x-3 px-4 py-3 mb-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          <span className="font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <div className="flex items-center space-x-3 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold">
            {userName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{userName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Patient Account</p>
          </div>
          <button onClick={onLogout} title="Log Out" className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <LogOut size={16} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
