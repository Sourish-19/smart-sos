import React, { useState, useRef } from 'react';
import { CheckCircle, Circle, Plus, Clock, Pill, Droplets, Syringe, Camera, Loader2 } from 'lucide-react';
import { Medication } from '../types';
import { analyzeMedicationImage } from '../services/geminiService';

interface MedicationsProps {
  medications: Medication[];
  onToggleTaken: (id: string) => void;
  onAddMedication: (med: Omit<Medication, 'id' | 'taken'>) => void;
}

const Medications: React.FC<MedicationsProps> = ({ medications, onToggleTaken, onAddMedication }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newMed, setNewMed] = useState({ 
    name: '', 
    dosage: '', 
    time: '', 
    type: 'pill' as const 
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMed.name || !newMed.time) return;
    
    onAddMedication(newMed);
    setIsAdding(false);
    setNewMed({ name: '', dosage: '', time: '', type: 'pill' });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    
    // Convert to Base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(',')[1]; // Remove data url prefix
      
      const result = await analyzeMedicationImage(base64String);
      
      if (result) {
        setNewMed({
          name: result.name,
          dosage: result.dosage,
          time: result.time,
          type: (result.type as any) === 'liquid' || (result.type as any) === 'injection' ? (result.type as any) : 'pill'
        });
        setIsAdding(true); // Open the form with pre-filled data
      } else {
        alert("Could not analyze image. Please enter details manually.");
      }
      setIsAnalyzing(false);
    };
    reader.readAsDataURL(file);
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'liquid': return <Droplets size={24} />;
      case 'injection': return <Syringe size={24} />;
      default: return <Pill size={24} />;
    }
  };

  const sortedMeds = [...medications].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Medication Schedule</h2>
           <p className="text-slate-500 dark:text-slate-400">Daily prescriptions and adherence tracking.</p>
        </div>
        
        <div className="flex gap-2">
           <input 
             type="file" 
             accept="image/*" 
             ref={fileInputRef} 
             onChange={handleFileChange} 
             className="hidden" 
           />
           <button 
             onClick={() => fileInputRef.current?.click()}
             disabled={isAnalyzing}
             className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-wait"
           >
             {isAnalyzing ? <Loader2 size={18} className="animate-spin"/> : <Camera size={18} />}
             <span>{isAnalyzing ? 'Scanning...' : 'Scan Label'}</span>
           </button>
           
           <button 
             onClick={() => setIsAdding(!isAdding)}
             className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors shadow-sm"
           >
             <Plus size={18} />
             <span>{isAdding ? 'Cancel' : 'Add Medication'}</span>
           </button>
        </div>
      </div>

      {/* Add Medication Form */}
      {isAdding && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 animate-in slide-in-from-top-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 dark:text-white">Add New Prescription</h3>
            {newMed.name && isAnalyzing === false && (
               <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full flex items-center gap-1">
                 <Camera size={12}/> Auto-filled from scan
               </span>
            )}
          </div>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Medication Name</label>
              <input 
                required 
                placeholder="e.g. Aspirin" 
                className="w-full p-2.5 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white transition-all"
                value={newMed.name}
                onChange={e => setNewMed({...newMed, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Dosage</label>
              <input 
                required 
                placeholder="e.g. 100mg" 
                className="w-full p-2.5 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white transition-all"
                value={newMed.dosage}
                onChange={e => setNewMed({...newMed, dosage: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Time</label>
              <input 
                required 
                type="time"
                className="w-full p-2.5 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white transition-all"
                value={newMed.time}
                onChange={e => setNewMed({...newMed, time: e.target.value})}
              />
            </div>
            
            {/* Type Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Type</label>
              <select
                className="w-full p-2.5 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white transition-all"
                value={newMed.type}
                onChange={e => setNewMed({...newMed, type: e.target.value as any})}
              >
                <option value="pill">Pill</option>
                <option value="liquid">Liquid</option>
                <option value="injection">Injection</option>
              </select>
            </div>

            <div className="flex items-end lg:col-span-5 justify-end">
              <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
                Save Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Medication List */}
      <div className="grid gap-4">
        {sortedMeds.map((med) => (
          <div 
            key={med.id} 
            className={`group p-5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between transition-all duration-300 ${
              med.taken 
                ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 opacity-60' 
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800'
            }`}
          >
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <div className={`p-3 rounded-full transition-colors ${med.taken ? 'bg-slate-200 dark:bg-slate-700 text-slate-400' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                {getIcon(med.type)}
              </div>
              <div>
                <h3 className={`font-bold text-lg transition-all ${med.taken ? 'text-slate-500 dark:text-slate-500 line-through decoration-slate-400' : 'text-slate-800 dark:text-white'}`}>
                  {med.name}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{med.dosage} • <span className="capitalize">{med.type}</span></p>
              </div>
            </div>
            
            <div className="flex items-center justify-between w-full sm:w-auto sm:space-x-8">
              <div className="text-right mr-4 sm:mr-0">
                <div className="flex items-center text-slate-500 dark:text-slate-400 space-x-1.5 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md mb-1">
                  <Clock size={14} />
                  <span className="font-mono text-sm font-semibold">{med.time}</span>
                </div>
                <p className={`text-xs font-bold text-right uppercase tracking-wider ${med.taken ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
                  {med.taken ? 'Completed' : 'Due Now'}
                </p>
              </div>
              
              <button 
                onClick={() => onToggleTaken(med.id)}
                className={`relative flex items-center justify-center p-2 rounded-full transition-all duration-300 transform active:scale-95 ${
                  med.taken 
                    ? 'text-emerald-500 hover:text-emerald-600' 
                    : 'text-slate-300 dark:text-slate-600 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                }`}
                title={med.taken ? "Mark as not taken" : "Mark as taken"}
              >
                {med.taken ? <CheckCircle size={36} fill="currentColor" className="text-emerald-100 dark:text-emerald-900" /> : <Circle size={36} strokeWidth={1.5} />}
              </button>
            </div>
          </div>
        ))}
        
        {medications.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-full inline-block mb-3">
              <Pill className="text-slate-400" size={32} />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">No medications scheduled for today.</p>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Click "Add Medication" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Medications;
