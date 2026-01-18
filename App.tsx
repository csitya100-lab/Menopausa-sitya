import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { loadState, saveLog, saveProfile, clearData } from './services/storage';
import { AppState, DailyLog, Tab } from './types';
import { Onboarding } from './components/Onboarding';
import { DailyCheckIn } from './components/DailyCheckIn';
import { Dashboard } from './components/Dashboard';
import { Report } from './components/Report';
import { EDUCATION_CONTENT } from './constants';
import { Home, BookOpen, BarChart2, FileText, Settings, PlusCircle, X, LogOut, ChevronRight, Moon, Sun } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(loadState());
  const [activeTab, setActiveTab] = useState<Tab>(Tab.HOME);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  
  // Today's date YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Basic permissions logic for notifications (User request)
    if ('Notification' in window && Notification.permission === 'default') {
      // We don't force it, accessible via settings
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

  const toggleTheme = () => {
    const newTheme = state.profile.theme === 'light' ? 'dark' : 'light';
    const newState = saveProfile({ ...state.profile, theme: newTheme });
    setState(newState);
  };

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
                  onClick={() => setShowCheckInModal(true)}
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
                   onClick={() => setShowCheckInModal(true)}
                   className="text-sm underline font-medium hover:text-teal-900 dark:hover:text-teal-100"
                >
                  Editar registro
                </button>
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
            <Dashboard state={state} />
            <div className="mt-8">
              <h3 className="font-bold text-stone-700 dark:text-stone-300 mb-4">Registros Anteriores</h3>
              <div className="space-y-3">
                 {(Object.values(state.logs) as DailyLog[])
                   .sort((a,b) => b.date.localeCompare(a.date))
                   .map(log => (
                     <div key={log.date} className="bg-white dark:bg-stone-800 p-4 rounded-xl border border-stone-100 dark:border-stone-700 flex justify-between items-center">
                        <div>
                          <div className="font-bold text-stone-800 dark:text-stone-200">{new Date(log.date).toLocaleDateString('pt-BR')}</div>
                          <div className="text-xs text-stone-500 dark:text-stone-400 capitalize">{log.mood} • {log.symptoms.length} sintomas</div>
                        </div>
                        <button 
                          onClick={() => { setShowCheckInModal(true); /* Logic to edit past would go here, simplified for now to just today */ }}
                          className="text-stone-300 dark:text-stone-600 hover:text-rose-500 dark:hover:text-rose-400"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                     </div>
                   ))}
              </div>
            </div>
            <DisclaimerFooter />
          </div>
        );

      case Tab.LEARN:
        return (
          <div className="animate-fade-in pb-20">
            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-6">Biblioteca</h2>
            <div className="space-y-4">
              {EDUCATION_CONTENT.map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-stone-800 p-5 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-700 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-stone-50 dark:bg-stone-700 rounded-lg">{item.icon}</div>
                    <h3 className="font-bold text-stone-800 dark:text-stone-100 text-lg">{item.title}</h3>
                  </div>
                  <p className="text-stone-600 dark:text-stone-300 leading-relaxed">{item.content}</p>
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

            <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
               <div className="p-4 border-b border-stone-100 dark:border-stone-700">
                 <p className="font-bold text-stone-700 dark:text-stone-200">Seus Dados</p>
                 <p className="text-sm text-stone-500">Editável no perfil completo</p>
               </div>
               <div className="p-4 bg-stone-50 dark:bg-stone-900/50 text-sm text-stone-600 dark:text-stone-300 space-y-2">
                 <p>Nome: {state.profile.name}</p>
                 <p>Terapia: {state.profile.hrtStatus}</p>
               </div>
            </div>

            <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
               <button 
                  className="w-full p-4 text-left hover:bg-stone-50 dark:hover:bg-stone-700/50 flex items-center justify-between"
                  onClick={() => {
                    if ('Notification' in window) {
                      Notification.requestPermission().then(p => {
                        if(p === 'granted') alert('Lembretes ativados! (Simulação)');
                      });
                    }
                  }}
               >
                 <span className="font-medium text-stone-700 dark:text-stone-200">Ativar Lembretes Diários</span>
                 <span className="text-rose-500 text-sm font-bold">Configurar</span>
               </button>
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
                onClick={() => setShowCheckInModal(true)}
                className="w-14 h-14 rounded-full bg-rose-500 text-white shadow-lg shadow-rose-200 dark:shadow-rose-900/30 flex items-center justify-center transform transition-transform active:scale-90 hover:bg-rose-600"
              >
                <PlusCircle className="w-8 h-8" />
              </button>
            </div>

            <button 
              onClick={() => setActiveTab(Tab.REPORT)}
              className={`flex flex-col items-center gap-1 flex-1 ${activeTab === Tab.REPORT ? 'text-rose-500' : 'text-stone-400 dark:text-stone-500'}`}
            >
              <FileText className="w-5 h-5" />
              <span className="text-[9px] font-bold">Relatório</span>
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
              <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100">Novo Registro</h2>
              <button onClick={() => setShowCheckInModal(false)} className="p-2 bg-stone-100 dark:bg-stone-800 rounded-full hover:bg-stone-200 dark:hover:bg-stone-700">
                <X className="w-5 h-5 text-stone-600 dark:text-stone-400" />
              </button>
            </div>
            <div className="p-4">
              <DailyCheckIn 
                date={today} 
                existingLog={state.logs[today]} 
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

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');
const root = createRoot(rootElement);
root.render(<App />);