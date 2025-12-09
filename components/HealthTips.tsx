
import React, { useState } from 'react';
import { Sparkles, ArrowRight, Droplets, Sun, Moon, Coffee, Heart, Utensils, Brain, Check, Plus, BookOpen, Smile, Lightbulb, X, Dices, Star, Zap, Flame, ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { createPortal } from 'react-dom';
import { NotificationType } from './NotificationSystem';

interface HealthTipsProps {
  onNotification?: (type: NotificationType, title: string, message: string) => void;
}

const HealthTips: React.FC<HealthTipsProps> = ({ onNotification }) => {
  const [showAllHabits, setShowAllHabits] = useState(false);
  
  // Topic/Fact State
  const [selectedTopic, setSelectedTopic] = useState<{title: string, icon: any, color: string, text: string, facts: string[]} | null>(null);
  const [currentFact, setCurrentFact] = useState<string>("");
  const [isRolling, setIsRolling] = useState(false);

  // Custom Habit State
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [customHabit, setCustomHabit] = useState({ title: '', desc: '', color: 'bg-blue-100', iconColor: 'text-blue-600' });

  // Carousel State
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  // Portal Root
  const modalRoot = document.getElementById('modal-root') || document.body;

  const featuredTips = [
    {
      title: "Take Vitamin D Supplements",
      desc: "Based on your location and recent low sun exposure, ensuring sufficient Vitamin D levels is crucial for bone health and immunity.",
      category: "AI SUGGESTION",
      icon: Sparkles,
      tagBg: "bg-yellow-200 dark:bg-yellow-800",
      tagText: "text-yellow-800 dark:text-yellow-200"
    },
    {
      title: "Stay Hydrated Today",
      desc: "The weather is warmer than usual. Aim for at least 8 glasses of water to maintain energy levels and cognitive function.",
      category: "DAILY GOAL",
      icon: Droplets,
      tagBg: "bg-blue-200 dark:bg-blue-800",
      tagText: "text-blue-800 dark:text-blue-200"
    },
    {
      title: "Afternoon Stretch",
      desc: "You've been sedentary for a while. A 5-minute stretching routine can improve circulation and reduce back pain.",
      category: "ACTIVITY",
      icon: Activity,
      tagBg: "bg-emerald-200 dark:bg-emerald-800",
      tagText: "text-emerald-800 dark:text-emerald-200"
    }
  ];

  const nextTip = () => setCurrentTipIndex((prev) => (prev + 1) % featuredTips.length);
  const prevTip = () => setCurrentTipIndex((prev) => (prev - 1 + featuredTips.length) % featuredTips.length);
  
  const currentTip = featuredTips[currentTipIndex];

  const [habits, setHabits] = useState([
    { id: 1, title: 'Morning Walk', desc: '15 mins of light walking', streak: 12, color: 'bg-yellow-100', iconColor: 'text-yellow-600', completed: false, icon: Sun },
    { id: 2, title: 'Hydration', desc: 'Drink 6 glasses of water', streak: 5, color: 'bg-blue-100', iconColor: 'text-blue-600', completed: false, icon: Droplets },
    { id: 3, title: 'No Sugar', desc: 'Avoid sweets after 6 PM', streak: 3, color: 'bg-rose-100', iconColor: 'text-rose-600', completed: false, icon: Coffee },
    // Hidden habits shown on "See All"
    { id: 4, title: 'Reading', desc: 'Read 10 pages of a book', streak: 8, color: 'bg-purple-100', iconColor: 'text-purple-600', completed: false, icon: BookOpen },
    { id: 5, title: 'Meditation', desc: '5 mins deep breathing', streak: 21, color: 'bg-emerald-100', iconColor: 'text-emerald-600', completed: false, icon: Brain },
    { id: 6, title: 'Gratitude', desc: 'Write 3 things you love', streak: 2, color: 'bg-orange-100', iconColor: 'text-orange-600', completed: false, icon: Smile },
  ]);

  const toggleHabit = (id: number) => {
    setHabits(habits.map(h => {
      if (h.id === id) {
        const isCompleting = !h.completed;
        if (isCompleting && onNotification) {
          // Trigger notification only when marking as done
          onNotification('system', 'Habit Completed! 🎉', `Great job keeping up with your ${h.title}. Streak updated!`);
        }
        return { ...h, completed: isCompleting };
      }
      return h;
    }));
  };

  const colorOptions = [
    { bg: 'bg-blue-100', text: 'text-blue-600', label: 'Blue' },
    { bg: 'bg-green-100', text: 'text-green-600', label: 'Green' },
    { bg: 'bg-rose-100', text: 'text-rose-600', label: 'Rose' },
    { bg: 'bg-purple-100', text: 'text-purple-600', label: 'Purple' },
    { bg: 'bg-yellow-100', text: 'text-yellow-600', label: 'Yellow' },
    { bg: 'bg-orange-100', text: 'text-orange-600', label: 'Orange' },
  ];

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customHabit.title || !customHabit.desc) return;

    const newId = Math.max(...habits.map(h => h.id)) + 1;
    const newHabitObj = {
      id: newId,
      title: customHabit.title,
      desc: customHabit.desc,
      streak: 0,
      color: customHabit.color,
      iconColor: customHabit.iconColor,
      completed: false,
      icon: Star // Default icon for custom habits
    };

    setHabits([...habits, newHabitObj]);
    setIsAddingHabit(false);
    setCustomHabit({ title: '', desc: '', color: 'bg-blue-100', iconColor: 'text-blue-600' });
    if (onNotification) onNotification('system', 'New Habit Added', `${customHabit.title} has been added to your tracker.`);
  };

  const topics = [
    { 
      title: 'Heart Health', 
      icon: Heart, 
      color: 'bg-rose-100', 
      text: 'text-rose-600', 
      facts: [
        "Your heart beats about 100,000 times a day, pumping 2,000 gallons of blood.",
        "Laughing is great for your heart—it increases blood flow by 20%!",
        "Monday mornings see the highest rate of heart attacks due to stress hormones.",
        "Dark chocolate (in moderation) can reduce the risk of heart disease by 1/3."
      ] 
    },
    { 
      title: 'Sleep Hygiene', 
      icon: Moon, 
      color: 'bg-indigo-100', 
      text: 'text-indigo-600', 
      facts: [
        "Humans are the only mammals that willingly delay sleep.",
        "Sleeping in a cooler room (around 65°F or 18°C) helps you fall asleep faster.",
        "12% of people dream entirely in black and white.",
        "Sleep deprivation will kill you faster than food deprivation."
      ] 
    },
    { 
      title: 'Nutrition', 
      icon: Utensils, 
      color: 'bg-green-100', 
      text: 'text-green-600', 
      facts: [
        "Broccoli contains more protein per calorie than steak!",
        "Honey is the only food that includes all the substances necessary to sustain life.",
        "Cranberries will bounce if they are fresh and ripe.",
        "Apples are more effective at waking you up in the morning than coffee."
      ] 
    },
    { 
      title: 'Mental Fit', 
      icon: Brain, 
      color: 'bg-purple-100', 
      text: 'text-purple-600', 
      facts: [
        "Your brain generates about 12-25 watts of electricity—enough to power a light bulb!",
        "Learning a new skill physically changes your brain structure.",
        "Your brain is about 73% water. Even 2% dehydration affects attention.",
        "Information zooms along nerves at about 268 miles per hour."
      ] 
    },
  ];

  const handleOpenTopic = (topic: typeof topics[0]) => {
     setSelectedTopic(topic);
     // Pick a random fact initially
     const random = topic.facts[Math.floor(Math.random() * topic.facts.length)];
     setCurrentFact(random);
  };

  const handleRollDice = () => {
    if (!selectedTopic) return;
    setIsRolling(true);
    
    // Simulate thinking/rolling
    setTimeout(() => {
       // Filter out current fact to ensure we get a new one if possible
       const otherFacts = selectedTopic.facts.filter(f => f !== currentFact);
       const nextFact = otherFacts.length > 0 
          ? otherFacts[Math.floor(Math.random() * otherFacts.length)]
          : selectedTopic.facts[0];
       
       setCurrentFact(nextFact);
       setIsRolling(false);
    }, 600);
  };

  const visibleHabits = showAllHabits ? habits : habits.slice(0, 3);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Health Insights</h2>
        <p className="text-slate-500 dark:text-slate-400">Daily tips and habits curated for your wellness.</p>
      </div>

      {/* Featured Banner Carousel */}
      <div className="bg-[#FDF6E9] dark:bg-amber-900/20 rounded-[2rem] p-8 relative overflow-hidden group hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-200 dark:bg-yellow-600/20 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-yellow-300 dark:group-hover:bg-yellow-600/30"></div>
        
        {/* Content with Key Key for Animation */}
        <div className="relative z-10 max-w-lg min-h-[220px] flex flex-col justify-between" key={currentTipIndex}>
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className={`inline-flex items-center gap-2 px-3 py-1 ${currentTip.tagBg} ${currentTip.tagText} rounded-full text-xs font-bold uppercase tracking-wider mb-4`}>
               <currentTip.icon size={14} /> {currentTip.category}
            </div>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-3 font-serif leading-tight">{currentTip.title}</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium text-lg">
              {currentTip.desc}
            </p>
          </div>

          {/* Carousel Controls */}
          <div className="flex items-center gap-4 mt-6">
            <button 
              onClick={prevTip}
              className="p-3 rounded-full bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-white transition-all shadow-sm hover:scale-110 active:scale-95"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex gap-2">
              {featuredTips.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-2 rounded-full transition-all duration-300 ${idx === currentTipIndex ? 'w-8 bg-slate-800 dark:bg-white' : 'w-2 bg-slate-400/50 dark:bg-slate-600'}`}
                />
              ))}
            </div>

            <button 
              onClick={nextTip}
              className="p-3 rounded-full bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-white transition-all shadow-sm hover:scale-110 active:scale-95"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Abstract Shapes Decoration */}
        <div className="absolute bottom-8 right-8 hidden sm:block pointer-events-none">
           <div className="relative">
              <div className="w-24 h-24 bg-rose-300 rounded-full opacity-80 animate-pulse"></div>
              <div className="w-16 h-16 bg-blue-300 rounded-full absolute -top-4 -left-4 opacity-80 mix-blend-multiply dark:mix-blend-normal"></div>
              <div className="w-20 h-20 bg-green-300 rounded-full absolute -bottom-2 -left-8 opacity-80 mix-blend-multiply dark:mix-blend-normal"></div>
           </div>
        </div>
      </div>

      {/* Ask AI Button */}
      <button className="w-full bg-slate-900 dark:bg-blue-600 text-white p-5 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all flex items-center justify-between group">
        <span>Ask SmartSOS Assistant anything</span>
        <div className="bg-white/20 p-2 rounded-full group-hover:rotate-12 transition-transform">
          <Sparkles size={24} />
        </div>
      </button>

      {/* Habits Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
           <h3 className="text-xl font-bold text-slate-900 dark:text-white">New habits for you</h3>
           <button 
             onClick={() => setShowAllHabits(!showAllHabits)}
             className="text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-transparent px-3 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
           >
             {showAllHabits ? 'Show Less' : 'See All'}
           </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {visibleHabits.map((habit) => (
            <div 
              key={habit.id} 
              onClick={() => toggleHabit(habit.id)}
              className={`relative overflow-hidden rounded-3xl p-6 transition-all duration-300 cursor-pointer border-2 hover:scale-[1.03] hover:shadow-xl animate-in fade-in zoom-in-95 ${
                habit.completed 
                  ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-75' 
                  : `${habit.color} dark:bg-slate-800 border-transparent dark:border-slate-700`
              }`}
            >
              <div className="flex justify-between items-start mb-12">
                 <div className={`p-3 rounded-full bg-white dark:bg-slate-700 shadow-sm ${habit.iconColor} dark:text-white`}>
                    <habit.icon size={24} />
                 </div>
                 <div className="flex flex-col items-center">
                    <span className="text-2xl font-black text-slate-800 dark:text-white">{habit.streak}</span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Days</span>
                 </div>
              </div>
              
              <div>
                 <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{habit.title}</h4>
                 <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 line-clamp-2">{habit.desc}</p>
              </div>

              {/* Action Button */}
              <div className={`absolute bottom-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                 habit.completed 
                    ? 'bg-emerald-500 text-white scale-110' 
                    : 'bg-slate-900/10 dark:bg-white/10 text-slate-900 dark:text-white hover:bg-slate-900/20'
              }`}>
                 {habit.completed ? <Check size={20} className="animate-bounce" /> : <Plus size={20} />}
              </div>
            </div>
          ))}

          {/* Add Custom Habit Card */}
          <div 
            onClick={() => setIsAddingHabit(true)}
            className="rounded-3xl p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-800 transition-all min-h-[240px] group"
          >
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-900 transition-colors">
              <Plus size={32} className="text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
            </div>
            <h4 className="font-bold text-slate-700 dark:text-slate-200">Create Custom Habit</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Track something personal to you</p>
          </div>
        </div>
      </div>

      {/* Explore Section */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Explore Topics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {topics.map((topic, idx) => (
             <div 
               key={idx} 
               onClick={() => handleOpenTopic(topic)}
               className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all hover:scale-[1.05] cursor-pointer group"
             >
                <div className={`w-full h-24 ${topic.color} dark:bg-opacity-20 rounded-xl mb-3 flex items-center justify-center group-hover:scale-105 transition-transform`}>
                   <topic.icon size={32} className={topic.text} />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-white text-center">{topic.title}</h4>
             </div>
           ))}
        </div>
      </div>

      {/* Cool Fact Modal via Portal */}
      {selectedTopic && modalRoot && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
             onClick={() => setSelectedTopic(null)}
           />
           
           {/* Modal Content */}
           <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200 dark:border-slate-700 z-10">
              <button 
                onClick={() => setSelectedTopic(null)}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors z-10"
              >
                 <X size={20} className="text-slate-800 dark:text-white" />
              </button>

              <div className={`${selectedTopic.color} dark:bg-opacity-20 h-32 flex items-center justify-center relative overflow-hidden`}>
                 <selectedTopic.icon size={64} className={`${selectedTopic.text} ${isRolling ? 'animate-spin' : 'animate-bounce'}`} />
                 
                 {/* Dice Button */}
                 <button 
                    onClick={handleRollDice}
                    disabled={isRolling}
                    className="absolute bottom-4 right-4 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-md flex items-center gap-2 text-xs font-bold hover:scale-105 active:scale-95 transition-transform text-slate-700 dark:text-white disabled:opacity-50"
                 >
                    <Dices size={16} className={isRolling ? 'animate-spin' : ''} />
                    {isRolling ? 'Rolling...' : 'Roll Dice'}
                 </button>
              </div>
              
              <div className="p-8 text-center">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                    <Lightbulb size={14} /> Did You Know?
                 </div>
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">{selectedTopic.title}</h3>
                 
                 <div className="min-h-[100px] flex items-center justify-center">
                    <p className={`text-slate-600 dark:text-slate-300 text-lg leading-relaxed font-medium transition-opacity duration-300 ${isRolling ? 'opacity-0' : 'opacity-100'}`}>
                    "{currentFact}"
                    </p>
                 </div>
                 
                 <button 
                   onClick={() => setSelectedTopic(null)}
                   className="mt-6 w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
                 >
                   Awesome!
                 </button>
              </div>
           </div>
        </div>,
        modalRoot
      )}

      {/* Add Custom Habit Modal via Portal */}
      {isAddingHabit && modalRoot && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div 
             className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
             onClick={() => setIsAddingHabit(false)}
           />
           <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 duration-300 z-10 border border-slate-200 dark:border-slate-700">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Create Custom Habit</h3>
              
              <form onSubmit={handleAddHabit} className="space-y-4">
                <div>
                   <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1">Habit Title</label>
                   <input 
                      required
                      placeholder="e.g. Yoga Practice"
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white font-medium"
                      value={customHabit.title}
                      onChange={e => setCustomHabit({...customHabit, title: e.target.value})}
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1">Description</label>
                   <input 
                      required
                      placeholder="e.g. 20 mins daily flow"
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white font-medium"
                      value={customHabit.desc}
                      onChange={e => setCustomHabit({...customHabit, desc: e.target.value})}
                   />
                </div>
                
                <div>
                   <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 ml-1">Choose Color</label>
                   <div className="flex gap-2">
                      {colorOptions.map((opt) => (
                         <button
                           key={opt.bg}
                           type="button"
                           onClick={() => setCustomHabit({...customHabit, color: opt.bg, iconColor: opt.text})}
                           className={`w-10 h-10 rounded-full ${opt.bg} border-2 transition-all ${customHabit.color === opt.bg ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent hover:scale-105'}`}
                           title={opt.label}
                         />
                      ))}
                   </div>
                </div>

                <div className="flex gap-3 pt-4">
                   <button 
                     type="button"
                     onClick={() => setIsAddingHabit(false)}
                     className="flex-1 py-3 font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
                   >
                     Cancel
                   </button>
                   <button 
                     type="submit"
                     className="flex-1 bg-slate-900 dark:bg-blue-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
                   >
                     Create Habit
                   </button>
                </div>
              </form>
           </div>
        </div>,
        modalRoot
      )}

    </div>
  );
};

export default HealthTips;
