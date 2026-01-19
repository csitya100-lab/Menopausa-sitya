import React, { useMemo, useState, useEffect } from 'react';
import { AppState, DailyLog } from '../types';
import { Button } from './Button';
import { FileText, UserSquare2, Stethoscope, Download, Filter, Calendar, GitCompare, ChevronDown } from 'lucide-react';
import { SYMPTOMS_LIST } from '../constants';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, CartesianGrid, ScatterChart, Scatter, Label } from 'recharts';

interface Props {
  state: AppState;
}

export const Report: React.FC<Props> = ({ state }) => {
  const allLogs = useMemo(() => 
    (Object.values(state.logs) as DailyLog[]).sort((a, b) => a.date.localeCompare(b.date))
  , [state.logs]);

  // Date Range State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [preset, setPreset] = useState('last_30');

  // Correlation State
  const [corrMetric1, setCorrMetric1] = useState('hot_flash');
  const [corrMetric2, setCorrMetric2] = useState('mood_score');

  const getTodayStr = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  };

  const handlePresetChange = (value: string) => {
    setPreset(value);
    if (value === 'custom') return;

    const end = new Date();
    const start = new Date();
    
    // Reset hours to avoid timezone shifting issues on ISO conversion
    end.setHours(12,0,0,0);
    start.setHours(12,0,0,0);

    if (value === 'last_7') {
      start.setDate(end.getDate() - 6);
    } else if (value === 'last_30') {
      start.setDate(end.getDate() - 29);
    } else if (value === 'last_90') {
      start.setDate(end.getDate() - 89);
    } else if (value === 'all') {
      if (allLogs.length > 0) {
        setStartDate(allLogs[0].date);
        setEndDate(allLogs[allLogs.length - 1].date);
        return;
      } else {
        // Fallback if no logs
        start.setDate(end.getDate() - 30);
      }
    }

    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  };

  // Initialize with default preset if dates are empty
  useEffect(() => {
    if (allLogs.length > 0 && !startDate) {
       handlePresetChange('last_30');
    }
  }, [allLogs]);

  // Handle manual date changes
  const handleManualDateChange = (type: 'start' | 'end', value: string) => {
    setPreset('custom');
    if (type === 'start') setStartDate(value);
    else setEndDate(value);
  };

  // Filter Logic
  const logs = useMemo(() => {
    if (!startDate || !endDate) return allLogs;
    return allLogs.filter(log => log.date >= startDate && log.date <= endDate);
  }, [allLogs, startDate, endDate]);

  // Data Preparation for Charts
  const totalDays = logs.length;
  const formattedStart = startDate ? new Date(startDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-';
  const formattedEnd = endDate ? new Date(endDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-';

  // 1. Mood Trend Data
  const moodTrendData = logs.map(log => {
    let score = 50; // Normal
    if (log.mood === 'great') score = 90;
    if (log.mood === 'hard') score = 20;
    
    // Penalty for high symptom count (max penalty -30 to avoid going below 0 too easily)
    score -= Math.min(30, log.symptoms.length * 5);
    
    return {
      date: log.date.slice(5), // MM-DD
      score: Math.max(0, score), // Floor at 0
      symptoms: log.symptoms.length
    };
  });

  // 2. Symptom Frequency Data
  const symptomCounts = logs.reduce((acc, log) => {
    log.symptoms.forEach(s => {
      acc[s] = (acc[s] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const symptomData = Object.entries(symptomCounts)
    .map(([id, count]) => ({
      name: SYMPTOMS_LIST.find(s => s.id === id)?.name || id,
      count: count as number,
      intensity: ((count as number) / totalDays) * 100 // Percentage
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8); // Top 8

  // 3. Dummy Correlation Data
  const correlationData = useMemo(() => {
    // Generate simulated data points for visualization
    return Array.from({ length: 30 }, (_, i) => {
      let val1 = 0;
      let val2 = 0;
      
      const randInt = (max: number) => Math.floor(Math.random() * (max + 1));
      
      // Metric 1 Generation
      if (corrMetric1 === 'mood_score') {
        val1 = 40 + randInt(60); // 40-100
      } else {
        val1 = randInt(10); // 0-10 intensity
      }

      // Metric 2 Generation (Correlated to Metric 1)
      const noise = (Math.random() * 4) - 2; // +/- 2

      if (corrMetric2 === 'mood_score') {
        if (corrMetric1 === 'mood_score') {
           val2 = val1; 
        } else {
           // Symptom vs Mood (Negative Correlation)
           // High symptom (10) -> Low mood. Low symptom (0) -> High mood.
           // Map 0-10 to 100-40 roughly
           val2 = 90 - (val1 * 6) + (noise * 5);
        }
      } else {
         if (corrMetric1 === 'mood_score') {
            // Mood vs Symptom (Negative)
            // High mood (100) -> Low symptom.
            val2 = 10 - ((val1 - 20) / 8) + noise;
         } else {
            // Symptom vs Symptom (Positive - Comorbidity)
            val2 = val1 + noise;
         }
      }

      // Clamp values
      if (corrMetric2 === 'mood_score') val2 = Math.max(0, Math.min(100, val2));
      else val2 = Math.max(0, Math.min(10, val2));

      return { x: Math.round(val1), y: Math.round(val2) };
    });
  }, [corrMetric1, corrMetric2]);

  const corrOptions = [
    { value: 'mood_score', label: 'Bem-Estar (Humor)' },
    { value: 'hot_flash', label: 'Calores' },
    { value: 'insomnia', label: 'Insônia' },
    { value: 'anxiety', label: 'Ansiedade' },
    { value: 'fatigue', label: 'Fadiga' },
    { value: 'joint_pain', label: 'Dor Articular' },
  ];

  const handlePrint = () => {
    window.print();
  };

  if (allLogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center space-y-4">
        <FileText className="w-16 h-16 text-stone-300" />
        <h3 className="text-xl font-bold text-stone-600 dark:text-stone-300">Sem dados suficientes</h3>
        <p className="text-stone-500">Registre alguns dias no diário para gerar seu relatório clínico.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Action Bar (Screen Only) */}
      <div className="mb-6 space-y-4 no-print">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Relatório Clínico</h2>
            <p className="text-sm text-stone-500 dark:text-stone-400">Selecione o período para consulta médica.</p>
          </div>
          <Button onClick={handlePrint} variant="primary" className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Gerar PDF / Imprimir
          </Button>
        </div>

        {/* Date Filter Controls */}
        <div className="bg-white dark:bg-stone-800 p-4 rounded-xl border border-stone-200 dark:border-stone-700 flex flex-col md:flex-row gap-4 items-center">
           <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 shrink-0">
             <Filter className="w-4 h-4" />
             <span className="text-sm font-bold uppercase tracking-wider">Período:</span>
           </div>
           
           <div className="w-full md:w-auto">
             <div className="relative">
                <select 
                  value={preset}
                  onChange={(e) => handlePresetChange(e.target.value)}
                  className="w-full md:w-40 appearance-none bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-600 rounded-lg py-2 pl-3 pr-8 text-sm font-medium dark:text-white"
                >
                  <option value="last_7">Últimos 7 dias</option>
                  <option value="last_30">Últimos 30 dias</option>
                  <option value="last_90">Últimos 3 meses</option>
                  <option value="all">Todo o Período</option>
                  <option value="custom">Personalizado</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-2 top-2.5 text-stone-400 pointer-events-none" />
             </div>
           </div>

           <div className="flex items-center gap-2 w-full md:w-auto flex-1">
             <div className="relative flex-1">
               <input 
                 type="date" 
                 value={startDate}
                 onChange={(e) => handleManualDateChange('start', e.target.value)}
                 className="w-full pl-8 pr-2 py-2 text-sm border border-stone-300 dark:border-stone-600 rounded-lg bg-stone-50 dark:bg-stone-900 dark:text-white"
               />
               <Calendar className="w-4 h-4 absolute left-2 top-2.5 text-stone-400" />
             </div>
             <span className="text-stone-400 text-sm">até</span>
             <div className="relative flex-1">
               <input 
                 type="date" 
                 value={endDate}
                 onChange={(e) => handleManualDateChange('end', e.target.value)}
                 className="w-full pl-8 pr-2 py-2 text-sm border border-stone-300 dark:border-stone-600 rounded-lg bg-stone-50 dark:bg-stone-900 dark:text-white"
               />
               <Calendar className="w-4 h-4 absolute left-2 top-2.5 text-stone-400" />
             </div>
           </div>
           <div className="text-xs text-stone-400 whitespace-nowrap hidden sm:block">
             {totalDays} dias
           </div>
        </div>
      </div>

      {/* Report Document Container */}
      <div className="bg-white dark:bg-stone-800 p-8 sm:p-10 rounded-2xl shadow-lg border border-stone-100 dark:border-stone-700 print:shadow-none print:border-none print:p-0 print:w-full print:bg-white">
        
        {/* REPORT HEADER */}
        <header className="border-b-2 border-stone-800 dark:border-stone-200 pb-6 mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-50 uppercase tracking-tight">Relatório de Acompanhamento</h1>
            <p className="text-rose-500 font-medium mt-1">Saúde Hormonal e Climatério</p>
          </div>
          <div className="text-right text-sm text-stone-500 dark:text-stone-400">
            <p className="font-bold text-stone-900 dark:text-stone-100">Período Selecionado</p>
            <p>{formattedStart} a {formattedEnd}</p>
            <p className="mt-1 text-xs">Gerado em: {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </header>

        {/* PATIENT INFO GRID */}
        <section className="bg-stone-50 dark:bg-stone-900/50 p-6 rounded-xl mb-8 print:bg-transparent print:p-0 print:mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">Paciente</span>
              <p className="font-bold text-stone-800 dark:text-stone-200 text-lg">{state.profile.name}</p>
            </div>
            <div>
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">Idade</span>
              <p className="font-medium text-stone-700 dark:text-stone-300">{state.profile.age} anos</p>
            </div>
            <div>
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">Última Menstruação</span>
              <p className="font-medium text-stone-700 dark:text-stone-300">{state.profile.lastPeriodDate || 'Não informado'}</p>
            </div>
            <div>
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">Terapia Hormonal</span>
              <p className="font-medium text-stone-700 dark:text-stone-300 capitalize">{state.profile.hrtStatus === 'none' ? 'Não utiliza' : state.profile.hrtStatus}</p>
            </div>
          </div>
        </section>

        {/* CHART 1: WELL-BEING TREND */}
        <section className="mb-8 avoid-break">
          <div className="flex items-center gap-2 mb-4 border-b border-stone-100 dark:border-stone-700 pb-2">
            <Stethoscope className="w-5 h-5 text-rose-500" />
            <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100">Tendência de Bem-Estar</h2>
          </div>
          <p className="text-xs text-stone-500 mb-4 italic">O índice combina humor e quantidade de sintomas (Escala 0-100)</p>
          <div className="h-64 w-full bg-stone-50 dark:bg-stone-900/30 rounded-lg p-2 print:bg-white print:border print:border-stone-200">
            {logs.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={moodTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" strokeOpacity={0.5} />
                  <XAxis 
                    dataKey="date" 
                    tick={{fontSize: 10, fill: '#a8a29e'}} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={10}
                  />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                    cursor={{ stroke: '#f43f5e', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#f43f5e" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                    dot={{ r: 4, fill: '#f43f5e', stroke: '#fff', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#f43f5e', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
               <div className="h-full flex items-center justify-center text-stone-400 text-sm italic">Dados insuficientes para gráfico de tendência neste período.</div>
            )}
          </div>
        </section>

        {/* CHART 2: SYMPTOM FREQUENCY */}
        <section className="mb-8 avoid-break">
          <div className="flex items-center gap-2 mb-4 border-b border-stone-100 dark:border-stone-700 pb-2">
            <UserSquare2 className="w-5 h-5 text-teal-500" />
            <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100">Frequência de Sintomas ({totalDays} dias)</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Chart */}
            <div className="h-64 w-full">
               {symptomData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={symptomData} layout="vertical" margin={{left: 0}}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11, fill: '#78716c'}} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px' }} />
                    <Bar dataKey="count" fill="#2dd4bf" radius={[0, 4, 4, 0]} barSize={20}>
                      {symptomData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index < 3 ? '#f43f5e' : '#2dd4bf'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
               ) : (
                  <div className="h-full flex items-center justify-center text-stone-400 text-sm italic">Nenhum sintoma registrado neste período.</div>
               )}
            </div>

            {/* List */}
            <div className="text-sm">
              <h3 className="font-bold text-stone-700 dark:text-stone-200 mb-3 text-xs uppercase">Detalhes</h3>
              {symptomData.length > 0 ? (
                <ul className="space-y-2">
                  {symptomData.map((s, idx) => (
                    <li key={idx} className="flex justify-between items-center border-b border-stone-100 dark:border-stone-700 pb-1">
                      <span className="text-stone-600 dark:text-stone-300">{s.name}</span>
                      <span className="font-mono font-medium text-stone-900 dark:text-stone-100">{s.count}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-stone-400 italic">Tudo tranquilo por aqui.</p>
              )}
            </div>
          </div>
        </section>

        {/* CHART 3: CORRELATION ANALYSIS (NEW) */}
        <section className="mb-8 avoid-break">
           <div className="flex items-center gap-2 mb-4 border-b border-stone-100 dark:border-stone-700 pb-2">
            <GitCompare className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100">Análise de Correlação (Experimental)</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-4 bg-stone-50 dark:bg-stone-900/30 p-4 rounded-xl no-print">
             <div className="flex-1">
               <label className="text-xs font-bold text-stone-400 uppercase mb-1 block">Eixo X (Causa?)</label>
               <select 
                  value={corrMetric1}
                  onChange={(e) => setCorrMetric1(e.target.value)}
                  className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 rounded-lg p-2 text-sm dark:text-stone-200"
               >
                 {corrOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
               </select>
             </div>
             <div className="flex items-center justify-center pt-4">
                <span className="text-stone-400">vs</span>
             </div>
             <div className="flex-1">
               <label className="text-xs font-bold text-stone-400 uppercase mb-1 block">Eixo Y (Efeito?)</label>
               <select 
                  value={corrMetric2}
                  onChange={(e) => setCorrMetric2(e.target.value)}
                  className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 rounded-lg p-2 text-sm dark:text-stone-200"
               >
                 {corrOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
               </select>
             </div>
          </div>

          <div className="h-64 w-full bg-stone-50 dark:bg-stone-900/30 rounded-lg p-2 border border-stone-100 dark:border-stone-800">
             <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" strokeOpacity={0.5} />
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    name={corrOptions.find(o => o.value === corrMetric1)?.label} 
                    tick={{fontSize: 10, fill: '#a8a29e'}}
                    tickLine={false}
                    axisLine={false}
                  >
                    <Label value={corrOptions.find(o => o.value === corrMetric1)?.label} offset={0} position="insideBottom" style={{fontSize: 10, fill: '#78716c'}} />
                  </XAxis>
                  <YAxis 
                    type="number" 
                    dataKey="y" 
                    name={corrOptions.find(o => o.value === corrMetric2)?.label} 
                    tick={{fontSize: 10, fill: '#a8a29e'}}
                    tickLine={false}
                    axisLine={false}
                  >
                     <Label value={corrOptions.find(o => o.value === corrMetric2)?.label} angle={-90} position="insideLeft" style={{fontSize: 10, fill: '#78716c'}} />
                  </YAxis>
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }} 
                    content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                        return (
                            <div className="bg-stone-800 text-white text-xs p-2 rounded-lg shadow-xl">
                            <p>{`${payload[0].name}: ${payload[0].value}`}</p>
                            <p>{`${payload[1].name}: ${payload[1].value}`}</p>
                            </div>
                        );
                        }
                        return null;
                    }}
                  />
                  <Scatter name="Correlação" data={correlationData} fill="#8884d8">
                    {correlationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#f43f5e' : '#2dd4bf'} fillOpacity={0.6} />
                    ))}
                  </Scatter>
                </ScatterChart>
             </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-stone-400 mt-2 text-center italic">* Dados simulados para fins de demonstração.</p>
        </section>

        {/* NOTES LOG */}
        <section className="mb-8 avoid-break">
          <div className="flex items-center gap-2 mb-4 border-b border-stone-100 dark:border-stone-700 pb-2">
            <FileText className="w-5 h-5 text-stone-500" />
            <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100">Diário de Observações</h2>
          </div>
          <div className="space-y-3 bg-stone-50 dark:bg-stone-900/30 p-4 rounded-xl print:bg-transparent print:p-0">
            {logs.filter(l => l.notes).length > 0 ? (
              logs.filter(l => l.notes).map((log, i) => (
                <div key={i} className="text-sm pb-2 border-b border-stone-200 dark:border-stone-700 last:border-0 page-break-inside-avoid">
                  <span className="font-bold text-stone-900 dark:text-stone-100 mr-2">{new Date(log.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}:</span>
                  <span className="text-stone-600 dark:text-stone-300 italic">"{log.notes}"</span>
                </div>
              ))
            ) : (
              <p className="text-stone-400 italic">Nenhuma observação registrada neste período.</p>
            )}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-12 pt-6 border-t border-stone-200 dark:border-stone-700 text-center print:block">
          <div className="flex justify-center gap-12 mb-8 print:mb-4">
             <div className="w-48 border-t border-stone-400 pt-2">
                <p className="text-xs text-stone-500">Assinatura da Paciente</p>
             </div>
             <div className="w-48 border-t border-stone-400 pt-2">
                <p className="text-xs text-stone-500">Carimbo/Assinatura Médico</p>
             </div>
          </div>
          <p className="text-[10px] text-stone-400">
            Este relatório foi gerado automaticamente pelo app Diário de Menopausa. As informações contidas são registros pessoais da paciente e servem como ferramenta auxiliar de diagnóstico.
          </p>
          <p className="text-[10px] text-stone-300 font-bold mt-1">Cláudio Sityá 2026</p>
        </footer>

      </div>
    </div>
  );
};