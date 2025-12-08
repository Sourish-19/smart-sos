
import React, { useState, useEffect, useRef } from 'react';
import { Plus, ChevronLeft, ChevronRight, Apple, Coffee, Moon, Sun, Scale, Check, PlusCircle, Scan, Search, Camera, Loader2, Calendar, History, BarChart as BarChartIcon } from 'lucide-react';
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

  // If not configured, ensure modal is open
  useEffect(() => {
    if (!nutrition.isConfigured) {
        setShowOnboarding(true);
    }
  }, [nutrition.isConfigured]);

  const calculateTarget = (weight: number, height: number, goal: string) => {
    // Mifflin-St Jeor Equation (Approx)
    const bmr = 10 * weight + 6.25 * height - 5 * patient.age + 5; 
    let tdee = bmr * 1.2; // Sedentary baseline
    
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
    const proteinTarget = Math.round((target * 0.3) / 4);
    const carbsTarget = Math.round((target * 0.4) / 4);
    const fatsTarget = Math.round((target * 0.3) / 9);

    onUpdateNutrition({
        ...nutrition,
        isConfigured: true,
        weight: formWeight,
        height: formHeight,
        goal: formGoal,
        dailyCalorieTarget: target,
        macros: { ...nutrition.macros, protein: 0, carbs: 0, fats: 0 } // Reset macros on reconfig
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
        protein: newItem.protein || Math.round(cals * 0.03), // Use detected or mock
        carbs: newItem.carbs || Math.round(cals * 0.1),
        fats: newItem.fats || Math.round(cals * 0.02)
    };

    const updatedMeals = { ...nutrition.meals };
    updatedMeals[addingMealType] = [...updatedMeals[addingMealType], newFood];

    // Recalculate totals
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

  // Pie Chart Data
  const mealData = [
    { name: 'Breakfast', value: nutrition.meals.breakfast.reduce((a,b)=>a+b.calories,0), color: '#3b82f6' }, // blue-500
    { name: 'Lunch', value: nutrition.meals.lunch.reduce((a,b)=>a+b.calories,0), color: '#10b981' }, // emerald-500
    { name: 'Dinner', value: nutrition.meals.dinner.reduce((a,b)=>a+b.calories,0), color: '#8b5cf6' }, // violet-500
    { name: 'Snacks', value: nutrition.meals.snack.reduce((a,b)=>a+b.calories,0), color: '#f59e0b' }, // amber-500
  ].filter(d => d.value > 0);

  const displayData = mealData.length > 0 ? mealData : [{ name: 'Remaining', value: 1, color: '#e2e8f0' }];
  const remaining = nutrition.dailyCalorieTarget - nutrition.caloriesConsumed;

  // Macro Targets (Calculated roughly based on goals)
  const proteinTarget = Math.round((nutrition.dailyCalorieTarget * 0.3) / 4);
  const carbsTarget = Math.round((nutrition.dailyCalorieTarget * 0.4) / 4);
  const fatsTarget = Math.round((nutrition.dailyCalorieTarget * 0.3) / 9);

  // Use body as fallback if modal-root is missing to prevent crashes
  const modalRoot = document.getElementById('modal-root') || document.body;

  return (
    <div className="w-full font-sans h-full flex flex-col space-y-6 animate-in fade-in duration-500 pb-24">
      
      {/* ONBOARDING MODAL (Fixed Viewport Coverage) */}
      {showOnboarding && modalRoot && createPortal(
        <div className="fixed top-0 left-0 w-screen h-screen z-[9999] flex items-center justify-center p-4">
           {/* Backdrop */}
           <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md w-full h-full" />
           
           <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl p-8 overflow-hidden relative z-10">
              <div className="absolute top-0 left-0 w-full h-2 bg-slate-100 dark:bg-slate-800">
                 <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${(onboardingStep / 3) * 100}%` }}></div>
              </div>

              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 mt-4 text-center">
                 {onboardingStep === 1 ? "Let's set your baseline" : onboardingStep === 2 ? "What's your goal?" : "Review Plan"}
              </h2>
              <p className="text-center text-slate-500 dark:text-slate-400 mb-8">
                 {onboardingStep === 1 ? "We need this to calculate your metabolism." : onboardingStep === 2 ? "We'll adjust your calorie target accordingly." : "Ready to start tracking?"}
              </p>

              {onboardingStep === 1 && (
                 <div className="space-y-6">
                    <div>
                       <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Weight (kg)</label>
                       <input 
                         type="number" 
                         value={formWeight} 
                         onChange={e => setFormWeight(Number(e.target.value))}
                         className="w-full text-center text-4xl font-black text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-2xl py-4 outline-none"
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Height (cm)</label>
                       <input 
                         type="number" 
                         value={formHeight} 
                         onChange={e => setFormHeight(Number(e.target.value))}
                         className="w-full text-center text-4xl font-black text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-2xl py-4 outline-none"
                       />
                    </div>
                    <button onClick={() => setOnboardingStep(2)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-lg transition-colors">Next</button>
                 </div>
              )}

              {onboardingStep === 2 && (
                 <div className="space-y-4">
                    {[
                      { id: 'lose', label: 'Lose Weight', sub: 'Deficit for fat loss' },
                      { id: 'maintain', label: 'Maintain Weight', sub: 'Keep current physique' },
                      { id: 'gain', label: 'Gain Weight', sub: 'Surplus for muscle' }
                    ].map((opt) => (
                       <button 
                         key={opt.id}
                         onClick={() => setFormGoal(opt.id as any)}
                         className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                            formGoal === opt.id 
                               ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500' 
                               : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                         }`}
                       >
                          <div className={`font-bold text-lg ${formGoal === opt.id ? 'text-blue-700 dark:text-blue-300' : 'text-slate-800 dark:text-white'}`}>{opt.label}</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">{opt.sub}</div>
                       </button>
                    ))}
                    <div className="flex gap-3 pt-4">
                       <button onClick={() => setOnboardingStep(1)} className="flex-1 py-3 font-bold text-slate-500">Back</button>
                       <button onClick={() => setOnboardingStep(3)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl">Next</button>
                    </div>
                 </div>
              )}

              {onboardingStep === 3 && (
                 <div className="text-center">
                    <div className="flex justify-center gap-4 mb-6">
                        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-center">
                            <span className="block text-2xl font-black text-slate-900 dark:text-white">{calculateBMI(formWeight, formHeight)}</span>
                            <span className="text-xs font-bold text-slate-500 uppercase">BMI</span>
                        </div>
                         <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-center">
                            <span className="block text-2xl font-black text-slate-900 dark:text-white">{calculateTarget(formWeight, formHeight, formGoal)}</span>
                            <span className="text-xs font-bold text-slate-500 uppercase">Target Kcal</span>
                        </div>
                    </div>
                    
                    <button onClick={handleFinishOnboarding} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl text-lg transition-colors shadow-lg shadow-emerald-200 dark:shadow-none">
                       Start Tracking
                    </button>
                 </div>
              )}
           </div>
        </div>,
        modalRoot
      )}

      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
         <div className="flex items-center gap-4">
             {activeTab === 'today' ? (
                 <div className="flex items-center gap-3">
                    <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                       <ChevronLeft size={20} className="text-slate-400" />
                    </button>
                    <div className="text-center">
                       <h3 className="font-bold text-slate-900 dark:text-white text-lg">Today</h3>
                    </div>
                    <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                       <ChevronRight size={20} className="text-slate-400" />
                    </button>
                 </div>
             ) : (
                 <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2"><History size={20}/> Yearly Overview</h3>
             )}
             
             <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                 <button 
                    onClick={() => setActiveTab('today')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'today' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                    Daily
                 </button>
                 <button 
                    onClick={() => setActiveTab('history')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'history' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                    History
                 </button>
             </div>
         </div>

         {activeTab === 'today' && (
             <button 
               onClick={() => setShowOnboarding(true)}
               className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg"
             >
               Edit Goals
             </button>
         )}
      </div>

      {activeTab === 'today' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
          {/* LEFT COL: Summary & Macros */}
          <div className="lg:col-span-1 flex flex-col gap-6">
              {/* --- SUMMARY CARD (Calories Remaining) --- */}
              <div className="bg-slate-900 dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-800 dark:border-slate-700 p-6 text-white relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Scale size={120} />
                 </div>
                 <div className="flex justify-between items-start mb-6 relative z-10">
                    <h2 className="font-bold text-lg">Calories Remaining</h2>
                    <button 
                        onClick={() => setAddingMealType('snack')}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <PlusCircle size={20}/>
                    </button>
                 </div>
                 
                 <div className="flex items-center justify-between text-center relative z-10">
                    <div className="text-center">
                       <div className={`text-4xl font-black mb-1 ${remaining < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {remaining}
                       </div>
                       <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Remaining</div>
                    </div>
                    
                    <div className="text-right space-y-1">
                        <div className="flex justify-end gap-2 text-sm">
                            <span className="text-slate-400">Goal:</span> 
                            <span className="font-bold">{nutrition.dailyCalorieTarget}</span>
                        </div>
                        <div className="flex justify-end gap-2 text-sm">
                            <span className="text-slate-400">Food:</span> 
                            <span className="font-bold">-{nutrition.caloriesConsumed}</span>
                        </div>
                        <div className="flex justify-end gap-2 text-sm">
                            <span className="text-slate-400">Exercise:</span> 
                            <span className="font-bold">+0</span>
                        </div>
                    </div>
                 </div>
              </div>

              {/* Macros */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 flex-1 flex flex-col justify-center">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-700 dark:text-slate-200">Macronutrients</h3>
                 </div>
                 
                 <div className="space-y-5">
                    {[
                      { label: 'Protein', val: nutrition.macros.protein, target: proteinTarget, color: 'bg-blue-500' },
                      { label: 'Carbs', val: nutrition.macros.carbs, target: carbsTarget, color: 'bg-emerald-500' },
                      { label: 'Fat', val: nutrition.macros.fats, target: fatsTarget, color: 'bg-violet-500' }
                    ].map((m) => (
                       <div key={m.label}>
                          <div className="flex justify-between text-xs mb-1.5">
                             <span className="font-bold text-slate-700 dark:text-slate-300">{m.label}</span>
                             <span className="text-slate-500 font-medium">{m.val} / {m.target}g</span>
                          </div>
                          <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                             <div className={`h-full rounded-full ${m.color}`} style={{ width: `${Math.min((m.val/m.target)*100, 100)}%` }}></div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
              
              {/* Donut Chart (Compact) */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 flex flex-col items-center justify-center">
                 <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4 w-full text-left">Calorie Breakdown</h3>
                 <div className="flex items-center justify-between w-full">
                    <div className="w-32 h-32 relative flex-shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={displayData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={55}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {displayData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xl font-black text-slate-800 dark:text-white">{nutrition.caloriesConsumed}</span>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Kcal</span>
                        </div>
                    </div>
                    
                    <div className="flex-1 pl-6 grid grid-cols-1 gap-3">
                        {mealData.length > 0 ? mealData.map(d => (
                            <div key={d.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: d.color}}></div>
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{d.name}</span>
                                </div>
                                <span className="text-xs font-mono text-slate-500 dark:text-slate-500">{Math.round((d.value/nutrition.caloriesConsumed)*100)}%</span>
                            </div>
                        )) : (
                            <span className="text-xs text-slate-400 italic">No meals tracked today</span>
                        )}
                    </div>
                 </div>
              </div>
          </div>

          {/* RIGHT COL: Meal Logging */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
             {([
                { id: 'breakfast', label: 'Breakfast', icon: Sun },
                { id: 'lunch', label: 'Lunch', icon: Sun },
                { id: 'dinner', label: 'Dinner', icon: Moon },
                { id: 'snack', label: 'Snacks', icon: Apple }
             ] as const).map((meal) => {
                const items = nutrition.meals[meal.id];
                const total = items.reduce((acc, i) => acc + i.calories, 0);

                return (
                   <div key={meal.id} className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col h-full">
                      <div className="p-4 border-b border-slate-50 dark:border-slate-700/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800">
                         <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base text-slate-800 dark:text-white">{meal.label}</h3>
                         </div>
                         <span className="font-bold text-sm text-slate-500 dark:text-slate-400">{total} kcal</span>
                      </div>
                      
                      <div className="p-2 flex-1 min-h-[100px]">
                         {items.length > 0 ? items.map(item => (
                            <div key={item.id} className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl flex justify-between items-center group cursor-pointer transition-colors mb-1 last:mb-0">
                               <div>
                                  <div className="font-bold text-sm text-slate-700 dark:text-slate-200">{item.name}</div>
                               </div>
                               <div className="font-medium text-xs text-slate-600 dark:text-slate-400">{item.calories}</div>
                            </div>
                         )) : (
                             <div className="h-full flex items-center justify-center text-xs text-slate-400 italic py-4">No food logged</div>
                         )}
                      </div>
                      
                      <button 
                         onClick={() => setAddingMealType(meal.id)}
                         className="w-full text-center p-3 border-t border-slate-50 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-bold text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors uppercase tracking-wide"
                      >
                         + Add Food
                      </button>
                   </div>
                );
             })}
          </div>
        </div>
      ) : (
        /* --- HISTORY TAB --- */
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-8 animate-in fade-in zoom-in-95 h-full">
             <div className="flex items-center justify-between mb-8">
                 <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Annual Calorie Tracking</h3>
                    <p className="text-slate-500 dark:text-slate-400">Intake vs Goal over the last 12 months</p>
                 </div>
                 <div className="flex gap-4 text-sm font-medium">
                     <div className="flex items-center gap-2">
                         <span className="w-3 h-3 bg-blue-500 rounded-full"></span> Consumed
                     </div>
                     <div className="flex items-center gap-2">
                         <span className="w-3 h-3 bg-slate-300 rounded-full"></span> Goal
                     </div>
                 </div>
             </div>

             <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_HISTORY_DATA} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                        <YAxis tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                        <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                        />
                        <Legend />
                        <Bar dataKey="calories" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Calories In" />
                        <Bar dataKey="goal" fill="#cbd5e1" radius={[4, 4, 0, 0]} name="Goal Target" />
                    </BarChart>
                </ResponsiveContainer>
             </div>
             <p className="text-center text-xs text-slate-400 mt-6 italic">History data simulated for demonstration.</p>
        </div>
      )}

      {/* --- ADD FOOD MODAL (Fixed Viewport Coverage) --- */}
      {addingMealType && modalRoot && createPortal(
         <div className="fixed top-0 left-0 w-screen h-screen z-[9999] flex items-end sm:items-center justify-center sm:p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md w-full h-full" onClick={() => setAddingMealType(null)} />
            
            <div className="relative bg-white dark:bg-slate-900 sm:rounded-3xl rounded-t-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 h-[85vh] sm:h-[800px] max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800 z-10">
               
               {/* Modal Header */}
               <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3 bg-white dark:bg-slate-900">
                  <button onClick={() => setAddingMealType(null)}><ChevronLeft className="text-slate-500" /></button>
                  <h3 className="font-black text-lg text-slate-800 dark:text-white capitalize">{addingMealType}</h3>
               </div>

               <div className="p-6 flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900">
                  {/* Search Bar & Scanner */}
                  <div className="flex gap-2 mb-6">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl flex items-center gap-3 flex-1 shadow-sm focus-within:ring-2 focus-within:ring-blue-500">
                        <Search className="text-slate-400" size={20} />
                        <input 
                        className="bg-transparent outline-none w-full font-medium text-slate-800 dark:text-white placeholder:text-slate-400"
                        placeholder="Search for a food..."
                        value={newItem.name}
                        onChange={e => setNewItem({...newItem, name: e.target.value})}
                        autoFocus
                        />
                    </div>
                    {/* Camera Button */}
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isScanning}
                        className="bg-blue-600 text-white p-3 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-wait"
                    >
                        {isScanning ? <Loader2 size={24} className="animate-spin" /> : <Camera size={24} />}
                    </button>
                    <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef} 
                        onChange={handleScanFood} 
                        className="hidden" 
                    />
                  </div>

                  {isScanning && (
                      <div className="text-center p-4 mb-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-300 text-sm font-bold animate-pulse">
                          Analyzing image with AI...
                      </div>
                  )}

                  <div className="mb-6 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                     <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Calories</label>
                     <input 
                       type="number"
                       className="w-full text-5xl font-black text-slate-800 dark:text-white outline-none bg-transparent border-b-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 transition-colors py-2"
                       placeholder="0"
                       value={newItem.calories}
                       onChange={e => setNewItem({...newItem, calories: e.target.value})}
                     />
                  </div>

                  {/* History / Recent (Mock) */}
                  <div>
                     <h4 className="font-bold text-slate-800 dark:text-white mb-3 px-2">Recent & Frequent</h4>
                     <div className="space-y-2">
                        {['Oatmeal', 'Banana', 'Grilled Chicken', 'Rice', 'Greek Yogurt', 'Avocado Toast'].map(food => (
                           <button 
                             key={food}
                             onClick={() => setNewItem({ ...newItem, name: food, calories: Math.floor(Math.random() * 300 + 50).toString() })}
                             className="w-full text-left p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl flex justify-between items-center group transition-all"
                           >
                              <span className="font-bold text-slate-700 dark:text-slate-300">{food}</span>
                              <PlusCircle size={20} className="text-slate-300 group-hover:text-blue-500" />
                           </button>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 z-10">
                  <button 
                     onClick={handleAddFood}
                     disabled={!newItem.name || !newItem.calories}
                     className="w-full bg-blue-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none transition-all active:scale-95"
                  >
                     Add Food Entry
                  </button>
               </div>
            </div>
         </div>,
         modalRoot
      )}
    </div>
  );
};

export default NutritionTracker;
