import React, { useState } from 'react';
import { User, Phone, Bell, Shield, Volume2, Plus, Trash2, Save, Activity, Smartphone, MapPin, Send, ExternalLink, HelpCircle, Eye, EyeOff } from 'lucide-react';
import { PatientState, EmergencyContact } from '../types';

interface SettingsProps {
  patient: PatientState;
  onUpdateProfile: (updates: Partial<PatientState>) => void;
  onAddContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  onRemoveContact: (id: string) => void;
  onTestAlarm: () => void;
  onTestWhatsApp: () => void;
}

const Settings: React.FC<SettingsProps> = ({ patient, onUpdateProfile, onAddContact, onRemoveContact, onTestAlarm, onTestWhatsApp }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'contacts' | 'device'>('profile');
  
  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: patient.name,
    age: patient.age,
    address: patient.location.address
  });

  // Telegram Config State
  const [telegramConfig, setTelegramConfig] = useState({
    botToken: patient.telegramBotToken || '',
    chatId: patient.telegramChatId || ''
  });
  const [showToken, setShowToken] = useState(false);

  // Alarm Volume State
  const [volume, setVolume] = useState(80);

  // Contact Form State
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', relation: '', phone: '', isPrimary: false });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: profileForm.name,
      age: Number(profileForm.age),
      location: { ...patient.location, address: profileForm.address }
    });
    alert("Profile updated successfully!");
  };

  const handleSaveTelegram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!telegramConfig.botToken.trim() || !telegramConfig.chatId.trim()) {
      alert("Please enter both Bot Token and Chat ID before saving.");
      return;
    }
    onUpdateProfile({
        telegramBotToken: telegramConfig.botToken.trim(),
        telegramChatId: telegramConfig.chatId.trim()
    });
    alert("Telegram settings saved!");
  };

  const handleAddContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newContact.name && newContact.phone) {
      onAddContact(newContact);
      setNewContact({ name: '', relation: '', phone: '', isPrimary: false });
      setIsAddingContact(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Settings & Configuration</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage patient profile, emergency contacts, and device preferences.</p>
        </div>
        <div className="flex space-x-1 bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-blue-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
          >
            Profile
          </button>
          <button 
            onClick={() => setActiveTab('contacts')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'contacts' ? 'bg-blue-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
          >
            Contacts
          </button>
          <button 
            onClick={() => setActiveTab('device')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'device' ? 'bg-blue-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
          >
            Device & System
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Main Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
              <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-slate-100 dark:border-slate-700">
                <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-blue-200 dark:shadow-none shadow-lg"><User size={24}/></div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Patient Information</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Update your personal details</p>
                </div>
              </div>
              
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Full Name</label>
                    <input 
                      type="text" 
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                      className="w-full p-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold rounded-xl focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-600 dark:focus:border-blue-500 outline-none transition-all shadow-sm text-lg placeholder:text-slate-300 dark:placeholder:text-slate-600"
                      placeholder="e.g. Margaret Thompson"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Age</label>
                    <input 
                      type="number" 
                      value={profileForm.age}
                      onChange={(e) => setProfileForm({...profileForm, age: Number(e.target.value)})}
                      className="w-full p-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold rounded-xl focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-600 dark:focus:border-blue-500 outline-none transition-all shadow-sm text-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Home Address</label>
                  <div className="relative">
                    <MapPin className="absolute top-4 left-4 text-slate-400" size={20} />
                    <textarea 
                      rows={3}
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                      className="w-full pl-12 p-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold rounded-xl focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-600 dark:focus:border-blue-500 outline-none transition-all shadow-sm text-lg resize-none leading-relaxed"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-2 ml-1">This address is shared with emergency services during an SOS.</p>
                </div>
                <div className="pt-6 flex justify-end">
                   <button type="submit" className="flex items-center space-x-2 bg-slate-900 dark:bg-blue-600 text-white px-8 py-3.5 rounded-xl hover:bg-black dark:hover:bg-blue-700 transition-all shadow-lg active:scale-95 font-bold text-lg">
                      <Save size={20} />
                      <span>Save Changes</span>
                   </button>
                </div>
              </form>
            </div>
          )}

          {/* CONTACTS TAB */}
          {activeTab === 'contacts' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg text-emerald-600 dark:text-emerald-400"><Phone size={24}/></div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">Emergency Contacts</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">People notified during SOS alerts.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsAddingContact(!isAddingContact)}
                    className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 font-medium transition-colors"
                  >
                    <Plus size={18} />
                    <span>{isAddingContact ? 'Cancel' : 'Add Contact'}</span>
                  </button>
                </div>

                {isAddingContact && (
                   <form onSubmit={handleAddContactSubmit} className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl mb-6 border border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-2">
                      <h4 className="font-bold text-slate-800 dark:text-white mb-4">New Contact Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <input 
                          placeholder="Name" 
                          required
                          value={newContact.name}
                          onChange={e => setNewContact({...newContact, name: e.target.value})}
                          className="p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:border-emerald-500 outline-none"
                        />
                        <input 
                          placeholder="Relation (e.g. Son)" 
                          required
                          value={newContact.relation}
                          onChange={e => setNewContact({...newContact, relation: e.target.value})}
                          className="p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:border-emerald-500 outline-none"
                        />
                        <input 
                          placeholder="Phone Number" 
                          required
                          value={newContact.phone}
                          onChange={e => setNewContact({...newContact, phone: e.target.value})}
                          className="p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:border-emerald-500 outline-none"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button type="submit" className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-md">Save Contact</button>
                      </div>
                   </form>
                )}

                <div className="space-y-3">
                  {patient.contacts.map(contact => (
                    <div key={contact.id} className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-700 rounded-xl hover:shadow-md transition-all group bg-white dark:bg-slate-800">
                       <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${contact.isPrimary ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                            {contact.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-lg">
                              {contact.name}
                              {contact.isPrimary && <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full uppercase tracking-wide">Primary</span>}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{contact.relation} • {contact.phone}</p>
                          </div>
                       </div>
                       <button onClick={() => onRemoveContact(contact.id)} className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
                          <Trash2 size={20} />
                       </button>
                    </div>
                  ))}
                  {patient.contacts.length === 0 && (
                    <p className="text-center text-slate-400 py-8 italic">No contacts added yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* DEVICE TAB */}
          {activeTab === 'device' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
              <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-slate-100 dark:border-slate-700">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg text-purple-600 dark:text-purple-400"><Smartphone size={24}/></div>
                <div>
                   <h3 className="text-xl font-bold text-slate-900 dark:text-white">Device Preferences</h3>
                   <p className="text-sm text-slate-500 dark:text-slate-400">Configure your alert settings</p>
                </div>
              </div>

              <div className="space-y-8">
                
                {/* Telegram Configuration */}
                <div className="bg-sky-50 dark:bg-sky-900/20 p-5 rounded-xl border border-sky-100 dark:border-sky-800">
                  <div className="flex items-center space-x-3 mb-4">
                     <div className="bg-[#0088cc] p-2 rounded-lg text-white"><Send size={20} /></div>
                     <h4 className="font-bold text-slate-900 dark:text-white">Real Telegram Notifications</h4>
                  </div>
                  
                  <div className="bg-blue-100 dark:bg-blue-900/40 p-4 rounded-lg flex items-start gap-3 mb-6">
                    <HelpCircle size={18} className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                    <div className="text-xs text-blue-800 dark:text-blue-300 space-y-2">
                       <p className="font-bold">How to connect Telegram:</p>
                       <ol className="list-decimal ml-4 space-y-1.5">
                         <li>
                           Open <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="underline font-bold hover:text-blue-600">@BotFather</a>, create a new bot, and copy the <b>HTTP API Token</b>.
                         </li>
                         <li>
                           Open <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" className="underline font-bold hover:text-blue-600">@userinfobot</a> to get your personal <b>Id</b>.
                         </li>
                         <li>
                           <b>Start your bot:</b> Search for your new bot's username and click <b>Start</b> (or send <code>/start</code>).
                         </li>
                       </ol>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <div className="flex justify-between">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Bot Token</label>
                        </div>
                        <div className="relative mt-1">
                          <input 
                            type={showToken ? "text" : "password"}
                            placeholder="e.g. 123456:ABC-DEF..."
                            className="w-full p-2.5 pr-10 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-800 text-sm font-mono text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
                            value={telegramConfig.botToken}
                            onChange={(e) => setTelegramConfig({...telegramConfig, botToken: e.target.value})}
                            autoComplete="off"
                            spellCheck="false"
                          />
                          <button 
                            type="button"
                            onClick={() => setShowToken(!showToken)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                          >
                            {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                     </div>
                     <div>
                        <div className="flex justify-between">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Chat ID</label>
                        </div>
                        <input 
                          type="text"
                          placeholder="e.g. 987654321"
                          className="w-full p-2.5 mt-1 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-800 text-sm font-mono text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
                          value={telegramConfig.chatId}
                          onChange={(e) => setTelegramConfig({...telegramConfig, chatId: e.target.value})}
                          autoComplete="off"
                          spellCheck="false"
                        />
                     </div>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-sky-200 dark:border-sky-800">
                     <button 
                       onClick={handleSaveTelegram}
                       className="text-sky-700 dark:text-sky-300 font-bold text-sm hover:underline"
                     >
                       Save Credentials
                     </button>
                     <button 
                       onClick={onTestWhatsApp}
                       className="px-4 py-2 bg-[#0088cc] text-white font-bold rounded-lg hover:bg-[#0077b5] transition-colors text-sm shadow-sm flex items-center gap-2"
                     >
                       <Send size={14} />
                       Test Telegram
                     </button>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-6">
                   <div className="flex items-center space-x-4">
                      <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-xl"><Volume2 size={24} className="text-slate-700 dark:text-slate-300"/></div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-lg">Alarm Volume</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Volume level for SOS siren</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={volume} 
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="w-40 h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #2563eb 0%, #2563eb ${volume}%, #e2e8f0 ${volume}%, #e2e8f0 100%)`
                        }}
                      />
                      <span className="text-sm font-bold text-blue-600 w-8">{volume}%</span>
                   </div>
                </div>

                <div className="flex items-center justify-between">
                   <div className="flex items-center space-x-4">
                      <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-xl"><Shield size={24} className="text-slate-700 dark:text-slate-300"/></div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-lg">Fall Detection</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Adjust AI motion sensor threshold</p>
                      </div>
                   </div>
                   <select className="bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-sm font-bold p-3 outline-none focus:border-blue-500 text-slate-700 dark:text-white">
                     <option>High Sensitivity</option>
                     <option>Medium Sensitivity</option>
                     <option>Low Sensitivity</option>
                   </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Status & Test */}
        <div className="space-y-6">
           {/* Account Summary */}
           <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
              <div className="w-32 h-32 mx-auto bg-slate-100 dark:bg-slate-700 rounded-full mb-6 overflow-hidden border-4 border-white dark:border-slate-600 shadow-xl">
                 <img src="https://picsum.photos/200" alt="Profile" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{patient.name}</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-6">ID: {patient.id}</p>
              <div className="flex justify-center space-x-3">
                 <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide">Premium</span>
                 <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide">Verified</span>
              </div>
           </div>

           {/* System Test */}
           <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 text-white p-8 rounded-2xl shadow-xl relative overflow-hidden group">
              <div className="absolute -top-6 -right-6 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:rotate-12 duration-500">
                 <Activity size={140} />
              </div>
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <Shield size={24} className="text-blue-400" />
                System Diagnostics
              </h3>
              <p className="text-slate-400 dark:text-slate-300 mb-8 leading-relaxed">Run a simulation test to verify that speakers, notifications, and emergency protocols are working correctly.</p>
              
              <button 
                onClick={onTestAlarm}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-blue-500/30 flex items-center justify-center space-x-3"
              >
                <Activity size={22} />
                <span>Run System Test</span>
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;