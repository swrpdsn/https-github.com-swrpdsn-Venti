import React, { useState, useRef, useEffect, useContext } from 'react';
import { ChatMessage } from '../types';
import { getAIResponse } from '../services/geminiService';
import { SendIcon } from '../components/Icons';
import { AppContext, AppContextType } from '../App';
import { addChatMessage } from '../services/dataService';

const AIChatScreen: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const { user, userData, setUserData, setShowSOS } = context;

    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const setupInitialChat = async () => {
            if (user && userData && userData.chatHistory.length === 0) {
                const initialMessage: Omit<ChatMessage, 'id' | 'created_at'> = { 
                    role: 'model', 
                    text: `Hi ${userData?.name || 'there'}, I'm here to listen. What's on your mind today?`,
                    user_id: user.id
                };
                const { data } = await addChatMessage(initialMessage);
                if (data) {
                    setUserData(prev => prev ? ({
                        ...prev,
                        chatHistory: [data]
                    }) : null);
                }
            }
        };
        setupInitialChat();
    }, [user, userData?.id]); // Depend on userData.id to prevent re-triggering on every chat message

    useEffect(() => {
        scrollToBottom();
    }, [userData?.chatHistory]);

    const handleSend = async () => {
        if (input.trim() === '' || isLoading || !userData || !user) return;
    
        const currentInput = input;
        setInput('');
    
        // 1. Optimistic UI update for user message
        const optimisticUserMessage: ChatMessage = {
            id: Date.now(), // Temporary ID for finding and replacing later
            role: 'user',
            text: currentInput,
            user_id: user.id,
            created_at: new Date().toISOString()
        };
        setUserData(prev => prev ? ({ ...prev, chatHistory: [...prev.chatHistory, optimisticUserMessage] }) : null);
        setIsLoading(true);
    
        try {
            // 2. Save user message to DB
            const { data: savedUserMessage, error: userMsgError } = await addChatMessage({ role: 'user', text: currentInput, user_id: user.id });
            if (userMsgError || !savedUserMessage) throw userMsgError || new Error("Failed to save user message.");
    
            // 3. Get AI response using the latest history
            const historyForAI = [...userData.chatHistory.filter(m => m.id !== optimisticUserMessage.id), savedUserMessage];
            const aiResponseText = await getAIResponse(currentInput, historyForAI, userData);
            
            let cleanResponse = aiResponseText;
            if (aiResponseText.includes('[TRIGGER_SOS]')) {
                setShowSOS(true);
                cleanResponse = aiResponseText.replace('[TRIGGER_SOS]', '').trim();
            }
    
            // 4. Save AI message to DB
            const { data: savedAiMessage, error: aiMsgError } = await addChatMessage({ role: 'model', text: cleanResponse, user_id: user.id });
            if (aiMsgError || !savedAiMessage) throw aiMsgError || new Error("Failed to save AI message.");
    
            // 5. Final state update with real data from DB
            setUserData(prev => {
                if (!prev) return null;
                // Replace optimistic message with the saved one, then add the new AI message
                const newHistory = prev.chatHistory.map(msg =>
                    msg.id === optimisticUserMessage.id ? savedUserMessage : msg
                );
                newHistory.push(savedAiMessage);
                return { ...prev, chatHistory: newHistory };
            });
    
        } catch (error) {
            console.error("Failed to send message:", error);
            // Revert optimistic update on error
            setUserData(prev => prev ? ({
                ...prev,
                chatHistory: prev.chatHistory.filter(msg => msg.id !== optimisticUserMessage.id)
            }) : null);
            alert("Sorry, your message could not be sent. Please try again.");
        } finally {
            setIsLoading(false);
        }
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
                    <div key={msg.id || index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                       {msg.role === 'model' && 
                         <div className={`w-8 h-8 rounded-full ${modelIconBg} flex items-center justify-center font-bold text-lg shrink-0`}>V</div>
                       }
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