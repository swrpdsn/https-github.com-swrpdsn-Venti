





import React, { useState, useRef, useEffect, useContext } from 'react';
import { ChatMessage } from '../types';
import { getAIResponse } from '../services/geminiService';
import { SendIcon } from '../components/Icons';
import { AppContext } from '../App';
import { AppContextType } from '../types';

const AIChatScreen: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const { userData, setUserData, setShowSOS } = context;

    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (userData && userData.chatHistory.length === 0) {
            setUserData(prev => ({
                ...prev,
                chatHistory: [{ role: 'model', text: `Hi ${userData?.name || 'there'}, I'm here to listen. What's on your mind today?` }]
            }));
        }
    }, [userData, setUserData]);

    useEffect(() => {
        scrollToBottom();
    }, [userData?.chatHistory]);

    const handleSend = async () => {
        if (input.trim() === '' || isLoading || !userData) return;

        const userMessage: ChatMessage = { role: 'user', text: input };
        const updatedHistory = [...(userData.chatHistory || []), userMessage];
        setUserData(prev => ({ ...prev, chatHistory: updatedHistory }));
        
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        const aiResponseText = await getAIResponse(currentInput, updatedHistory, userData);
        
        const sosTrigger = '[TRIGGER_SOS]';
        let cleanResponse = aiResponseText;

        if (aiResponseText.includes(sosTrigger)) {
            setShowSOS(true);
            cleanResponse = aiResponseText.replace(sosTrigger, '').trim();
        }

        const aiMessage: ChatMessage = { role: 'model', text: cleanResponse };
        setUserData(prev => ({
            ...prev,
            // Fix: Add fallback for chatHistory to prevent errors if it's undefined from localStorage
            chatHistory: [...(prev.chatHistory || []), aiMessage]
        }));
        setIsLoading(false);
    };
    
    const messages = userData?.chatHistory || [];
    const isDawn = document.documentElement.classList.contains('theme-dawn');

    const chatBg = isDawn ? 'bg-dawn-card/50' : 'bg-dusk-card/30';
    const inputContainerBg = isDawn ? 'bg-white/80' : 'bg-slate-800/60';
    const inputBg = isDawn ? 'bg-white' : 'bg-slate-700';
    const inputBorder = isDawn ? 'border-slate-300' : 'border-slate-600';
    const inputTextColor = isDawn ? 'text-dawn-text' : 'text-dusk-text';
    const placeholderColor = isDawn ? 'placeholder-slate-400' : 'placeholder-slate-500';
    const footerTextColor = isDawn ? 'text-slate-400' : 'text-slate-500';

    const userBubbleBg = isDawn ? 'bg-dawn-primary text-white' : 'bg-dusk-primary text-dusk-bg-start';
    const modelBubbleBg = isDawn ? 'bg-white text-dawn-text' : 'bg-slate-700 text-dusk-text';
    const modelIconBg = isDawn ? 'bg-dawn-secondary text-white' : 'bg-dusk-secondary text-dusk-bg-start';

    return (
        <div className={`flex flex-col h-full ${chatBg} rounded-lg shadow-inner`}>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                       {msg.role === 'model' && 
                         <div className={`w-8 h-8 rounded-full ${modelIconBg} flex items-center justify-center font-bold text-lg shrink-0`}>V</div>
                       }
                        {/* Fix: Removed stray single quote at the end of the template literal which caused a JSX parsing error. */}
                        <div className={`max-w-xs md:max-w-md p-3 rounded-2xl shadow-sm ${msg.role === 'user' ? `${userBubbleBg} rounded-br-none` : `${modelBubbleBg} rounded-bl-none`}`}>
                           {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex items-end gap-2 justify-start">
                         <div className={`w-8 h-8 rounded-full ${modelIconBg} flex items-center justify-center font-bold text-lg shrink-0`}>V</div>
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
            <div className={`p-2 ${inputContainerBg} border-t ${isDawn ? 'border-slate-200' : 'border-slate-700'} backdrop-blur-md`}>
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Vent, reflect, ask anything..."
                        className={`flex-1 p-3 border rounded-full focus:ring-2  focus:border-transparent ${inputBg} ${inputBorder} ${inputTextColor} ${placeholderColor} ${isDawn ? 'focus:ring-dawn-primary' : 'focus:ring-dusk-primary'}`}
                        disabled={isLoading}
                    />
                    <button onClick={handleSend} disabled={isLoading} className={`rounded-full p-3 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${userBubbleBg}`} aria-label="Send message">
                        <SendIcon className="w-6 h-6" />
                    </button>
                </div>
                 <p className={`text-xs ${footerTextColor} text-center mt-2 px-4`}>
                    Venti is an AI, not a therapist. For crisis support, please use the SOS feature.
                </p>
            </div>
        </div>
    );
};

export default AIChatScreen;