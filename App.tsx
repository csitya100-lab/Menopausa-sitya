import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { loadState, saveLog, saveProfile, clearData } from './services/storage';
import { AppState, DailyLog, Tab, INITIAL_PROFILE } from './types';
import { Onboarding } from './components/Onboarding';
import { DailyCheckIn } from './components/DailyCheckIn';
import { Dashboard } from './components/Dashboard';
import { Report } from './components/Report';
import { Calendar } from './components/Calendar';
import { Chat } from './components/Chat';
import { EDUCATION_CONTENT } from './constants';
import { Home, BookOpen, BarChart2, FileText, Settings, PlusCircle, X, LogOut, Moon, Sun, Thermometer, Brain, Battery, Zap, Droplets, Bell, Clock, Calendar as CalendarIcon, CheckCircle2, ChevronDown, MessageCircle, ExternalLink } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(loadState());
  const [activeTab, setActiveTab] = useState<Tab>(Tab.HOME);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  
  // Today's date YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(today);

  useEffect(() => {
    // Check Smart Notifications on App Load
    const checkSmartNotifications = () => {
      const { notifications } = state.profile;
      // Guard clause for undefined notifications
      if (!notifications || !notifications.enabled || Notification.permission !== 'granted') return;

      // Logic 1: Inactivity Check
      if (notifications.reminderTypes?.inactivity) {
        const dates = Object.keys(state.logs).sort();
        if (dates.length > 0) {
          const lastLog = new Date(dates[dates.length - 1]);
          const diffTime = Math.abs(new Date().getTime() - lastLog.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

          if (diffDays > 3) {
            new Notification('Senti sua falta! 🌸', {
              body: `Faz ${diffDays} dias que não temos notícias. Como você está se sentindo hoje?`,
              icon: '/icon.png' // Assuming standard icon path
            });
          }
        }
      }

      // Logic 2: Medication Check (Simple simulation based on time)
      if (notifications.reminderTypes?.medicationCheck && state.profile.hrtStatus !== 'none') {
        const now = new Date();
        const reminderTime = parseInt(notifications.dailyTime.split(':')[0]);
        // If it's 2 hours after reminder time
        if (now.getHours() === reminderTime + 2) {
           // This would ideally be a service worker, but works if app is open
           new Notification('Acompanhamento HRT', {
              body: 'Notou alguma mudança 2h após sua medicação?',
           });
        }
      }
    };

    if ('Notification' in window && state.profile.notifications?.enabled) {
      checkSmartNotifications();
    }
  }, []);

  // Theme effect
  useEffect(() => {
    if (state.profile.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.profile.theme]);

  const handleOnboardingComplete = (profile: any) => {
    const newState = saveProfile(profile);
    setState(newState);
  };

  const handleSaveLog = (log: DailyLog) => {
    const newState = saveLog(log);
    setState(newState);
    setShowCheckInModal(false);
  };

  const handleOpenCheckIn = (date: string = today) => {
    setSelectedDate(date);
    setShowCheckInModal(true);
  };

  const quickSymptoms = [
    { id: 'hot_flash', label: 'Calores', icon: <Thermometer className="w-6 h-6" /> },
    { id: 'anxiety', label: 'Ansiedade', icon: <Brain className="w-6 h-6" /> },
    { id: 'insomnia', label: 'Insônia', icon: <Moon className="w-6 h-6" /> },
    { id: 'fatigue', label: 'Fadiga', icon: <Battery className="w-6 h-6" /> },
    { id: 'headache', label: 'Dor Cabeça', icon: <Zap className="w-6 h-6" /> },
    { id: 'bloating', label: 'Inchaço', icon: <Droplets className="w-6 h-6" /> },
  ];

  // Quick Symptom Logic
  const toggleQuickSymptom = (symptomId: string) => {
    const currentLog = state.logs[today];
    let newLog: DailyLog;

    if (currentLog) {
      const hasSymptom = currentLog.symptoms.includes(symptomId);
      let newSymptoms: string[];
      let newTimeline = currentLog.timeline ? [...currentLog.timeline] : [];

      if (hasSymptom) {
        // Toggle OFF: Remove from symptoms list and remove ALL occurrences from timeline for today
        newSymptoms = currentLog.symptoms.filter(id => id !== symptomId);
        newTimeline = newTimeline.filter(event => event.id !== symptomId);
      } else {
        // Toggle ON: Add to symptoms list and add event to timeline
        newSymptoms = [...currentLog.symptoms, symptomId];
        newTimeline.push({ id: symptomId, timestamp: Date.now() });
      }
      
      newLog = { ...currentLog, symptoms: newSymptoms, timeline: newTimeline };
    } else {
      // Create new log if none exists
      newLog = {
        date: today,
        mood: 'normal',
        symptoms: [symptomId],
        medicationTaken: false,
        notes: '',
        timestamp: Date.now(),
        timeline: [{ id: symptomId, timestamp: Date.now() }]
      };
    }
    handleSaveLog(newLog);
  };

  const toggleTheme = () => {
    const newTheme = state.profile.theme === 'light' ? 'dark' : 'light';
    const newState = saveProfile({ ...state.profile, theme: newTheme });
    setState(newState);
  };

  // Notification Handlers
  const toggleNotifications = async () => {
    const currentEnabled = state.profile.notifications?.enabled ?? false;
    const isEnabled = !currentEnabled;
    
    if (isEnabled && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('Precisamos da sua permissão para enviar lembretes.');
        return;
      }
    }

    const newProfile = {
      ...state.profile,
      notifications: {
        ...INITIAL_PROFILE.notifications, // Ensure structure exists
        ...state.profile.notifications, // Merge existing settings
        enabled: isEnabled
      }
    };
    const newState = saveProfile(newProfile);
    setState(newState);
  };

  const updateNotificationTime = (time: string) => {
    const newProfile = {
      ...state.profile,
      notifications: {
        ...INITIAL_PROFILE.notifications,
        ...state.profile.notifications,
        dailyTime: time
      }
    };
    const newState = saveProfile(newProfile);
    setState(newState);
  };

  const updateReminderType = (type: keyof typeof state.profile.notifications.reminderTypes, value: boolean) => {
    const currentNotifications = state.profile.notifications || INITIAL_PROFILE.notifications;
    
    const newProfile = {
      ...state.profile,
      notifications: {
        ...currentNotifications,
        reminderTypes: {
          ...currentNotifications.reminderTypes,
          [type]: value
        }
      }
    };
    const newState = saveProfile(newProfile);
    setState(newState);
  };

  const updateProfileData = (field: string, value: any) => {
    const newProfile = {
      ...state.profile,
      [field]: value
    };
    const newState = saveProfile(newProfile);
    setState(newState);
  }

  const DisclaimerFooter = () => (
    <div className="mt-8 mb-4 text-center space-y-2">
      <p className="text-xs text-stone-400 dark:text-stone-500">
        ℹ️ Este registro é pessoal e não substitui avaliação médica profissional.
      </p>
      <p className="text-[10px] text-stone-300 dark:text-stone-600 font-medium">
        Cláudio Sityá 2026
      </p>
    </div>
  );

  // Onboarding Flow
  if (!state.profile.isOnboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // Safe access helper for settings UI
  const notifSettings = state.profile.notifications || INITIAL_PROFILE.notifications;

  // Helper to render content based on tabs
  const renderContent = () => {
    switch (activeTab) {
      case Tab.HOME:
        const todayLog = state.logs[today];
        return (
          <div className="space-y-6 animate-fade-in pb-20">
            {/* Header */}
            <header className="flex justify-between items-end">
              <div>
                <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Olá, {state.profile.name.split(' ')[0]}</h1>
                <p className="text-stone-500 dark:text-stone-400">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              </div>
              <div 
                className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900 text-rose-500 dark:text-rose-300 flex items-center justify-center font-bold border-2 border-white dark:border-stone-800 shadow-sm cursor-pointer"
                onClick={() => setActiveTab(Tab.SETTINGS)}
              >
                {state.profile.name.charAt(0)}
              </div>
            </header>

            {/* Main Action */}
            {!todayLog ? (
              <div className="bg-gradient-to-r from-rose-400 to-rose-500 rounded-2xl p-6 text-white shadow-lg shadow-rose-200 dark:shadow-none">
                <h2 className="text-xl font-bold mb-2">Como você está hoje?</h2>
                <p className="mb-4 text-rose-50">Registre seus sintomas e ajude a identificar padrões.</p>
                <button 
                  onClick={() => handleOpenCheckIn(today)}
                  className="bg-white text-rose-500 px-5 py-2 rounded-xl font-bold hover:bg-rose-50 transition-colors w-full"
                >
                  Fazer Check-in
                </button>
              </div>
            ) : (
              <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-900/50 rounded-2xl p-6 text-teal-800 dark:text-teal-200">
                <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
                  <span className="w-2 h-2 bg-teal-500 rounded-full"/> Check-in realizado!
                </h2>
                <p className="text-sm text-teal-600 dark:text-teal-400 mb-3">Você registrou {todayLog.symptoms.length} sintomas hoje.</p>
                <button 
                   onClick={() => handleOpenCheckIn(today)}
                   className="text-sm underline font-medium hover:text-teal-900 dark:hover:text-teal-100"
                >
                  Editar registro
                </button>
              </div>
            )}

            {/* Quick Symptoms Grid */}
            <div>
              <h3 className="font-bold text-stone-700 dark:text-stone-200 mb-3 px-1 flex items-center justify-between">
                <span>Registro Rápido</span>
                <span className="text-[10px] bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-300 px-2 py-0.5 rounded-full uppercase tracking-wider">Comuns</span>
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {quickSymptoms.map(s => {
                  const isActive = state.logs[today]?.symptoms.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleQuickSymptom(s.id)}
                      className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-200 border ${
                        isActive 
                          ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-200 dark:shadow-none transform scale-105'
                          : 'bg-white dark:bg-stone-800 border-stone-100 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-700'
                      }`}
                    >
                      {s.icon}
                      <span className="text-xs font-bold">{s.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Timeline */}
            {todayLog?.timeline && todayLog.timeline.length > 0 && (
              <div className="mb-2">
                <h3 className="font-bold text-stone-700 dark:text-stone-200 mb-3 px-1 text-sm">Linha do Tempo (Hoje)</h3>
                <div className="relative h-16 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
                  <div className="absolute inset-0 flex justify-between px-2 pt-1 z-0">
                      <span className="text-[10px] text-stone-400">00h</span>
                      <span className="text-[10px] text-stone-400">12h</span>
                      <span className="text-[10px] text-stone-400">24h</span>
                  </div>
                  <div className="absolute top-8 left-3 right-3 h-0.5 bg-stone-200 dark:bg-stone-600 rounded"></div>
                  
                  {todayLog.timeline.map((event, idx) => {
                      // Calculate position based on time of day (0-24h)
                      const now = new Date();
                      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
                      // If timestamp is not today, it might look weird, but assuming quick log is for today.
                      // Clamp between 0% and 100%
                      const position = Math.max(0, Math.min(100, ((event.timestamp - startOfDay) / (24 * 60 * 60 * 1000)) * 100));
                      
                      const symptom = quickSymptoms.find(s => s.id === event.id) || { icon: <div className="w-2 h-2 bg-rose-500 rounded-full"/>, label: '' };

                      return (
                          <div 
                            key={idx}
                            className="absolute top-5 transform -translate-x-1/2 flex flex-col items-center group cursor-pointer z-10"
                            style={{ left: `${position}%` }}
                            title={`${new Date(event.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${symptom.label || event.id}`}
                          >
                            <div className="p-1.5 bg-white dark:bg-stone-700 rounded-full shadow-sm border border-rose-200 dark:border-rose-900/50 hover:scale-125 transition-transform">
                                {React.cloneElement(symptom.icon as React.ReactElement, { className: "w-3 h-3 text-rose-500" })}
                            </div>
                          </div>
                      );
                  })}
                </div>
              </div>
            )}

            {/* Mini Dashboard Preview */}
            <Dashboard state={state} />

             {/* Quick Links */}
             <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setActiveTab(Tab.REPORT)} className="bg-white dark:bg-stone-800 p-4 rounded-xl shadow-sm border border-stone-100 dark:border-stone-700 text-left hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors">
                  <FileText className="w-6 h-6 text-stone-400 dark:text-stone-500 mb-2" />
                  <span className="font-bold text-stone-700 dark:text-stone-200 block">Relatório</span>
                  <span className="text-xs text-stone-400 dark:text-stone-500">Para seu médico</span>
                </button>
                <button onClick={() => setActiveTab(Tab.LEARN)} className="bg-white dark:bg-stone-800 p-4 rounded-xl shadow-sm border border-stone-100 dark:border-stone-700 text-left hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors">
                  <BookOpen className="w-6 h-6 text-stone-400 dark:text-stone-500 mb-2" />
                  <span className="font-bold text-stone-700 dark:text-stone-200 block">Aprender</span>
                  <span className="text-xs text-stone-400 dark:text-stone-500">Biblioteca</span>
                </button>
             </div>
             
             <DisclaimerFooter />
          </div>
        );

      case Tab.HISTORY:
        return (
          <div className="animate-fade-in pb-20">
            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-6">Seu Histórico</h2>
            <div className="mb-8">
              <Calendar 
                logs={state.logs} 
                onDateSelect={handleOpenCheckIn} 
              />
            </div>
            
            <h3 className="font-bold text-stone-700 dark:text-stone-300 mb-4 px-1">Resumo de Sintomas</h3>
            <Dashboard state={state} />
            
            <DisclaimerFooter />
          </div>
        );

      case Tab.LEARN:
        return (
          <div className="animate-fade-in pb-20">
            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-6">Biblioteca</h2>
            <div className="space-y-4">
              {EDUCATION_CONTENT.map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-stone-800 p-5 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-700 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-stone-50 dark:bg-stone-700 rounded-lg">{item.icon}</div>
                    <h3 className="font-bold text-stone-800 dark:text-stone-100 text-lg">{item.title}</h3>
                  </div>
                  <p className="text-stone-600 dark:text-stone-300 leading-relaxed">{item.content}</p>
                  {(item as any).sourceUrl && (
                    <a 
                      href={(item as any).sourceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-4 text-sm font-bold text-teal-600 dark:text-teal-400 hover:underline"
                    >
                      Ler mais na fonte oficial <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-blue-800 dark:text-blue-200 text-sm text-center">
              💡 Este conteúdo é informativo e não substitui aconselhamento médico.
            </div>
            <DisclaimerFooter />
          </div>
        );

      case Tab.REPORT:
        return (
          <div className="animate-fade-in pb-20">
            <Report state={state} />
          </div>
        );

      case Tab.CHAT:
        return (
          <div className="animate-fade-in pb-20 h-full">
            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-4">Especialista Virtual</h2>
            <div className="h-full bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
               <Chat state={state} />
            </div>
          </div>
        );
      
      case Tab.SETTINGS:
        return (
          <div className="animate-fade-in pb-20 space-y-6">
            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-6">Configurações</h2>
            
            {/* Theme Toggle */}
            <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
               <div className="w-full p-4 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   {state.profile.theme === 'dark' ? <Moon className="text-purple-400" /> : <Sun className="text-orange-400" />}
                   <div>
                      <p className="font-medium text-stone-700 dark:text-stone-200">Modo Escuro</p>
                      <p className="text-xs text-stone-400 dark:text-stone-500">Alternar aparência</p>
                   </div>
                 </div>
                 <button 
                    onClick={toggleTheme}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${state.profile.theme === 'dark' ? 'bg-rose-500' : 'bg-stone-300 dark:bg-stone-600'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm ${state.profile.theme === 'dark' ? 'translate-x-6' : ''}`} />
                  </button>
               </div>
            </div>

            {/* Smart Notifications Config */}
            <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
               <div className="p-4 border-b border-stone-100 dark:border-stone-700">
                 <div className="flex items-center gap-2">
                   <Bell className="w-5 h-5 text-rose-500" />
                   <div>
                     <p className="font-bold text-stone-700 dark:text-stone-200">Notificações Inteligentes</p>
                     <p className="text-xs text-stone-500">Gerenciar lembretes</p>
                   </div>
                 </div>
               </div>
               
               <div className="p-4 space-y-5">
                 {/* Master Toggle */}
                 <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Ativar Notificações</span>
                    <button 
                      onClick={toggleNotifications}
                      className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${notifSettings.enabled ? 'bg-teal-500' : 'bg-stone-300 dark:bg-stone-600'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm ${notifSettings.enabled ? 'translate-x-6' : ''}`} />
                    </button>
                 </div>

                 {notifSettings.enabled && (
                   <div className="animate-fade-in space-y-5 pt-2 border-t border-stone-100 dark:border-stone-700">
                     {/* Time Picker */}
                     <label className="block">
                       <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-2">Horário do Check-in</span>
                       <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-stone-400" />
                          <input 
                            type="time" 
                            value={notifSettings.dailyTime}
                            onChange={(e) => updateNotificationTime(e.target.value)}
                            className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg p-2 text-sm text-stone-800 dark:text-stone-200 focus:ring-rose-500 focus:border-rose-500"
                          />
                       </div>
                     </label>

                     {/* Smart Toggles */}
                     <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-stone-50 dark:bg-stone-900/50">
                          <div className="flex items-center gap-3">
                             <CalendarIcon className="w-4 h-4 text-teal-500" />
                             <div>
                               <p className="text-sm font-medium text-stone-700 dark:text-stone-200">Lembrete Diário</p>
                               <p className="text-xs text-stone-400">Para registrar sintomas</p>
                             </div>
                          </div>
                          <button onClick={() => updateReminderType('daily', !notifSettings.reminderTypes.daily)} className={`w-5 h-5 rounded border flex items-center justify-center ${notifSettings.reminderTypes.daily ? 'bg-teal-500 border-teal-500' : 'border-stone-300 dark:border-stone-600'}`}>
                              {notifSettings.reminderTypes.daily && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-stone-50 dark:bg-stone-900/50">
                          <div className="flex items-center gap-3">
                             <Brain className="w-4 h-4 text-purple-500" />
                             <div>
                               <p className="text-sm font-medium text-stone-700 dark:text-stone-200">Resgate de Hábito</p>
                               <p className="text-xs text-stone-400">Lembrar após 3 dias ausente</p>
                             </div>
                          </div>
                          <button onClick={() => updateReminderType('inactivity', !notifSettings.reminderTypes.inactivity)} className={`w-5 h-5 rounded border flex items-center justify-center ${notifSettings.reminderTypes.inactivity ? 'bg-teal-500 border-teal-500' : 'border-stone-300 dark:border-stone-600'}`}>
                              {notifSettings.reminderTypes.inactivity && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </button>
                        </div>

                        {state.profile.hrtStatus !== 'none' && (
                          <div className="flex items-center justify-between p-3 rounded-lg bg-stone-50 dark:bg-stone-900/50">
                            <div className="flex items-center gap-3">
                               <PlusCircle className="w-4 h-4 text-rose-500" />
                               <div>
                                 <p className="text-sm font-medium text-stone-700 dark:text-stone-200">Check de Medicação</p>
                                 <p className="text-xs text-stone-400">Acompanhar efeitos pós-uso</p>
                               </div>
                            </div>
                            <button onClick={() => updateReminderType('medicationCheck', !notifSettings.reminderTypes.medicationCheck)} className={`w-5 h-5 rounded border flex items-center justify-center ${notifSettings.reminderTypes.medicationCheck ? 'bg-teal-500 border-teal-500' : 'border-stone-300 dark:border-stone-600'}`}>
                                {notifSettings.reminderTypes.medicationCheck && <CheckCircle2 className="w-3 h-3 text-white" />}
                            </button>
                          </div>
                        )}
                     </div>
                   </div>
                 )}
               </div>
            </div>

            <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
               <div className="p-4 border-b border-stone-100 dark:border-stone-700">
                 <p className="font-bold text-stone-700 dark:text-stone-200">Seus Dados</p>
                 <p className="text-sm text-stone-500">Configurações clínicas</p>
               </div>
               <div className="p-4 space-y-4">
                 <div className="bg-stone-50 dark:bg-stone-900/50 p-3 rounded-lg text-sm text-stone-600 dark:text-stone-300 space-y-1">
                   <p><span className="font-bold">Nome:</span> {state.profile.name}</p>
                 </div>

                 {/* HRT Configuration */}
                 <div className="space-y-3">
                   <label className="block text-sm font-medium text-stone-700 dark:text-stone-200">Terapia Hormonal (TRH)</label>
                   <select 
                      value={state.profile.hrtStatus}
                      onChange={(e) => updateProfileData('hrtStatus', e.target.value)}
                      className="w-full rounded-lg border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-900/50 p-2.5 text-sm dark:text-white"
                   >
                     <option value="none">Não faço uso</option>
                     <option value="systemic">Sistêmica (Gel/Pílula/Adesivo)</option>
                     <option value="local">Local (Creme vaginal)</option>
                     <option value="phyto">Fitoterápicos</option>
                   </select>

                   {state.profile.hrtStatus !== 'none' && (
                     <div className="animate-fade-in pl-2 border-l-2 border-rose-500 ml-1">
                       <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 mb-1">Início do tratamento</label>
                       <div className="relative">
                          <input 
                            type="date"
                            value={state.profile.hrtStartDate || ''}
                            onChange={(e) => updateProfileData('hrtStartDate', e.target.value)}
                            className="w-full rounded-lg border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-900/50 p-2 text-sm dark:text-white"
                          />
                          <p className="text-[10px] text-stone-400 mt-1">Usado para comparar seus sintomas antes e depois.</p>
                       </div>
                     </div>
                   )}
                 </div>
               </div>
            </div>

            <div className="pt-10">
              <button 
                onClick={() => { if(confirm('Tem certeza? Isso apagará tudo.')) clearData(); }}
                className="flex items-center gap-2 text-red-500 font-medium px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" /> Resetar e Apagar Dados
              </button>
            </div>
            <DisclaimerFooter />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 font-sans text-stone-900 dark:text-stone-100 transition-colors duration-200">
      
      {/* Main Container */}
      <main className="max-w-lg mx-auto min-h-screen bg-white dark:bg-stone-900 shadow-2xl relative transition-colors duration-200">
        <div className="p-6 h-full overflow-y-auto">
          {renderContent()}
        </div>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 pb-safe pt-2 px-3 max-w-lg mx-auto z-10 print:hidden transition-colors duration-200">
          <div className="flex justify-between items-center h-16">
            <button 
              onClick={() => setActiveTab(Tab.HOME)}
              className={`flex flex-col items-center gap-1 flex-1 ${activeTab === Tab.HOME ? 'text-rose-500' : 'text-stone-400 dark:text-stone-500'}`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[9px] font-bold">Hoje</span>
            </button>
            
            <button 
              onClick={() => setActiveTab(Tab.HISTORY)}
              className={`flex flex-col items-center gap-1 flex-1 ${activeTab === Tab.HISTORY ? 'text-rose-500' : 'text-stone-400 dark:text-stone-500'}`}
            >
              <BarChart2 className="w-5 h-5" />
              <span className="text-[9px] font-bold">Histórico</span>
            </button>

            <button 
              onClick={() => setActiveTab(Tab.LEARN)}
              className={`flex flex-col items-center gap-1 flex-1 ${activeTab === Tab.LEARN ? 'text-rose-500' : 'text-stone-400 dark:text-stone-500'}`}
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-[9px] font-bold">Aprender</span>
            </button>

            {/* Floating FAB for Quick Add */}
            <div className="relative -top-6 px-1">
              <button 
                onClick={() => handleOpenCheckIn(today)}
                className="w-14 h-14 rounded-full bg-rose-500 text-white shadow-lg shadow-rose-200 dark:shadow-rose-900/30 flex items-center justify-center transform transition-transform active:scale-90 hover:bg-rose-600"
              >
                <PlusCircle className="w-8 h-8" />
              </button>
            </div>

            <button 
              onClick={() => setActiveTab(Tab.CHAT)}
              className={`flex flex-col items-center gap-1 flex-1 ${activeTab === Tab.CHAT ? 'text-rose-500' : 'text-stone-400 dark:text-stone-500'}`}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-[9px] font-bold">Chat</span>
            </button>

            <button 
              onClick={() => setActiveTab(Tab.SETTINGS)}
              className={`flex flex-col items-center gap-1 flex-1 ${activeTab === Tab.SETTINGS ? 'text-rose-500' : 'text-stone-400 dark:text-stone-500'}`}
            >
              <Settings className="w-5 h-5" />
              <span className="text-[9px] font-bold">Ajustes</span>
            </button>
          </div>
        </nav>
      </main>

      {/* Check-In Modal Overlay */}
      {showCheckInModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-stone-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl h-[90vh] sm:h-auto sm:max-h-[85vh] overflow-y-auto relative animate-slide-up shadow-2xl">
            <div className="sticky top-0 bg-white/95 dark:bg-stone-900/95 backdrop-blur z-10 border-b border-stone-100 dark:border-stone-800 p-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100">
                {selectedDate === today ? 'Novo Registro' : `Editando: ${new Date(selectedDate).toLocaleDateString('pt-BR')}`}
              </h2>
              <button onClick={() => setShowCheckInModal(false)} className="p-2 bg-stone-100 dark:bg-stone-800 rounded-full hover:bg-stone-200 dark:hover:bg-stone-700">
                <X className="w-5 h-5 text-stone-600 dark:text-stone-400" />
              </button>
            </div>
            <div className="p-4">
              <DailyCheckIn 
                date={selectedDate} 
                existingLog={state.logs[selectedDate]} 
                onSave={handleSaveLog} 
              />
            </div>
          </div>
        </div>
      )}
      
      {/* CSS for animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
      `}</style>
    </div>
  );
};