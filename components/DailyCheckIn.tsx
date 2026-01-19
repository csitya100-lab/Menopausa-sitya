import React, { useState, useEffect } from 'react';
import { DailyLog, Mood } from '../types';
import { SYMPTOMS_LIST } from '../constants';
import { Button } from './Button';
import { Smile, Meh, Frown, Pill, ChevronDown, ChevronUp, Save } from 'lucide-react';

interface Props {
  date: string;
  existingLog?: DailyLog;
  onSave: (log: DailyLog) => void;
}

export const DailyCheckIn: React.FC<Props> = ({ date, existingLog, onSave }) => {
  const [mood, setMood] = useState<Mood>('normal');
  const [selectedSymptoms, setSelectedSymptoms] = useState<Set<string>>(new Set());
  const [meds, setMeds] = useState(false);
  const [notes, setNotes] = useState('');
  const [showIntimate, setShowIntimate] = useState(false);

  useEffect(() => {
    if (existingLog) {
      setMood(existingLog.mood);
      setSelectedSymptoms(new Set(existingLog.symptoms));
      setMeds(existingLog.medicationTaken);
      setNotes(existingLog.notes);
    }
  }, [existingLog]);

  const toggleSymptom = (id: string) => {
    const next = new Set(selectedSymptoms);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedSymptoms(next);
  };

  const handleSave = () => {
    onSave({
      date,
      mood,
      symptoms: Array.from(selectedSymptoms),
      medicationTaken: meds,
      notes,
      timestamp: Date.now(),
      timeline: existingLog?.timeline || [], // Preserve existing timeline
    });
  };

  const renderSymptomBtn = (symptom: typeof SYMPTOMS_LIST[0]) => (
    <button
      key={symptom.id}
      onClick={() => toggleSymptom(symptom.id)}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
        selectedSymptoms.has(symptom.id)
          ? 'bg-rose-500 text-white border-rose-500'
          : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-rose-300 dark:hover:border-rose-700'
      }`}
    >
      {symptom.name}
    </button>
  );

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 p-5 space-y-6">
      <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-4">
        <h3 className="font-bold text-stone-800 dark:text-stone-100 text-lg">Check-in de Hoje</h3>
        <span className="text-sm text-stone-400 font-mono">{date}</span>
      </div>

      {/* Mood */}
      <section>
        <p className="text-sm font-semibold text-stone-500 dark:text-stone-400 mb-3 uppercase tracking-wider">Como foi seu dia?</p>
        <div className="flex gap-4">
          <button 
            onClick={() => setMood('great')}
            className={`flex-1 p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${mood === 'great' ? 'bg-teal-100 ring-2 ring-teal-400 text-teal-800' : 'bg-stone-50 dark:bg-stone-800 text-stone-400 dark:text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-700'}`}
          >
            <Smile className="w-8 h-8" />
            <span className="text-xs font-bold">Ótimo</span>
          </button>
          <button 
            onClick={() => setMood('normal')}
            className={`flex-1 p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${mood === 'normal' ? 'bg-yellow-100 ring-2 ring-yellow-400 text-yellow-800' : 'bg-stone-50 dark:bg-stone-800 text-stone-400 dark:text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-700'}`}
          >
            <Meh className="w-8 h-8" />
            <span className="text-xs font-bold">Normal</span>
          </button>
          <button 
            onClick={() => setMood('hard')}
            className={`flex-1 p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${mood === 'hard' ? 'bg-rose-100 ring-2 ring-rose-400 text-rose-800' : 'bg-stone-50 dark:bg-stone-800 text-stone-400 dark:text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-700'}`}
          >
            <Frown className="w-8 h-8" />
            <span className="text-xs font-bold">Difícil</span>
          </button>
        </div>
      </section>

      {/* Physical & Emotional */}
      <section>
        <p className="text-sm font-semibold text-stone-500 dark:text-stone-400 mb-3 uppercase tracking-wider">Sintomas Físicos e Emocionais</p>
        <div className="flex flex-wrap gap-2">
          {SYMPTOMS_LIST.filter(s => s.category !== 'intimate').map(renderSymptomBtn)}
        </div>
      </section>

      {/* Intimate (Collapsible) */}
      <section className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3">
        <button 
          onClick={() => setShowIntimate(!showIntimate)}
          className="w-full flex justify-between items-center text-purple-900 dark:text-purple-300 font-medium"
        >
          <span className="flex items-center gap-2">🌸 Sintomas Íntimos</span>
          {showIntimate ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {showIntimate && (
          <div className="mt-3 flex flex-wrap gap-2 animate-fade-in">
             {SYMPTOMS_LIST.filter(s => s.category === 'intimate').map(renderSymptomBtn)}
          </div>
        )}
      </section>

      {/* Medication */}
      <section>
        <button 
          onClick={() => setMeds(!meds)}
          className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${meds ? 'border-teal-400 bg-teal-50 dark:bg-teal-900/30 text-teal-800 dark:text-teal-200' : 'border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'}`}
        >
          <span className="flex items-center gap-2 font-medium">
            <Pill className="w-5 h-5" />
            Tomei minha medicação/suplemento hoje
          </span>
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${meds ? 'border-teal-500 bg-teal-500' : 'border-stone-300 dark:border-stone-600'}`}>
            {meds && <div className="w-2 h-2 bg-white rounded-full" />}
          </div>
        </button>
      </section>

      {/* Notes */}
      <section>
        <textarea
          placeholder="Alguma observação extra? (Comida que caiu mal, estresse no trabalho...)"
          className="w-full rounded-xl border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-3 text-sm focus:ring-rose-200 dark:focus:ring-rose-800 focus:border-rose-400 dark:text-stone-200 min-h-[80px]"
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </section>

      <p className="text-xs text-stone-400 dark:text-stone-500 text-center px-4">
        ℹ️ Este registro é pessoal e não substitui avaliação médica profissional.
      </p>

      <Button onClick={handleSave} className="w-full shadow-rose-200 dark:shadow-none">
        <Save className="w-4 h-4" /> Salvar Diário
      </Button>
    </div>
  );
};