import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Button } from './Button';
import { Heart, User, Calendar, Briefcase, ChevronRight, Activity, Users, Smile } from 'lucide-react';

interface Props {
  onComplete: (profile: UserProfile) => void;
}

export const Onboarding: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(0); // 0 = Intro, 1-5 = Questions, 6 = Finish
  const [data, setData] = useState<UserProfile>({
    name: '',
    age: 45,
    lastPeriodDate: '',
    surgicalHistory: [],
    maritalStatus: '',
    occupation: '',
    hrtStatus: 'none',
    menopausePerception: '',
    supportNetwork: 'partial',
    bodyImageFeeling: '',
    goals: [],
    isOnboarded: false,
    theme: 'light',
  });

  const update = (field: keyof UserProfile, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const next = () => {
    window.scrollTo(0, 0);
    setStep(p => p + 1);
  };
  const back = () => setStep(p => p - 1);

  const finish = () => {
    onComplete({ ...data, isOnboarded: true });
  };

  const toggleSurgery = (val: string) => {
    const current = new Set(data.surgicalHistory);
    if (current.has(val)) current.delete(val);
    else current.add(val);
    update('surgicalHistory', Array.from(current));
  };

  // Helper for progress bar
  const progress = Math.min((step / 5) * 100, 100);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col justify-center items-center px-4 py-8 transition-colors duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-stone-900 sm:shadow-xl sm:rounded-3xl p-6 sm:p-10 transition-all min-h-[500px] flex flex-col">
        
        {/* Progress Bar (Visible on steps 1-5) */}
        {step > 0 && step < 6 && (
          <div className="mb-8">
            <div className="flex justify-between text-xs text-stone-400 dark:text-stone-500 font-bold mb-2 uppercase tracking-wider">
              <span>Passo {step} de 5</span>
              <span>Schiavo Model</span>
            </div>
            <div className="h-2 w-full bg-stone-100 dark:bg-stone-800 rounded-full">
              <div 
                className="h-2 bg-rose-500 rounded-full transition-all duration-500" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col justify-center">
          
          {/* STEP 0: Welcome & Name */}
          {step === 0 && (
            <div className="space-y-6 animate-fade-in text-center">
              <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-rose-500 dark:text-rose-300 w-10 h-10" />
              </div>
              <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100">Bem-vinda.</h1>
              <p className="text-lg text-stone-600 dark:text-stone-300">
                Este diário foi desenhado para entender você integralmente: corpo, mente e história.
              </p>
              <div className="pt-4 text-left">
                <label className="block">
                  <span className="text-stone-700 dark:text-stone-300 font-medium ml-1">Como você gostaria de ser chamada?</span>
                  <input 
                    type="text" 
                    className="mt-2 block w-full rounded-xl border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-4 shadow-sm focus:border-rose-500 focus:ring focus:ring-rose-200 dark:text-white"
                    value={data.name}
                    onChange={e => update('name', e.target.value)}
                    placeholder="Seu nome ou apelido"
                  />
                </label>
              </div>
              <Button onClick={next} disabled={!data.name} size="lg" className="w-full mt-4">
                Começar Jornada
              </Button>
            </div>
          )}

          {/* STEP 1: Biológico */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-rose-100 dark:bg-rose-900 rounded-lg text-rose-500 dark:text-rose-300"><Activity size={24} /></div>
                <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Biológico</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-stone-700 dark:text-stone-300 font-medium text-sm">Idade</span>
                  <input 
                    type="number" 
                    className="mt-1 block w-full rounded-xl border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-3 dark:text-white"
                    value={data.age}
                    onChange={e => update('age', parseInt(e.target.value))}
                  />
                </label>
                <label className="block">
                  <span className="text-stone-700 dark:text-stone-300 font-medium text-sm">Última Menstruação</span>
                  <input 
                    type="date" 
                    className="mt-1 block w-full rounded-xl border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-3 dark:text-white"
                    value={data.lastPeriodDate}
                    onChange={e => update('lastPeriodDate', e.target.value)}
                  />
                </label>
              </div>

              <div>
                <span className="text-stone-700 dark:text-stone-300 font-medium block mb-2">Histórico Cirúrgico</span>
                <div className="space-y-2">
                  {[
                    { val: 'hysterectomy', label: 'Histerectomia (Retirada do útero)' },
                    { val: 'oophorectomy', label: 'Ooforectomia (Retirada dos ovários)' },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => toggleSurgery(opt.val)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${
                        data.surgicalHistory.includes(opt.val)
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 font-medium' 
                        : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${data.surgicalHistory.includes(opt.val) ? 'bg-rose-500 border-rose-500' : 'border-stone-300 dark:border-stone-600'}`}>
                        {data.surgicalHistory.includes(opt.val) && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      {opt.label}
                    </button>
                  ))}
                  <button
                     onClick={() => update('surgicalHistory', [])}
                     className={`w-full text-left p-3 rounded-xl border transition-all ${
                       data.surgicalHistory.length === 0
                       ? 'border-stone-400 bg-stone-100 dark:bg-stone-700 dark:border-stone-600 text-stone-800 dark:text-stone-200' 
                       : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                     }`}
                  >
                    Nenhuma cirurgia reprodutiva
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Sociodemográfico */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg text-teal-500 dark:text-teal-300"><User size={24} /></div>
                <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Sociodemográfico</h2>
              </div>

              <label className="block">
                <span className="text-stone-700 dark:text-stone-300 font-medium">Estado Civil</span>
                <select 
                  className="mt-2 block w-full rounded-xl border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-3 dark:text-white"
                  value={data.maritalStatus}
                  onChange={e => update('maritalStatus', e.target.value)}
                >
                  <option value="">Selecione...</option>
                  <option value="single">Solteira</option>
                  <option value="married">Casada / União Estável</option>
                  <option value="divorced">Divorciada</option>
                  <option value="widow">Viúva</option>
                </select>
              </label>

              <label className="block">
                <span className="text-stone-700 dark:text-stone-300 font-medium">Ocupação Principal</span>
                <input 
                  type="text" 
                  className="mt-2 block w-full rounded-xl border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-3 dark:text-white"
                  value={data.occupation}
                  onChange={e => update('occupation', e.target.value)}
                  placeholder="Ex: Professora, Engenheira, Aposentada..."
                />
              </label>
            </div>
          )}

          {/* STEP 3: Contextual */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg text-orange-500 dark:text-orange-300"><Briefcase size={24} /></div>
                <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Contextual</h2>
              </div>

              <div className="block">
                <span className="text-stone-700 dark:text-stone-300 font-medium block mb-3">Você faz uso de Terapia Hormonal?</span>
                <div className="space-y-2">
                  {[
                    { val: 'none', label: 'Não faço uso' },
                    { val: 'systemic', label: 'Sim, Sistêmica (Pílula, Adesivo, Gel)' },
                    { val: 'local', label: 'Apenas Local (Creme vaginal)' },
                    { val: 'phyto', label: 'Fitoterápicos / Naturais' }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => update('hrtStatus', opt.val)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        data.hrtStatus === opt.val 
                        ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 shadow-sm' 
                        : 'border-stone-100 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:border-orange-200 dark:hover:border-orange-700'
                      }`}
                    >
                      <div className="font-bold text-sm">{opt.label.split('(')[0]}</div>
                      {opt.label.includes('(') && <div className="text-xs opacity-75">({opt.label.split('(')[1]}</div>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: História de Vida */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg text-purple-500 dark:text-purple-300"><Calendar size={24} /></div>
                <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">História de Vida</h2>
              </div>

              <div className="block">
                <span className="text-stone-700 dark:text-stone-300 font-medium block mb-3">Para você, a menopausa representa:</span>
                <div className="grid grid-cols-2 gap-3 mb-4">
                   {['Um fim', 'Uma doença', 'Algo natural', 'Um recomeço'].map(opt => (
                     <button
                        key={opt}
                        onClick={() => update('menopausePerception', opt)}
                        className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                          data.menopausePerception === opt
                          ? 'bg-purple-500 text-white border-purple-500'
                          : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-purple-300 dark:hover:border-purple-700'
                        }`}
                     >
                       {opt}
                     </button>
                   ))}
                </div>
                <textarea 
                   className="w-full rounded-xl border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-3 text-sm h-24 dark:text-white"
                   placeholder="Ou descreva com suas palavras como você vê essa fase..."
                   value={data.menopausePerception}
                   onChange={e => update('menopausePerception', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* STEP 5: Relações */}
          {step === 5 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-500 dark:text-blue-300"><Users size={24} /></div>
                <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Relações</h2>
              </div>

              <div>
                <span className="text-stone-700 dark:text-stone-300 font-medium block mb-3">Você conta com rede de apoio? (Família, amigos)</span>
                <div className="flex gap-2">
                  {[
                    { val: 'yes', label: 'Sim' },
                    { val: 'partial', label: 'Parcialmente' },
                    { val: 'no', label: 'Não' }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => update('supportNetwork', opt.val)}
                      className={`flex-1 p-3 rounded-xl border transition-all ${
                        data.supportNetwork === opt.val
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="text-stone-700 dark:text-stone-300 font-medium block mb-2">Como você se sente com as mudanças no seu corpo?</span>
                <textarea 
                  className="w-full rounded-xl border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-3 text-sm h-24 dark:text-white"
                  placeholder="Ex: Sinto-me estranha, ou estou me aceitando bem..."
                  value={data.bodyImageFeeling}
                  onChange={e => update('bodyImageFeeling', e.target.value)}
                />
              </label>
            </div>
          )}

          {/* STEP 6: Final */}
          {step === 6 && (
             <div className="space-y-6 animate-fade-in text-center">
             <div className="w-20 h-20 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mx-auto mb-4">
               <Smile className="text-teal-500 dark:text-teal-300 w-10 h-10" />
             </div>
             <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Perfil Completo!</h2>
             <p className="text-stone-600 dark:text-stone-300">
               Obrigada por compartilhar. Seus dados ajudarão a criar insights mais precisos para você.
             </p>
             
             <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl text-orange-800 dark:text-orange-200 text-sm mt-4">
               🔒 Seus dados ficam salvos apenas neste dispositivo.
             </div>
 
             <Button onClick={finish} variant="primary" size="lg" className="w-full mt-6">
               Ir para o Diário
             </Button>
           </div>
          )}

        </div>

        {/* Footer Navigation Buttons */}
        <div className="mt-8 pt-6 border-t border-stone-100 dark:border-stone-800">
          <div className="flex gap-3 mb-4">
            {step > 0 && step < 6 && (
              <Button onClick={back} variant="ghost" className="flex-1">
                Voltar
              </Button>
            )}
            {step > 0 && step < 6 && (
               <Button onClick={next} variant="primary" className="flex-[2]">
                 Próximo
               </Button>
            )}
          </div>
          <div className="text-center space-y-1">
            <p className="text-xs text-stone-400 dark:text-stone-500">
              ℹ️ Este registro é pessoal e não substitui avaliação médica profissional.
            </p>
            <p className="text-[10px] text-stone-300 dark:text-stone-600 font-medium">
              Cláudio Sityá 2026
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};