import React from 'react';
import { AppState, DailyLog } from '../types';
import { Button } from './Button';
import { Printer, Share2 } from 'lucide-react';
import { SYMPTOMS_LIST } from '../constants';

interface Props {
  state: AppState;
}

export const Report: React.FC<Props> = ({ state }) => {
  const logs = Object.values(state.logs) as DailyLog[];
  
  // Stats
  const totalDays = logs.length;
  const moodCounts = logs.reduce((acc, log) => {
    acc[log.mood] = (acc[log.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const symptomCounts = logs.reduce((acc, log) => {
    log.symptoms.forEach(s => {
      acc[s] = (acc[s] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const topSymptoms = Object.entries(symptomCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => {
      const name = SYMPTOMS_LIST.find(s => s.id === id)?.name || id;
      return { name, count };
    });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 print:shadow-none print:border-none print:p-0">
        
        {/* Header - Report Only */}
        <div className="mb-8 border-b border-stone-200 pb-4">
          <h1 className="text-2xl font-bold text-stone-900">Relatório de Acompanhamento</h1>
          <p className="text-stone-500 text-sm">Gerado pelo app Diário de Menopausa</p>
        </div>

        {/* Profile */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-stone-400 uppercase">Nome</span>
            <p className="font-medium">{state.profile.name}</p>
          </div>
          <div>
            <span className="text-xs font-bold text-stone-400 uppercase">Idade</span>
            <p className="font-medium">{state.profile.age} anos</p>
          </div>
          <div>
            <span className="text-xs font-bold text-stone-400 uppercase">Última Menstruação</span>
            <p className="font-medium">{state.profile.lastPeriodDate || 'Não informado'}</p>
          </div>
          <div>
            <span className="text-xs font-bold text-stone-400 uppercase">Terapia Hormonal</span>
            <p className="font-medium capitalize">{state.profile.hrtStatus}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-teal-600 mb-3">Resumo do Período</h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-stone-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-stone-800">{totalDays}</div>
              <div className="text-xs text-stone-500">Dias Registrados</div>
            </div>
            <div className="bg-rose-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-rose-600">{moodCounts['hard'] || 0}</div>
              <div className="text-xs text-rose-800">Dias Difíceis</div>
            </div>
             <div className="bg-teal-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-teal-600">{moodCounts['great'] || 0}</div>
              <div className="text-xs text-teal-800">Dias Ótimos</div>
            </div>
          </div>
        </div>

        {/* Top Symptoms */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-teal-600 mb-3">Top 5 Sintomas Recorrentes</h3>
          <ul className="space-y-2">
            {topSymptoms.map((s, idx) => (
              <li key={idx} className="flex items-center justify-between border-b border-stone-100 py-2">
                <span className="text-stone-700">{s.name}</span>
                <span className="font-bold bg-stone-100 px-2 py-1 rounded text-stone-600 text-xs">
                  {s.count}x ({Math.round((s.count / totalDays) * 100)}%)
                </span>
              </li>
            ))}
            {topSymptoms.length === 0 && <p className="text-stone-400 italic">Sem dados suficientes.</p>}
          </ul>
        </div>

        {/* Recent Notes */}
        <div>
          <h3 className="text-lg font-bold text-teal-600 mb-3">Observações Recentes</h3>
          <div className="space-y-3">
            {logs.slice(-5).filter(l => l.notes).map(log => (
              <div key={log.date} className="text-sm">
                <span className="font-bold text-stone-400 mr-2">{log.date}:</span>
                <span className="text-stone-700 italic">"{log.notes}"</span>
              </div>
            ))}
          </div>
        </div>

        {/* Print Disclaimer */}
        <div className="mt-10 pt-4 border-t border-stone-200 text-xs text-stone-400 text-center print:block hidden">
          ℹ️ Este registro é pessoal e não substitui avaliação médica profissional.
        </div>
      </div>

      <div className="print:hidden flex flex-col gap-3">
        <Button onClick={handlePrint} variant="primary" size="lg">
          <Printer className="w-5 h-5" /> Imprimir / Salvar PDF
        </Button>
        <p className="text-center text-xs text-stone-400">
          Ao clicar em imprimir, escolha "Salvar como PDF" nas opções da sua impressora.
        </p>
        <p className="text-xs text-stone-400 text-center mt-4">
           ℹ️ Este registro é pessoal e não substitui avaliação médica profissional.
        </p>
      </div>
    </div>
  );
};