import React from 'react';
import { Symptom } from './types';
import { Brain, Heart, Thermometer, Battery, Moon, Droplets, Zap, Briefcase, Utensils, Leaf } from 'lucide-react';

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
    content: 'É o período de transição antes da menopausa, quando os ovários começam a produzir menos estrogênio. Pode durar de 4 a 10 anos. Os sintomas são flutuantes e os ciclos menstruais tornam-se irregulares.',
    sourceUrl: 'https://www.febrasgo.org.br/pt/noticias/item/157-climatario-e-menopausa'
  },
  {
    title: 'Brain Fog é real?',
    icon: <Brain className="w-6 h-6 text-teal-500" />,
    content: 'Sim! A queda do estrogênio afeta a forma como o cérebro metaboliza energia. Esquecimentos e dificuldade de concentração são muito comuns e temporários.',
    sourceUrl: 'https://vidasaudavel.einstein.br/nevoa-mental/'
  },
  {
    title: 'Coração e Hormônios',
    icon: <Heart className="w-6 h-6 text-rose-500" />,
    content: 'O estrogênio protege o sistema cardiovascular. Após a menopausa, o risco cardíaco iguala ao dos homens. Monitorar pressão e colesterol é essencial.',
    sourceUrl: 'https://www.portal.cardiol.br/post/menopausa-aumenta-risco-de-doen%C3%A7as-cardiovasculares'
  },
  {
    title: 'Sono Fragmentado',
    icon: <Moon className="w-6 h-6 text-indigo-500" />,
    content: 'A progesterona tem efeito sedativo. Sua queda, somada aos suores noturnos, causa o "despertar da madrugada". Higiene do sono é fundamental.',
    sourceUrl: 'https://www.absono.com.br/sono-e-saude/'
  },
  {
    title: 'Carreira e Vida Social',
    icon: <Briefcase className="w-6 h-6 text-orange-500" />,
    content: 'Sintomas como fogachos e alterações de humor podem impactar a confiança no trabalho e relações sociais. O diálogo aberto, limites claros e pausas estratégicas são essenciais para manter o bem-estar social e profissional.',
    sourceUrl: 'https://forbes.com.br/forbes-mulher/2023/10/menopausa-no-trabalho-como-lidar-com-os-sintomas-e-manter-a-produtividade/'
  },
  {
    title: 'Nutrição e Alívio',
    icon: <Utensils className="w-6 h-6 text-green-500" />,
    content: 'Alimentos ricos em cálcio, vitamina D e fitoestrógenos (linhaça, soja) auxiliam no equilíbrio hormonal. Evitar excesso de cafeína, álcool e açúcar pode reduzir significativamente a intensidade dos calores.',
    sourceUrl: 'https://bvsms.saude.gov.br/bvs/dicas/221_alimentacao_saudavel.html'
  },
  {
    title: 'Mindfulness e Relaxamento',
    icon: <Leaf className="w-6 h-6 text-teal-500" />,
    content: 'Práticas como respiração diafragmática (técnica 4-7-8) e meditação reduzem o cortisol e a ansiedade. Dedicar 5 minutos diários ao relaxamento melhora a regulação emocional e a qualidade do sono.',
    sourceUrl: 'https://bvsms.saude.gov.br/bvs/publicacoes/praticas_integrativas_complementares.pdf'
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