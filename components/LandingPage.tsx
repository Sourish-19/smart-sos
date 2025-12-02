import React from 'react';
import { Activity, Shield, Bell, Users, Play, ArrowRight, TrendingUp, Cpu, Phone, Heart, CheckCircle } from 'lucide-react';

interface LandingPageProps {
  onLaunch: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLaunch }) => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Activity className="text-white" size={24} />
              </div>
              <span className="text-xl font-bold text-slate-900">SmartSOS</span>
            </div>
            
            {/* Links removed as requested */}

            <button 
              onClick={onLaunch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold transition-all shadow-lg hover:shadow-blue-500/30 active:scale-95"
            >
              Login / Launch App
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Text */}
            <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
              <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-slate-900 mb-6 leading-[1.1]">
                Predict. Prevent. <span className="text-blue-600">Protect.</span>
              </h1>
              <p className="text-xl lg:text-2xl font-bold text-slate-800 mb-4">
                Your 24×7 AI Virtual Health Guardian.
              </p>
              <p className="text-lg text-slate-500 mb-10 leading-relaxed max-w-lg">
                SmartSOS doesn't just track vitals—it predicts risks. From detecting gradual trends to triggering automatic SOS alerts, we ensure help arrives before an emergency happens.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button 
                  onClick={onLaunch}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-xl hover:shadow-blue-600/30 hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  Launch Guardian Dashboard
                </button>
                <button className="px-8 py-4 rounded-xl font-bold text-lg text-blue-600 border-2 border-blue-100 hover:border-blue-200 hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
                  <Play size={20} fill="currentColor" />
                  Watch How It Works
                </button>
              </div>

              <div className="flex items-center gap-8 text-sm font-bold text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 rounded-full text-blue-600"><Cpu size={16} /></div>
                  Real-time IoT Sync
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 rounded-full text-blue-600"><TrendingUp size={16} /></div>
                  AI Risk Analysis
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 rounded-full text-blue-600"><Phone size={16} /></div>
                  Instant SOS Dispatch
                </div>
              </div>
            </div>

            {/* Right Column: Visual Mockup */}
            <div className="relative animate-in fade-in zoom-in-95 duration-1000 delay-200">
              {/* Decorative Blur */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-400/20 blur-[100px] rounded-full -z-10"></div>
              
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-white">
                 {/* Background Lifestyle Image */}
                 <img 
                   src="https://images.unsplash.com/photo-1516307365426-bea591f05011?auto=format&fit=crop&q=80&w=1000" 
                   alt="Senior citizen relaxing at home"
                   className="w-full h-[500px] object-cover opacity-90"
                 />
                 
                 {/* Floating Dashboard Card */}
                 <div className="absolute top-8 right-8 left-8 bottom-8 bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-6 flex flex-col justify-between">
                    
                    <div className="flex justify-between items-center mb-6">
                       <h3 className="font-bold text-lg text-slate-900">Health Dashboard</h3>
                       <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                         <CheckCircle size={12} /> Stable
                       </span>
                    </div>

                    <div className="bg-blue-50/50 rounded-xl p-4 mb-4">
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium text-slate-500">Heart Rate</span>
                          <Heart size={20} className="text-rose-500 fill-rose-500 animate-pulse" />
                       </div>
                       <div className="text-3xl font-bold text-slate-900">72 BPM</div>
                       
                       {/* Mock Chart Line */}
                       <div className="flex items-end gap-1 h-8 mt-2 opacity-50">
                          <div className="w-1/6 bg-blue-500 h-[40%] rounded-t-sm"></div>
                          <div className="w-1/6 bg-blue-500 h-[60%] rounded-t-sm"></div>
                          <div className="w-1/6 bg-blue-500 h-[50%] rounded-t-sm"></div>
                          <div className="w-1/6 bg-blue-500 h-[80%] rounded-t-sm"></div>
                          <div className="w-1/6 bg-blue-500 h-[45%] rounded-t-sm"></div>
                          <div className="w-1/6 bg-blue-500 h-[70%] rounded-t-sm"></div>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-slate-50 rounded-xl p-4">
                          <span className="text-xs font-medium text-slate-500 block mb-1">Blood Pressure</span>
                          <span className="text-xl font-bold text-slate-900">120/80</span>
                       </div>
                       <div className="bg-slate-50 rounded-xl p-4">
                          <span className="text-xs font-medium text-slate-500 block mb-1">Temperature</span>
                          <span className="text-xl font-bold text-slate-900">98.6°F</span>
                       </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3 text-sm font-medium text-blue-600">
                       <Shield size={16} />
                       AI Monitoring Active
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-4">Advanced AI-Powered Protection</h2>
            <p className="text-lg text-slate-500">Combining cutting-edge technology with compassionate care to keep your loved ones safe.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-200">
                <TrendingUp size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Predictive Analytics</h3>
              <p className="text-slate-500 leading-relaxed">
                Advanced AI algorithms analyze vital trends to predict potential health risks before they become emergencies.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-200">
                <Bell size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Instant Alerts</h3>
              <p className="text-slate-500 leading-relaxed">
                Automatic SOS dispatch to family members and emergency services when critical thresholds are detected.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-200">
                <Users size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Family Connect</h3>
              <p className="text-slate-500 leading-relaxed">
                Keep family members informed with real-time updates and comprehensive health reports accessible anywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center space-x-2 mb-6">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Activity className="text-white" size={24} />
                </div>
                <span className="text-2xl font-bold text-white">SmartSOS</span>
              </div>
              <p className="text-sm leading-relaxed">Your trusted AI health guardian, protecting what matters most.</p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">Monitoring</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Live Vitals</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Medication Tracking</a></li>
                <li><a href="#" className="hover:text-white transition-colors">SOS Alerts</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Resources</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Caregiver Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Device Setup</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Privacy & Safety</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Data Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Emergency Protocols</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            © 2025 SmartSOS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;