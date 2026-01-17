import React, { useState } from 'react';
import { AppState, DailyLog, Tab } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Calendar as CalendarIcon, Activity, Brain } from 'lucide-react';
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

  if (logs.length === 0) {
    return (
      <div className="text-center p-10 text-stone-500">
        <Activity className="w-12 h-12 mx-auto mb-4 text-stone-300" />
        <p>Ainda não há registros. Faça seu primeiro check-in!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calendar View (Simplified) */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100">
        <div className="flex items-center gap-2 mb-4">
          <CalendarIcon className="text-rose-500 w-5 h-5" />
          <h3 className="font-bold text-stone-700">Visão Mensal</h3>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {['D','S','T','Q','Q','S','S'].map((d, i) => (
            <div key={i} className="text-xs text-center text-stone-400 font-bold">{d}</div>
          ))}
          {/* Render last 28 placeholders + actual data mapped roughly */}
          {Array.from({ length: 28 }).map((_, i) => {
             // Mocking calendar days for UI viz logic - in real app would use date-fns
             const dayLog = logs[logs.length - (28 - i)];
             return (
               <div key={i} className="aspect-square rounded-lg flex items-center justify-center relative bg-stone-50">
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
        <div className="flex gap-4 mt-4 text-xs justify-center text-stone-500">
           <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-teal-400"></div> Ótimo</span>
           <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-400"></div> Normal</span>
           <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Difícil</span>
        </div>
      </div>

      {/* Symptom Frequency Chart */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="text-teal-500 w-5 h-5" />
          <h3 className="font-bold text-stone-700">Intensidade dos Sintomas (14 dias)</h3>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="date" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: '#f5f5f4'}} />
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
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-2xl border border-indigo-100">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="text-indigo-500 w-6 h-6" />
          <h3 className="font-bold text-indigo-900">Coach Virtual</h3>
        </div>
        
        {!aiInsight ? (
          <div className="text-center py-2">
            <p className="text-indigo-700 text-sm mb-3">
              Analise seus padrões da última semana e receba uma dica personalizada.
            </p>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={generateInsight}
              disabled={aiLoading}
              className="bg-indigo-500 hover:bg-indigo-600 shadow-indigo-200 text-white w-full"
            >
              {aiLoading ? 'Pensando...' : '✨ Gerar Insight'}
            </Button>
          </div>
        ) : (
          <div className="animate-fade-in bg-white/60 p-4 rounded-xl">
             <p className="text-indigo-800 text-sm leading-relaxed italic">"{aiInsight}"</p>
             <button onClick={() => setAiInsight(null)} className="text-xs text-indigo-400 mt-2 underline">Novo insight</button>
          </div>
        )}
      </div>
    </div>
  );
};