import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AppState } from '../types';
import { Send, Bot, User, AlertTriangle, Loader2, Sparkles } from 'lucide-react';
import { Button } from './Button';

interface Props {
  state: AppState;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export const Chat: React.FC<Props> = ({ state }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Olá, ${state.profile.name.split(' ')[0]}! Sou sua assistente virtual especializada em climatério. Posso te ajudar com dúvidas sobre sintomas, estilo de vida, nutrição e bem-estar. Como você está se sentindo hoje?`
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !process.env.API_KEY) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const systemInstruction = `
        Você é uma especialista em saúde da mulher e climatério, acolhedora, empática e baseada em evidências científicas.
        
        PERFIL DA USUÁRIA:
        Nome: ${state.profile.name}
        Idade: ${state.profile.age}
        Status TRH: ${state.profile.hrtStatus}
        
        REGRAS DE OURO (SEGURANÇA):
        1. NUNCA faça diagnósticos médicos.
        2. NUNCA prescreva medicamentos (nem naturais, nem alopáticos).
        3. NUNCA sugira alteração de dosagem ou suspensão de tratamentos médicos.
        4. Se a usuária relatar sintomas graves (dor torácica, sangramento intenso pós-menopausa, nódulos, pensamentos suicidas), instrua IMEDIATAMENTE e com firmeza a procurar um médico ou pronto-socorro.
        
        SEU ESCOPO:
        - Educação em saúde (explicar o que é o sintoma).
        - Estilo de vida (higiene do sono, manejo de estresse).
        - Nutrição geral (alimentos que ajudam vs atrapalham).
        - Acolhimento emocional (validar sentimentos).
        
        TOM DE VOZ:
        - Use um tom de "amiga experiente" e profissional de saúde.
        - Seja concisa. Evite "textões" enormes. Use parágrafos curtos ou bullet points.
        - Use emojis moderadamente para manter a leveza (🌸, ✨, 🌿).
      `;

      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: systemInstruction,
        },
        history: messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }))
      });

      const result = await chat.sendMessageStream({ message: userMessage.text });
      
      let fullText = '';
      const modelMessageId = (Date.now() + 1).toString();
      
      // Add placeholder for streaming
      setMessages(prev => [...prev, { id: modelMessageId, role: 'model', text: '' }]);

      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          fullText += c.text;
          setMessages(prev => 
            prev.map(msg => 
              msg.id === modelMessageId ? { ...msg, text: fullText } : msg
            )
          );
        }
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: 'Desculpe, tive um problema momentâneo de conexão. Poderia repetir?'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-fade-in">
      {/* Header Warning */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800 p-3 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 dark:text-amber-200">
          <strong>Aviso Importante:</strong> Esta assistente oferece informações educativas e suporte. Ela <u>não substitui</u> consultas médicas e não pode diagnosticar ou prescrever tratamentos.
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[85%] gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' 
                  ? 'bg-rose-100 dark:bg-rose-900 text-rose-500' 
                  : 'bg-teal-100 dark:bg-teal-900 text-teal-600'
              }`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              
              <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-rose-500 text-white rounded-tr-none'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-100 dark:border-stone-700 rounded-tl-none'
              }`}>
                 {/* Simple formatting for bold text if gemini returns markdown asterisks */}
                 {msg.text.split('**').map((part, i) => 
                    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                 )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start w-full">
            <div className="flex items-center gap-2 ml-10 bg-stone-50 dark:bg-stone-800 px-3 py-2 rounded-xl">
               <Loader2 className="w-4 h-4 animate-spin text-teal-500" />
               <span className="text-xs text-stone-400">Digitando...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pergunte sobre insônia, alimentação, calores..."
            className="w-full pl-4 pr-12 py-3 bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-900 focus:border-teal-400 outline-none text-sm dark:text-white"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="flex justify-center mt-2 gap-2 text-[10px] text-stone-400">
           <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> Powered by Gemini</span>
        </div>
      </div>
    </div>
  );
};