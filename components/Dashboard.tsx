import React, { useState } from 'react';
import { AppState, DailyLog, Tab } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Calendar as CalendarIcon, Activity, Brain, ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { Button } from './Button';
import { GoogleGenAI } from "@google/genai";

interface Props {
  state: AppState;
}

export const Dashboard: React.FC<Props> = ({ state }) => {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  const logs = (Object.values(state.logs) as DailyLog[]).sort((a, b) => a.date.localeCompare(b.date));
  const recentLogs = logs.slice(-14); // Last 14 entries

  // Prepare chart data: Count symptoms per day
  const chartData = recentLogs.map(log => ({
    date: log.date.slice(5), // MM-DD
    count: log.symptoms.length,
    mood: log.mood
  }));

  const getMoodColor = (mood: string) => {
    if (mood === 'great') return '#2dd4bf'; // teal-400
    if (mood === 'normal') return '#fbbf24'; // amber-400
    return '#f43f5e'; // rose-500
  };

  const generateInsight = async () => {
    if (!process.env.API_KEY) {
      alert("API Key not found. Please configure the environment.");
      return;
    }

    setAiLoading(true);
    setAiInsight(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Prepare a summary of the logs
      const summary = logs.slice(-7).map(l => 
        `Date: ${l.date}, Mood: ${l.mood}, Symptoms: ${l.symptoms.join(', ')}`
      ).join('\n');

      const prompt = `
      Atue como uma coach de saúde feminina especializada em climatério.
      Analise estes registros de 7 dias de uma mulher:
      ${summary}
      
      Forneça um parágrafo curto, acolhedor e motivacional (max 60 palavras).
      Identifique 1 padrão se houver (ex: piora do sono ou melhora do humor) e dê 1 dica prática e gentil.
      Não faça diagnósticos médicos. Use um tom empático (Coral/Turquesa vibe).
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setAiInsight(response.text || "Não foi possível gerar insight agora.");
    } catch (e) {
      console.error(e);
      setAiInsight("Ops! Não consegui conectar com a coach virtual. Tente mais tarde.");
    } finally {
      setAiLoading(false);
    }
  };

  // --- Comparison View Logic ---
  const renderComparisonView = () => {
    const { hrtStartDate, hrtStatus } = state.profile;
    
    // Only show if HRT is active AND a date is set
    if (hrtStatus === 'none' || !hrtStartDate) return null;

    const logsBefore = logs.filter(l => l.date < hrtStartDate);
    const logsAfter = logs.filter(l => l.date >= hrtStartDate);

    if (logsBefore.length === 0 || logsAfter.length === 0) {
      return (
        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 p-5 rounded-2xl border border-teal-100 dark:border-teal-900/50 mb-6">
           <h3 className="font-bold text-teal-800 dark:text-teal-200 mb-2">Impacto da Terapia</h3>
           <p className="text-sm text-teal-600 dark:text-teal-400">
             Continue registrando! Precisamos de dados "antes" e "durante" o tratamento ({new Date(hrtStartDate).toLocaleDateString('pt-BR')}) para comparar.
           </p>
        </div>
      );
    }

    // Helper: Calculate Hot Flash % frequency (days with hot flash / total days)
    const calcHotFlash = (dataset: DailyLog[]) => {
       const daysWithFlash = dataset.filter(l => l.symptoms.includes('hot_flash')).length;
       return Math.round((daysWithFlash / dataset.length) * 100);
    };

    // Helper: Calculate Sleep Quality (Days WITHOUT insomnia)
    const calcSleepQuality = (dataset: DailyLog[]) => {
       const daysWithInsomnia = dataset.filter(l => l.symptoms.includes('insomnia')).length;
       // Inverse: Days with good sleep
       const daysGoodSleep = dataset.length - daysWithInsomnia;
       return Math.round((daysGoodSleep / dataset.length) * 100);
    };

    const beforeFlash = calcHotFlash(logsBefore);
    const afterFlash = calcHotFlash(logsAfter);
    
    const beforeSleep = calcSleepQuality(logsBefore);
    const afterSleep = calcSleepQuality(logsAfter);

    // Render Metric Row
    const MetricRow = ({ label, before, after, inverse = false }: { label: string, before: number, after: number, inverse?: boolean }) => {
      const diff = after - before;
      const isImprovement = inverse ? diff < 0 : diff > 0;
      
      return (
        <div className="flex items-center justify-between py-3 border-b border-teal-100 dark:border-teal-800/30 last:border-0">
          <span className="text-sm font-medium text-stone-600 dark:text-stone-300 w-1/3">{label}</span>
          
          {/* Before */}
          <span className="text-sm font-bold text-stone-400 w-1/4 text-center">{before}%</span>
          
          {/* After */}
          <div className="w-1/4 flex items-center justify-center gap-1">
             <span className="text-sm font-bold text-stone-800 dark:text-stone-100">{after}%</span>
             {diff !== 0 ? (
                isImprovement 
                  ? <ArrowUp className={`w-3 h-3 ${inverse ? 'rotate-180 text-emerald-500' : 'text-emerald-500'}`} />
                  : <ArrowDown className={`w-3 h-3 ${inverse ? 'rotate-180 text-rose-500' : 'text-rose-500'}`} />
             ) : <Minus className="w-3 h-3 text-stone-300" />}
          </div>
        </div>
      );
    };

    return (
      <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 p-5 rounded-2xl border border-teal-100 dark:border-teal-900/50 mb-6">
         <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-teal-800 dark:text-teal-200">Impacto da Terapia</h3>
            <span className="text-[10px] bg-white dark:bg-teal-900 px-2 py-1 rounded-full text-teal-600 dark:text-teal-300 font-bold border border-teal-100 dark:border-teal-800">
               Desde {new Date(hrtStartDate).toLocaleDateString('pt-BR')}
            </span>
         </div>

         <div className="bg-white/60 dark:bg-stone-900/40 rounded-xl p-3">
            <div className="flex justify-between text-[10px] uppercase font-bold text-stone-400 mb-2 border-b border-stone-100 dark:border-stone-800 pb-1">
               <span className="w-1/3">Métrica</span>
               <span className="w-1/4 text-center">Antes</span>
               <span className="w-1/4 text-center">Com TRH</span>
            </div>
            
            <MetricRow label="Dias c/ Fogachos" before={beforeFlash} after={afterFlash} inverse={true} />
            <MetricRow label="Noites Bem Dormidas" before={beforeSleep} after={afterSleep} />
         </div>
      </div>
    );
  };

  if (logs.length === 0) {
    return (
      <div className="text-center p-10 text-stone-500 dark:text-stone-400">
        <Activity className="w-12 h-12 mx-auto mb-4 text-stone-300 dark:text-stone-600" />
        <p>Ainda não há registros. Faça seu primeiro check-in!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Comparison Dashboard (Conditional) */}
      {renderComparisonView()}

      {/* Calendar View (Simplified) */}
      <div className="bg-white dark:bg-stone-800 p-4 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-700">
        <div className="flex items-center gap-2 mb-4">
          <CalendarIcon className="text-rose-500 w-5 h-5" />
          <h3 className="font-bold text-stone-700 dark:text-stone-200">Visão Mensal</h3>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {['D','S','T','Q','Q','S','S'].map((d, i) => (
            <div key={i} className="text-xs text-center text-stone-400 dark:text-stone-500 font-bold">{d}</div>
          ))}
          {/* Render last 28 placeholders + actual data mapped roughly */}
          {Array.from({ length: 28 }).map((_, i) => {
             // Mocking calendar days for UI viz logic - in real app would use date-fns
             const dayLog = logs[logs.length - (28 - i)];
             return (
               <div key={i} className="aspect-square rounded-lg flex items-center justify-center relative bg-stone-50 dark:bg-stone-900/50">
                  {dayLog && (
                    <div 
                      className={`w-3/4 h-3/4 rounded-full flex items-center justify-center text-[10px] font-bold text-white
                        ${getMoodColor(dayLog.mood) === '#2dd4bf' ? 'bg-teal-400' : 
                          getMoodColor(dayLog.mood) === '#fbbf24' ? 'bg-amber-400' : 'bg-rose-500'}`}
                    >
                      {dayLog.date.split('-')[2]}
                    </div>
                  )}
               </div>
             )
          })}
        </div>
        <div className="flex gap-4 mt-4 text-xs justify-center text-stone-500 dark:text-stone-400">
           <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-teal-400"></div> Ótimo</span>
           <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-400"></div> Normal</span>
           <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Difícil</span>
        </div>
      </div>

      {/* Symptom Frequency Chart */}
      <div className="bg-white dark:bg-stone-800 p-4 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-700">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="text-teal-500 w-5 h-5" />
          <h3 className="font-bold text-stone-700 dark:text-stone-200">Intensidade dos Sintomas (14 dias)</h3>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="date" tick={{fontSize: 10, fill: '#a8a29e'}} axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: 'rgba(255,255,255,0.1)'}} contentStyle={{ backgroundColor: '#1c1917', border: 'none', color: '#fff', borderRadius: '8px' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getMoodColor(entry.mood)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Coach */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="text-indigo-500 dark:text-indigo-400 w-6 h-6" />
          <h3 className="font-bold text-indigo-900 dark:text-indigo-200">Coach Virtual</h3>
        </div>
        
        {!aiInsight ? (
          <div className="text-center py-2">
            <p className="text-indigo-700 dark:text-indigo-300 text-sm mb-3">
              Analise seus padrões da última semana e receba uma dica personalizada.
            </p>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={generateInsight}
              disabled={aiLoading}
              className="bg-indigo-500 hover:bg-indigo-600 shadow-indigo-200 dark:shadow-none text-white w-full border-none"
            >
              {aiLoading ? 'Pensando...' : '✨ Gerar Insight'}
            </Button>
          </div>
        ) : (
          <div className="animate-fade-in bg-white/60 dark:bg-stone-900/60 p-4 rounded-xl">
             <p className="text-indigo-800 dark:text-indigo-200 text-sm leading-relaxed italic">"{aiInsight}"</p>
             <button onClick={() => setAiInsight(null)} className="text-xs text-indigo-400 mt-2 underline">Novo insight</button>
          </div>
        )}
      </div>
    </div>
  );
};