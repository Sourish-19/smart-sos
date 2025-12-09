import React, { useState } from 'react';
import { Activity, Loader2, AlertCircle, ChevronDown } from 'lucide-react';
import { authService, User } from '../services/authService';

interface AuthProps {
  onLogin: (user: User) => void;
}

const countries = [
  { code: '+1', flag: '🇺🇸', name: 'USA' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: '+81', flag: '🇯🇵', name: 'Japan' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+86', flag: '🇨🇳', name: 'China' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+31', flag: '🇳🇱', name: 'Netherlands' },
  { code: '+55', flag: '🇧🇷', name: 'Brazil' },
  { code: '+1', flag: '🇨🇦', name: 'Canada' },
];

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [countryCode, setCountryCode] = useState('+1');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    age: '',
    phoneNumber: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let user: User;
      
      if (isLogin) {
        // Login Logic
        if (!formData.email || !formData.password) {
          throw new Error("Please fill in all fields");
        }
        user = await authService.login(formData.email, formData.password);
      } else {
        // Register Logic
        if (!formData.email || !formData.password || !formData.name || !formData.phoneNumber) {
          throw new Error("Please fill in all required fields");
        }
        
        // Combine country code and phone number
        const fullPhoneNumber = `${countryCode} ${formData.phoneNumber}`;

        user = await authService.register(
          formData.email, 
          formData.password, 
          formData.name, 
          parseInt(formData.age) || 60,
          fullPhoneNumber
        );
      }
      
      onLogin(user);
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Pre-fill for demo convenience if empty
  React.useEffect(() => {
    if (isLogin && !formData.email) {
      setFormData(prev => ({...prev, email: 'margaret@example.com', password: ''}));
    }
  }, [isLogin]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 font-sans transition-colors duration-200">
      {/* Logo & Header */}
      <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-md">
            <Activity className="text-blue-600 dark:text-blue-400" size={40} />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">SmartSOS</h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">AI-Powered Health Monitoring</p>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-500 border border-slate-100 dark:border-slate-800">
        
        {/* Animated Tab Switcher */}
        <div className="relative flex p-1.5 bg-slate-100 dark:bg-slate-800 m-6 mb-2 rounded-2xl h-14">
          {/* Sliding Background Pill */}
          <div 
            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white dark:bg-slate-700 shadow-md rounded-xl transition-all duration-300 ease-out z-0 ${
              isLogin ? 'left-1.5' : 'left-[calc(50%+1.5px)]'
            }`}
          ></div>
          
          <button
            onClick={() => { setIsLogin(true); setError(null); }}
            className={`flex-1 relative z-10 text-sm font-bold transition-colors duration-300 ${
              isLogin 
                ? 'text-slate-900 dark:text-white' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(null); }}
            className={`flex-1 relative z-10 text-sm font-bold transition-colors duration-300 ${
              !isLogin 
                ? 'text-slate-900 dark:text-white' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            Register
          </button>
        </div>

        <div className="p-8 pt-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 text-center">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed text-center">
            {isLogin 
              ? 'Enter your credentials to access your dashboard' 
              : 'Join SmartSOS for 24/7 health monitoring'
            }
          </p>

          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl flex items-center text-sm font-medium animate-in slide-in-from-top-2">
              <AlertCircle size={18} className="mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-5 animate-in slide-in-from-left-4 fade-in duration-300">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Full Name</label>
                  <input
                    type="text"
                    required={!isLogin}
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium text-slate-700 dark:text-white transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                    placeholder="Margaret Thompson"
                  />
                </div>
                
                {/* Phone Number with Country Code */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Phone Number (ft. Telegram Alerts)</label>
                  <div className="flex relative rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                    <div className="relative border-r border-slate-200 dark:border-slate-700">
                      <select 
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="appearance-none bg-transparent h-full pl-3 pr-8 py-3.5 text-slate-700 dark:text-white font-medium outline-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm w-24"
                      >
                        {countries.map(country => (
                          <option key={country.code} value={country.code}>
                            {country.flag} {country.code}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                        <ChevronDown size={14} />
                      </div>
                    </div>
                    <input
                      type="tel"
                      required={!isLogin}
                      value={formData.phoneNumber}
                      onChange={e => setFormData({...formData, phoneNumber: e.target.value.replace(/\D/g, '')})}
                      className="flex-1 p-3.5 bg-transparent outline-none font-medium text-slate-700 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 min-w-0"
                      placeholder="555 123 4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Age (Optional)</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={e => setFormData({...formData, age: e.target.value})}
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium text-slate-700 dark:text-white transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                    placeholder="72"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium text-slate-700 dark:text-white transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium text-slate-700 dark:text-white transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-100 dark:shadow-none mt-4 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={24} />
                  Processing...
                </>
              ) : (
                isLogin ? 'Login' : 'Create Account'
              )}
            </button>
          </form>
        </div>
      </div>
      
      <p className="mt-8 text-slate-400 dark:text-slate-500 text-xs font-medium">© 2025 SmartSOS Health Systems</p>
    </div>
  );
};

export default Auth;