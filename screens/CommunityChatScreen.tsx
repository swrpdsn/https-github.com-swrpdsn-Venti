import React, { useState, useRef, useEffect, useContext } from 'react';
// Fix: Use the existing and correctly typed `CommunityGroupSimulationMessage` for the AI group chat.
import { CommunityGroupSimulationMessage } from '../types';
import { getAICommunityChatResponse } from '../services/geminiService';
import { SendIcon } from '../components/Icons';
import { AppContext, AppContextType } from '../App';

const personaColors: { [key: string]: {bg: string, text: string} } = {
    'Liam': { bg: 'bg-blue-500', text: 'text-white' },
    'Chloe': { bg: 'bg-teal-500', text: 'text-white' },
    'Maya': { bg: 'bg-amber-500', text: 'text-white' },
    'Venti': { bg: 'bg-indigo-500', text: 'text-white' },
};

const CommunityChatScreen: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const { userData } = context;

    const [messages, setMessages] = useState<CommunityGroupSimulationMessage[]>([
        { id: 0, name: 'Venti', text: `Welcome to the community chat, ${userData?.name}. This is a safe space to share what's on your mind. Liam, Chloe, and Maya are here to listen.` }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage: CommunityGroupSimulationMessage = { id: Date.now(), name: 'You', text: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        const historyForAI = newMessages.slice(-5).map(({name, text}) => ({name, text})); // Send last 5 messages for context
        const aiResponses = await getAICommunityChatResponse(historyForAI);
        
        setIsLoading(false);
        
        let delay = 0;
        for (const response of aiResponses) {
            setTimeout(() => {
                setMessages(prev => [...prev, {id: Date.now() + Math.random(), ...response}]);
            }, delay);
            delay += Math.random() * 1000 + 500; // Stagger responses
        }
    };
    
    const isDawn = document.documentElement.classList.contains('theme-dawn');
    
    const chatBg = isDawn ? 'bg-dawn-card/50' : 'bg-dusk-card/30';
    const headerBg = isDawn ? 'bg-white/70' : 'bg-slate-800/50';
    const headerBorder = isDawn ? 'border-slate-200' : 'border-slate-700';
    const headerText = isDawn ? 'text-dawn-text' : 'text-dusk-text';
    const headerSubText = isDawn ? 'text-slate-500' : 'text-slate-400';
    
    const inputContainerBg = isDawn ? 'bg-white/80' : 'bg-slate-800/60';
    const inputBg = isDawn ? 'bg-white' : 'bg-slate-700';
    const inputBorder = isDawn ? 'border-slate-300' : 'border-slate-600';
    const inputTextColor = isDawn ? 'text-dawn-text' : 'text-dusk-text';
    const placeholderColor = isDawn ? 'placeholder-slate-400' : 'placeholder-slate-500';

    const userBubbleBg = isDawn ? 'bg-dawn-primary text-white' : 'bg-dusk-primary text-dusk-bg-start';
    const modelBubbleBg = isDawn ? 'bg-white text-dawn-text' : 'bg-slate-700 text-dusk-text';

    return (
        <div className={`flex flex-col h-full ${chatBg} rounded-lg shadow-inner`}>
            <div className={`p-2 ${headerBg} border-b ${headerBorder} text-center rounded-t-lg backdrop-blur-sm`}>
                <h2 className={`font-bold ${headerText}`}>Community Chat (Beta)</h2>
                <p className={`text-xs ${headerSubText}`}>Anonymous AI-powered support group</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                    const persona = personaColors[msg.name] || { bg: 'bg-gray-400', text: 'text-white' };
                    return (
                        <div key={msg.id} className={`flex items-end gap-2 ${msg.name === 'You' ? 'justify-end' : 'justify-start'}`}>
                           {msg.name !== 'You' && 
                            <div className={`w-8 h-8 rounded-full ${persona.bg} flex items-center justify-center font-bold text-sm shrink-0 ${persona.text}`}>
                                {msg.name.charAt(0)}
                            </div>
                           }
                            <div className={`max-w-xs md:max-w-md p-3 rounded-2xl shadow-sm ${msg.name === 'You' ? `${userBubbleBg} rounded-br-none` : `${modelBubbleBg} rounded-bl-none`}`}>
                               <p className={`font-bold text-sm ${msg.name === 'You' ? 'text-inherit' : (isDawn ? 'text-dawn-secondary' : 'text-dusk-secondary')}`}>{msg.name}</p>
                               <p className="mt-1">{msg.text}</p>
                            </div>
                        </div>
                    );
                })}
                {isLoading && (
                     <div className="flex items-end gap-2 justify-start">
                         <div className={`w-8 h-8 rounded-full ${isDawn ? 'bg-slate-300' : 'bg-slate-600'} flex items-center justify-center text-white font-bold text-lg animate-pulse`}>...</div>
                         <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${modelBubbleBg} rounded-bl-none`}>
                            <div className="flex items-center space-x-1">
                                <div className={`w-2 h-2 ${isDawn ? 'bg-slate-400' : 'bg-slate-500'} rounded-full animate-pulse`}></div>
                                <div className={`w-2 h-2 ${isDawn ? 'bg-slate-400' : 'bg-slate-500'} rounded-full animate-pulse [animation-delay:0.2s]`}></div>
                                <div className={`w-2 h-2 ${isDawn ? 'bg-slate-400' : 'bg-slate-500'} rounded-full animate-pulse [animation-delay:0.4s]`}></div>
                            </div>
                         </div>
                     </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className={`p-2 ${inputContainerBg} border-t ${headerBorder} mt-auto backdrop-blur-md`}>
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Share something with the group..."
                        className={`flex-1 p-3 border rounded-full focus:ring-2 focus:border-transparent ${inputBg} ${inputBorder} ${inputTextColor} ${placeholderColor} ${isDawn ? 'focus:ring-dawn-primary' : 'focus:ring-dusk-primary'}`}
                        disabled={isLoading}
                    />
                    <button onClick={handleSend} disabled={isLoading} className={`rounded-full p-3 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${userBubbleBg}`}>
                        <SendIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CommunityChatScreen;