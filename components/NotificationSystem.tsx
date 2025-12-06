
import React from 'react';
import { X, Send, AlertTriangle } from 'lucide-react';

export type NotificationType = 'whatsapp' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
}

interface NotificationSystemProps {
  notifications: Notification[];
  onClose: (id: string) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ notifications, onClose }) => {
  return (
    <div className="fixed top-20 right-4 z-50 space-y-4 pointer-events-none">
      {notifications.map((notif) => (
        <div 
          key={notif.id}
          className={`pointer-events-auto w-80 rounded-2xl shadow-2xl transform transition-all duration-500 animate-in slide-in-from-right-full ${
            notif.type === 'whatsapp' 
              ? 'bg-[#E3F2FD] border-l-4 border-[#0088cc]' 
              : 'bg-white dark:bg-slate-800 border-l-4 border-red-500'
          }`}
        >
          <div className="p-4 relative">
             <button 
               onClick={() => onClose(notif.id)}
               className="absolute top-2 right-2 text-slate-500 hover:text-slate-800 transition-colors"
             >
               <X size={16} />
             </button>

             <div className="flex items-start space-x-3">
               <div className={`p-2 rounded-full flex-shrink-0 ${
                 notif.type === 'whatsapp' ? 'bg-[#0088cc] text-white' : 'bg-red-100 text-red-600'
               }`}>
                 {notif.type === 'whatsapp' ? <Send size={20} /> : <AlertTriangle size={20} />}
               </div>
               <div>
                 <h4 className={`text-sm font-bold mb-1 ${notif.type === 'whatsapp' ? 'text-slate-800' : 'text-slate-800 dark:text-white'}`}>
                   {notif.title}
                 </h4>
                 <p className={`text-sm leading-snug ${notif.type === 'whatsapp' ? 'text-slate-600' : 'text-slate-500 dark:text-slate-300'}`}>
                   {notif.message}
                 </p>
                 <span className="text-[10px] text-slate-400 mt-2 block">{notif.timestamp}</span>
               </div>
             </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationSystem;
