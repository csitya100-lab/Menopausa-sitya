import React from 'react';
import { Symptom } from './types';
import { Brain, Heart, Thermometer, Battery, Moon, Droplets, Zap } from 'lucide-react';

export const SYMPTOMS_LIST: Symptom[] = [
  { id: 'hot_flash', name: 'Calores (Fogachos)', category: 'physical' },
  { id: 'insomnia', name: 'Insônia', category: 'physical' },
  { id: 'fatigue', name: 'Fadiga Extrema', category: 'physical' },
  { id: 'headache', name: 'Dor de Cabeça', category: 'physical' },
  { id: 'bloating', name: 'Inchaço', category: 'physical' },
  { id: 'joint_pain', name: 'Dor Articular', category: 'physical' },
  
  // Novos sintomas adicionados
  { id: 'palpitations', name: 'Palpitações', category: 'physical' },
  { id: 'night_sweats', name: 'Sudorese Noturna', category: 'physical' },
  { id: 'dry_skin_mouth', name: 'Ressecamento Pele/Boca', category: 'physical' },
  { id: 'hair_loss', name: 'Queda de Cabelo', category: 'physical' },
  { id: 'tinnitus', name: 'Zumbido', category: 'physical' },
  { id: 'tingling', name: 'Formigamento Mãos/Pés', category: 'physical' },

  { id: 'anxiety', name: 'Ansiedade', category: 'emotional' },
  { id: 'irritability', name: 'Irritabilidade', category: 'emotional' },
  { id: 'brain_fog', name: 'Brain Fog (Névoa)', category: 'emotional' },
  { id: 'sadness', name: 'Tristeza/Depressão', category: 'emotional' },
  { id: 'mood_swings', name: 'Oscilação de Humor', category: 'emotional' },

  { id: 'dryness', name: 'Ressecamento Vaginal', category: 'intimate' },
  { id: 'low_libido', name: 'Libido Baixa', category: 'intimate' },
  { id: 'pain_sex', name: 'Dor na Relação', category: 'intimate' },
];

export const EDUCATION_CONTENT = [
  {
    title: 'O que é Perimenopausa?',
    icon: <Thermometer className="w-6 h-6 text-rose-500" />,
    content: 'É o período de transição antes da menopausa, quando os ovários começam a produzir menos estrogênio. Pode durar de 4 a 10 anos. Os sintomas são flutuantes e os ciclos menstruais tornam-se irregulares.'
  },
  {
    title: 'Brain Fog é real?',
    icon: <Brain className="w-6 h-6 text-teal-500" />,
    content: 'Sim! A queda do estrogênio afeta a forma como o cérebro metaboliza energia. Esquecimentos e dificuldade de concentração são muito comuns e temporários.'
  },
  {
    title: 'Coração e Hormônios',
    icon: <Heart className="w-6 h-6 text-rose-500" />,
    content: 'O estrogênio protege o sistema cardiovascular. Após a menopausa, o risco cardíaco iguala ao dos homens. Monitorar pressão e colesterol é essencial.'
  },
  {
    title: 'Sono Fragmentado',
    icon: <Moon className="w-6 h-6 text-indigo-500" />,
    content: 'A progesterona tem efeito sedativo. Sua queda, somada aos suores noturnos, causa o "despertar da madrugada". Higiene do sono é fundamental.'
  }
];

export const THEME = {
  primary: 'bg-rose-500',
  primaryText: 'text-rose-500',
  secondary: 'bg-teal-400', 
  secondaryText: 'text-teal-400',
  accent: 'bg-orange-300',
  background: 'bg-stone-50',
};