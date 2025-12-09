
import React, { useState, useEffect, useRef } from 'react';
import { Plus, ChevronLeft, ChevronRight, Apple, Coffee, Moon, Sun, Scale, Check, PlusCircle, Scan, Search, Camera, Loader2, Calendar, History, BarChart as BarChartIcon, Droplets, Flame, Utensils, Zap, ChevronDown, ChevronUp, TrendingDown, TrendingUp, Anchor } from 'lucide-react';
import { PatientState, NutritionState, FoodItem, MealType } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { analyzeFoodImage } from '../services/geminiService';
import { createPortal } from 'react-dom';

interface NutritionTrackerProps {
  patient: PatientState;
  onUpdateNutrition: (nutrition: NutritionState) => void;
}

// Mock History Data
const MOCK_HISTORY_DATA = [
  { name: 'Jan', calories: 2100, goal: 2000 },
  { name: 'Feb', calories: 1950, goal: 2000 },
  { name: 'Mar', calories: 2200, goal: 2000 },
  { name: 'Apr', calories: 1800, goal: 2000 },
  { name: 'May', calories: 2050, goal: 2000 },
  { name: 'Jun', calories: 1980, goal: 2000 },
  { name: 'Jul', calories: 2150, goal: 2000 },
  { name: 'Aug', calories: 2300, goal: 2000 },
  { name: 'Sep', calories: 2000, goal: 2000 },
  { name: 'Oct', calories: 1900, goal: 2000 },
  { name: 'Nov', calories: 2100, goal: 2000 },
  { name: 'Dec', calories: 2400, goal: 2000 },
];

const NutritionTracker: React.FC<NutritionTrackerProps> = ({ patient, onUpdateNutrition }) => {
  const { nutrition } = patient;
  const [showOnboarding, setShowOnboarding] = useState(!nutrition.isConfigured);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [formWeight, setFormWeight] = useState(nutrition.weight > 0 ? nutrition.weight : 70);
  const [formHeight, setFormHeight] = useState(nutrition.height > 0 ? nutrition.height : 170);
  const [formGoal, setFormGoal] = useState<'lose' | 'maintain' | 'gain'>(nutrition.goal);
  
  const [activeTab, setActiveTab] = useState<'today' | 'history'>('today');

  const [addingMealType, setAddingMealType] = useState<MealType | null>(null);
  const [newItem, setNewItem] = useState({ name: '', calories: '', protein: 0, carbs: 0, fats: 0 });
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hydration local state (mock for UI)
  const [waterIntake, setWaterIntake] = useState(nutrition.waterIntake || 0);

  // If not configured, ensure modal is open
  useEffect(() => {
    if (!nutrition.isConfigured) {
        setShowOnboarding(true);
    }
  }, [nutrition.isConfigured]);

  const calculateTarget = (weight: number, height: number, goal: string) => {
    const bmr = 10 * weight + 6.25 * height - 5 * patient.age + 5; 
    let tdee = bmr * 1.2; 
    if (goal === 'lose') return Math.round(tdee - 500);
    if (goal === 'gain') return Math.round(tdee + 500);
    return Math.round(tdee);
  };
  
  const calculateBMI = (weight: number, height: number) => {
    if (height <= 0) return 0;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const handleFinishOnboarding = () => {
    const target = calculateTarget(formWeight, formHeight, formGoal);
    onUpdateNutrition({
        ...nutrition,
        isConfigured: true,
        weight: formWeight,
        height: formHeight,
        goal: formGoal,
        dailyCalorieTarget: target,
        macros: { ...nutrition.macros, protein: 0, carbs: 0, fats: 0 }
    });
    setShowOnboarding(false);
  };

  const handleAddFood = () => {
    if (!addingMealType || !newItem.name || !newItem.calories) return;

    const cals = parseInt(newItem.calories);
    const newFood: FoodItem = {
        id: Date.now().toString(),
        name: newItem.name,
        calories: cals,
        protein: newItem.protein || Math.round(cals * 0.03), 
        carbs: newItem.carbs || Math.round(cals * 0.1),
        fats: newItem.fats || Math.round(cals * 0.02)
    };

    const updatedMeals = { ...nutrition.meals };
    updatedMeals[addingMealType] = [...updatedMeals[addingMealType], newFood];

    const allMeals = (Object.values(updatedMeals).flat() as FoodItem[]);
    const totalCals = allMeals.reduce((acc, item) => acc + item.calories, 0);
    const totalP = allMeals.reduce((acc, item) => acc + item.protein, 0);
    const totalC = allMeals.reduce((acc, item) => acc + item.carbs, 0);
    const totalF = allMeals.reduce((acc, item) => acc + item.fats, 0);

    onUpdateNutrition({
        ...nutrition,
        meals: updatedMeals,
        caloriesConsumed: totalCals,
        macros: { protein: totalP, carbs: totalC, fats: totalF }
    });

    setAddingMealType(null);
    setNewItem({ name: '', calories: '', protein: 0, carbs: 0, fats: 0 });
  };

  const handleScanFood = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const result = await analyzeFoodImage(base64);
        if (result) {
            setNewItem({
                name: result.name,
                calories: result.calories.toString(),
                protein: result.protein,
                carbs: result.carbs,
                fats: result.fats
            });
        } else {
            alert("Could not analyze food image.");
        }
        setIsScanning(false);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const updateWater = (delta: number) => {
      const newVal = Math.max(0, waterIntake + delta);
      setWaterIntake(newVal);
      // Persist to nutrition state (optional)
      onUpdateNutrition({ ...nutrition, waterIntake: newVal });
  };

  const mealData = [
    { name: 'Breakfast', value: nutrition.meals.breakfast.reduce((a,b)=>a+b.calories,0), color: '#3b82f6' },
    { name: 'Lunch', value: nutrition.meals.lunch.reduce((a,b)=>a+b.calories,0), color: '#10b981' },
    { name: 'Dinner', value: nutrition.meals.dinner.reduce((a,b)=>a+b.calories,0), color: '#8b5cf6' },
    { name: 'Snacks', value: nutrition.meals.snack.reduce((a,b)=>a+b.calories,0), color: '#f59e0b' },
  ].filter(d => d.value > 0);

  const displayData = mealData.length > 0 ? mealData : [{ name: 'Remaining', value: 1, color: 'rgba(255,255,255,0.1)' }];
  const remaining = nutrition.dailyCalorieTarget - nutrition.caloriesConsumed;
  
  // Macros
  const proteinTarget = Math.round((nutrition.dailyCalorieTarget * 0.3) / 4);
  const carbsTarget = Math.round((nutrition.dailyCalorieTarget * 0.4) / 4);
  const fatsTarget = Math.round((nutrition.dailyCalorieTarget * 0.3) / 9);

  const modalRoot = document.getElementById('modal-root') || document.body;

  const MealSection = ({ type, icon: Icon, colorClass, bgClass }: { type: MealType, icon: any, colorClass: string, bgClass: string }) => {
      const items = nutrition.meals[type];
      const total = items.reduce((acc, i) => acc + i.calories, 0);
      
      return (
          <div className="relative group">
              <div className="flex items-center gap-4 mb-3">
                  <div className={`p-3 rounded-2xl ${bgClass} ${colorClass} shadow-sm group-hover:scale-110 transition-transform`}>
                      <Icon size={24} />
                  </div>
                  <div className="flex-1">
                      <h4 className="text-lg font-bold text-slate-800 dark:text-white capitalize">{type}</h4>
                      <p className="text-xs text-slate-500 font-medium">Recommended: {Math.round(nutrition.dailyCalorieTarget * (type === 'snack' ? 0.1 : 0.3))} kcal</p>
                  </div>
                  <div className="text-right">
                      <span className="text-xl font-black text-slate-800 dark:text-white">{total}</span>
                      <span className="text-xs text-slate-400 font-bold uppercase ml-1">Kcal</span>
                  </div>
                  <button 
                    onClick={() => setAddingMealType(type)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-blue-600"
                  >
                      <PlusCircle size={24} />
                  </button>
              </div>
              
              {/* Food List Timeline */}
              <div className="ml-8 border-l-2 border-slate-100 dark:border-slate-800 pl-8 space-y-3 pb-6">
                  {items.length > 0 ? items.map((item) => (
                      <div key={item.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
                          <div>
                              <p className="font-bold text-slate-800 dark:text-slate-200">{item.name}</p>
                              <div className="flex gap-3 mt-1">
                                  <span className="text-[10px] text-slate-400 font-medium bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded-full">P: {item.protein}g</span>
                                  <span className="text-[10px] text-slate-400 font-medium bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded-full">C: {item.carbs}g</span>
                                  <span className="text-[10px] text-slate-400 font-medium bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded-full">F: {item.fats}g</span>
                              </div>
                          </div>
                          <span className="font-mono font-bold text-slate-600 dark:text-slate-400">{item.calories}</span>
                      </div>
                  )) : (
                      <div className="text-sm text-slate-400 italic">No food logged yet.</div>
                  )}
              </div>
          </div>
      );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24 max-w-5xl mx-auto">
      
      {/* Header Tabs */}
      <div className="flex justify-between items-center">
          <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">Nutrition</h2>
              <p className="text-slate-500 dark:text-slate-400">Track calories, macros, and hydration.</p>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex">
              {['today', 'history'].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all ${activeTab === tab ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                  >
                      {tab}
                  </button>
              ))}
          </div>
      </div>

      {activeTab === 'today' ? (
        <>
            {/* HERO HUD */}
            <div className="relative bg-gradient-to-br from-emerald-900 to-teal-800 rounded-[2.5rem] p-8 text-white shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -ml-20 -mb-20"></div>
                
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    {/* Left: Numbers */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 opacity-80">
                            <Flame size={20} className="text-emerald-300" />
                            <span className="text-sm font-bold tracking-wider uppercase">Daily Summary</span>
                        </div>
                        
                        <div>
                            <div className="text-6xl font-black tracking-tighter mb-2">
                                {remaining} <span className="text-2xl font-medium text-emerald-200">kcal left</span>
                            </div>
                            <div className="flex gap-6 text-sm font-medium text-emerald-100">
                                <div>Goal: <span className="text-white">{nutrition.dailyCalorieTarget}</span></div>
                                <div>Eaten: <span className="text-white">{nutrition.caloriesConsumed}</span></div>
                                <div>Burned: <span className="text-white">450</span></div>
                            </div>
                        </div>

                        {/* Macros Horizontal Bar */}
                        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                            {[
                                { l: 'Protein', v: nutrition.macros.protein, t: proteinTarget, c: 'bg-blue-400' },
                                { l: 'Carbs', v: nutrition.macros.carbs, t: carbsTarget, c: 'bg-emerald-400' },
                                { l: 'Fat', v: nutrition.macros.fats, t: fatsTarget, c: 'bg-amber-400' },
                            ].map((m) => (
                                <div key={m.l}>
                                    <div className="flex justify-between text-xs mb-1 opacity-90">
                                        <span>{m.l}</span>
                                        <span>{m.v}/{m.t}g</span>
                                    </div>
                                    <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
                                        <div className={`h-full ${m.c}`} style={{ width: `${Math.min((m.v/m.t)*100, 100)}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Chart */}
                    <div className="flex items-center justify-center lg:justify-end">
                        <div className="relative w-48 h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={displayData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                        startAngle={90}
                                        endAngle={-270}
                                    >
                                        {displayData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <Utensils size={24} className="text-emerald-200 mb-1 opacity-80"/>
                                <span className="text-xl font-bold">{Math.round((nutrition.caloriesConsumed / nutrition.dailyCalorieTarget) * 100)}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left: Meal Journal */}
                <div className="lg:col-span-2 space-y-2">
                    <MealSection type="breakfast" icon={Sun} bgClass="bg-orange-100 dark:bg-orange-900/30" colorClass="text-orange-600 dark:text-orange-400" />
                    <MealSection type="lunch" icon={Sun} bgClass="bg-yellow-100 dark:bg-yellow-900/30" colorClass="text-yellow-600 dark:text-yellow-400" />
                    <MealSection type="snack" icon={Coffee} bgClass="bg-purple-100 dark:bg-purple-900/30" colorClass="text-purple-600 dark:text-purple-400" />
                    <MealSection type="dinner" icon={Moon} bgClass="bg-indigo-100 dark:bg-indigo-900/30" colorClass="text-indigo-600 dark:text-indigo-400" />
                </div>

                {/* Right: Hydration & Tools */}
                <div className="space-y-6">
                    {/* Water Tracker */}
                    <div className="bg-blue-50 dark:bg-blue-900/10 rounded-3xl p-6 border border-blue-100 dark:border-blue-900/30 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-blue-200 dark:bg-blue-900">
                            <div className="h-full bg-blue-500 transition-all" style={{ width: `${Math.min((waterIntake / 8) * 100, 100)}%` }}></div>
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center justify-center gap-2 mt-2">
                            <Droplets className="text-blue-500" fill="currentColor" /> Hydration
                        </h3>
                        <div className="flex justify-center items-end gap-1 mb-6 h-16">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div 
                                    key={i} 
                                    className={`w-6 rounded-b-lg border-2 border-blue-400 transition-all duration-300 ${i < waterIntake ? 'bg-blue-400 h-12' : 'bg-transparent h-8 opacity-30'}`}
                                ></div>
                            ))}
                        </div>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => updateWater(-1)} className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow text-slate-500 hover:text-blue-600"><ChevronDown className="mx-auto"/></button>
                            <span className="text-2xl font-black text-blue-600 dark:text-blue-400 w-16">{waterIntake}<span className="text-sm font-medium text-slate-400">/8</span></span>
                            <button onClick={() => updateWater(1)} className="w-10 h-10 rounded-full bg-blue-500 shadow text-white hover:bg-blue-600"><ChevronUp className="mx-auto"/></button>
                        </div>
                    </div>

                    {/* Quick Analysis */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 className="font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2"><Zap size={18} className="text-yellow-500" /> Quick Insight</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                            {remaining < 0 
                                ? "You've exceeded your goal slightly. Try a lighter dinner or a 15 min walk." 
                                : "You're on track! Remember to hit your protein goal for muscle maintenance."}
                        </p>
                    </div>
                </div>
            </div>
        </>
      ) : (
        /* HISTORY TAB */
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 animate-in fade-in zoom-in-95">
             <div className="flex items-center justify-between mb-6">
                 <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Annual Overview</h3>
                    <p className="text-slate-500 dark:text-slate-400">Calorie intake trends</p>
                 </div>
             </div>
             <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_HISTORY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                        <YAxis tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                        <Legend />
                        <Bar dataKey="calories" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Calories" />
                        <Bar dataKey="goal" fill="#cbd5e1" radius={[4, 4, 0, 0]} name="Target" />
                    </BarChart>
                </ResponsiveContainer>
             </div>
        </div>
      )}

      {/* MODALS (Onboarding & Add Food) */}
      {showOnboarding && modalRoot && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl p-8 relative overflow-hidden">
              <h2 className="text-2xl font-black text-center mb-6 text-slate-900 dark:text-white">Personalize Plan</h2>
              {/* Simplified Single Step for Redesign Speed */}
              <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Weight (kg)</label>
                        <input 
                          type="number" 
                          value={formWeight} 
                          onChange={e => setFormWeight(Number(e.target.value))} 
                          className="w-full p-4 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-black text-xl text-slate-900 dark:text-white border-2 border-transparent focus:border-emerald-500 transition-colors text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Height (cm)</label>
                        <input 
                          type="number" 
                          value={formHeight} 
                          onChange={e => setFormHeight(Number(e.target.value))} 
                          className="w-full p-4 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-black text-xl text-slate-900 dark:text-white border-2 border-transparent focus:border-emerald-500 transition-colors text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                        />
                    </div>
                  </div>
                  
                  <div>
                      <label className="text-xs font-bold uppercase text-slate-500 mb-3 block">Primary Goal</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <button
                            onClick={() => setFormGoal('lose')}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${formGoal === 'lose' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-emerald-200'}`}
                          >
                             <TrendingDown size={24} />
                             <span className="font-bold text-sm">Lose Weight</span>
                          </button>
                          
                          <button
                            onClick={() => setFormGoal('maintain')}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${formGoal === 'maintain' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-blue-200'}`}
                          >
                             <Anchor size={24} />
                             <span className="font-bold text-sm">Maintain</span>
                          </button>

                          <button
                            onClick={() => setFormGoal('gain')}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${formGoal === 'gain' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-purple-200'}`}
                          >
                             <TrendingUp size={24} />
                             <span className="font-bold text-sm">Gain Muscle</span>
                          </button>
                      </div>
                  </div>
                  
                  <button onClick={handleFinishOnboarding} className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl mt-4 hover:bg-emerald-700 shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.98]">
                    Save Profile
                  </button>
              </div>
           </div>
        </div>,
        modalRoot
      )}

      {addingMealType && modalRoot && createPortal(
         <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/80 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh] sm:h-auto animate-in slide-in-from-bottom-10 sm:zoom-in-95">
               <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
                  <button onClick={() => setAddingMealType(null)} className="text-slate-900 dark:text-white"><ChevronLeft /></button>
                  <h3 className="font-bold text-lg capitalize text-slate-900 dark:text-white">Add to {addingMealType}</h3>
               </div>
               <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-950 flex-1 overflow-y-auto">
                  <div className="flex gap-2">
                      <div className="flex-1 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                          <Search size={18} className="text-slate-400" />
                          <input className="bg-transparent outline-none w-full text-slate-900 dark:text-white" placeholder="Search food..." value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} autoFocus />
                      </div>
                      <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-blue-600 text-white rounded-xl shadow-lg">
                          {isScanning ? <Loader2 className="animate-spin" /> : <Camera />}
                      </button>
                      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleScanFood} className="hidden" />
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                      <label className="text-xs font-bold text-slate-500 uppercase">Calories</label>
                      <input type="number" className="w-full text-4xl font-black bg-transparent outline-none mt-1 text-slate-900 dark:text-white" placeholder="0" value={newItem.calories} onChange={e => setNewItem({...newItem, calories: e.target.value})} />
                  </div>
                  <button onClick={handleAddFood} disabled={!newItem.name || !newItem.calories} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl disabled:opacity-50">Add Entry</button>
               </div>
            </div>
         </div>,
         modalRoot
      )}
    </div>
  );
};

export default NutritionTracker;
