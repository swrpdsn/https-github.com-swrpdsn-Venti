import React, { useContext, useState, useMemo } from 'react';
import { AppContext, AppContextType } from '../App';
import { Program } from '../types';
import Card from '../components/Card';
import { addOrUpdateMood, updateProfile } from '../services/dataService';

interface ProgramTask {
    title: string;
    task: string;
}

const programTasks: Record<Program, { title: string; emoji: string; tasks: ProgramTask[] }> = {
    'healing': {
        title: 'Calm Healing',
        emoji: '🧘',
        tasks: [
            { title: 'Mindful Moment', task: 'Find a quiet space for 5 minutes. Close your eyes and focus only on your breath. Acknowledge any thoughts, then gently return to your breathing.' },
            { title: 'Gratitude Reflection', task: 'Write down three small things you are grateful for today, no matter how simple. It could be a warm cup of coffee or the sun on your face.' },
            { title: 'Sensory Grounding', task: 'Notice five things you can see, four you can feel, three you can hear, two you can smell, and one you can taste. This brings you back to the present moment.' }
        ]
    },
    'glow-up': {
        title: 'Glow-Up Challenge',
        emoji: '✨',
        tasks: [
            { title: 'Hydration Station', task: 'Drink a large glass of water as soon as you wake up, and one with every meal. Feel the revitalizing energy.' },
            { title: 'Move Your Body', task: 'Put on your favorite song and dance for its entire length, or go for a brisk 15-minute walk. The goal is to get your heart rate up.' },
            { title: 'Nourish Yourself', task: 'Eat one meal today that is full of color. Add a fruit or vegetable to your plate. Your body is your temple; treat it with kindness.' }
        ]
    },
    'no-contact': {
        title: 'No Contact Bootcamp',
        emoji: '🔥',
        tasks: [
            { title: 'The Digital Purge', task: 'Mute or block your ex on every social media platform. This is about creating a peaceful space for your mind to heal.' },
            { title: 'Redirect the Urge', task: 'When you feel the urge to check their socials, immediately open this app and write one sentence in your journal instead. Replace the habit.' },
            { title: 'Delete The Conversation', task: 'Delete the main text thread you had with your ex. This is a powerful symbolic act of letting go of the past.' }
        ]
    },
};

const bridgeActions: { text: string, type: 'action' | 'thought' }[] = [
    { text: 'Text a simple "hello" to one friend.', type: 'action' },
    { text: 'Go for a 10-minute walk outside, no phone.', type: 'action' },
    { text: 'Tidy up one small area of your room.', type: 'action' },
    { text: 'Listen to a song that makes you feel powerful.', type: 'action' },
    { text: 'Do 5 minutes of stretching.', type: 'action' },
    { text: 'Step outside and take 3 deep breaths of fresh air.', type: 'action' },
    { text: 'Compliment the next person you interact with.', type: 'action' },
];

const getDayOfYear = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
};


const HomeScreen: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    if (!context || !context.userData) return <div>Loading...</div>;

    const { user, userData, setUserData } = context;
    const [mood, setMood] = useState(5);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    
    const today = new Date().toISOString().split('T')[0];
    const isTaskCompletedToday = userData.lastTaskCompletedDate === today;

    const currentProgramKey = userData.program || 'healing';
    const dayIndex = (userData.programDay || 1) - 1;
    const programData = programTasks[currentProgramKey];
    const dailyTask = programData.tasks[dayIndex % programData.tasks.length];

    const dailyBridgeAction = useMemo(() => {
        const dayIndex = getDayOfYear();
        return bridgeActions[dayIndex % bridgeActions.length];
    }, []);
    
    const showFeedback = (message: string) => {
        setFeedbackMessage(message);
        setTimeout(() => {
            setFeedbackMessage('');
        }, 3000);
    };

    const addMoodEntry = async () => {
        if (!user) return;
        const newEntry = { user_id: user.id, date: today, mood };
        
        const originalUserData = userData;

        // Optimistic UI update
        setUserData(prev => {
            if (!prev) return null;
            const existingEntryIndex = prev.moods.findIndex(m => m.date === today);
            const newMoods = [...prev.moods];
            if (existingEntryIndex > -1) {
                newMoods[existingEntryIndex] = { ...newMoods[existingEntryIndex], ...newEntry };
            } else {
                // Mock an ID for the optimistic update
                newMoods.push({ id: Date.now(), created_at: new Date().toISOString(), ...newEntry });
            }
            return { ...prev, moods: newMoods };
        });

        const { data, error } = await addOrUpdateMood(newEntry);
        if (error) {
            showFeedback("Error logging mood. Please try again.");
            setUserData(originalUserData); // Revert on error
        } else if (data) {
            // Update local state with actual data from DB
            setUserData(prev => {
                if (!prev) return null;
                const newMoods = originalUserData.moods.filter(m => m.date !== today);
                newMoods.push(data);
                return { ...prev, moods: newMoods };
            });
        }
        showFeedback("Mood for today logged. Great job checking in!");
    };
    
    const handleCompleteTask = async () => {
        if (isTaskCompletedToday || !user) return;

        const originalUserData = userData;

        const updates = {
            programDay: Math.min(30, userData.programDay + 1),
            lastTaskCompletedDate: today,
            streaks: {
                ...userData.streaks,
                selfCare: userData.streaks.selfCare + 1
            }
        };

        setUserData(prev => prev ? ({ ...prev, ...updates }) : null);
        showFeedback("Task complete! One step forward.");

        const { error } = await updateProfile(user.id, updates);
        if (error) {
            showFeedback("Error saving progress. Please try again.");
            // Revert optimistic update
             setUserData(originalUserData);
        }
    }
    
    const isDawn = document.body.parentElement?.classList.contains('theme-dawn');
    
    const headerGradient = isDawn
      ? 'from-dawn-primary/80 to-dawn-secondary/80'
      : 'from-dusk-primary/80 to-dusk-secondary/60';
      
    const headerTextColor = isDawn ? 'text-white' : 'text-dusk-bg-start';
    const headerSubTextColor = isDawn ? 'text-white/80' : 'text-dusk-bg-start/80';
    
    const textColor = isDawn ? 'text-dawn-text' : 'text-dusk-text';
    const subTextColor = isDawn ? 'text-slate-600' : 'text-slate-400';
    
    const buttonClass = isDawn
      ? 'bg-dawn-primary text-white hover:bg-dawn-primary/90'
      : 'bg-dusk-primary text-dusk-bg-start hover:bg-dusk-primary/90';
      
    const secondaryButtonClass = isDawn
      ? 'bg-dawn-secondary/20 text-dawn-secondary hover:bg-dawn-secondary/30'
      : 'bg-dusk-secondary/20 text-dusk-secondary hover:bg-dusk-secondary/30';

    return (
        <div className="space-y-4">
            {feedbackMessage && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-brand-deep-purple text-white px-4 py-2 rounded-full shadow-lg z-20 animate-toast-in-out">
                    {feedbackMessage}
                </div>
            )}
            
            <div className={`p-6 bg-gradient-to-br ${headerGradient} rounded-2xl shadow-lg`}>
                <h1 className={`text-3xl font-bold ${headerTextColor}`}>Hello, {userData.name}</h1>
                <p className={`mt-1 ${headerSubTextColor}`}>Here is your gentle plan for healing today.</p>
            </div>

            <Card>
                <div className="flex justify-between items-center">
                    <h3 className={`font-bold ${textColor} text-lg`}>✨ Your Daily Focus</h3>
                    <span className={`text-sm font-bold ${subTextColor}`}>Day {userData.programDay} of 30</span>
                </div>
                <p className={`font-semibold my-1 ${textColor}`}>{dailyTask.title}</p>
                <p className={`${subTextColor} text-sm mb-3`}>{dailyTask.task}</p>
                <button 
                    onClick={handleCompleteTask}
                    disabled={isTaskCompletedToday}
                    className={`w-full font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed ${buttonClass}`}>
                    {isTaskCompletedToday ? 'Completed for today!' : 'Mark as Complete'}
                </button>
            </Card>
            
            <Card>
                <h3 className={`font-bold ${textColor} text-lg`}>How are you feeling right now?</h3>
                 <div className="flex items-center space-x-2 sm:space-x-4 my-2">
                    <span className="text-2xl">😔</span>
                    <input type="range" min="1" max="10" value={mood} onChange={(e) => setMood(Number(e.target.value))} className="w-full"/>
                    <span className="text-2xl">🙂</span>
                </div>
                <button onClick={addMoodEntry} className={`mt-2 w-full font-bold py-2 px-4 rounded-lg transition-colors ${secondaryButtonClass}`}>
                    Log My Mood
                </button>
            </Card>
            
            <Card>
                <h3 className={`font-bold ${textColor} text-lg`}>🌱 Bridge to the World</h3>
                <p className={`${subTextColor} my-2 text-sm`}>Healing involves reconnecting. Try this small step today.</p>
                <div className={`p-3 rounded-lg flex justify-between items-center ${isDawn ? 'bg-slate-50' : 'bg-slate-900/40'}`}>
                    <p className={`font-medium ${textColor}`}>{dailyBridgeAction.text}</p>
                    <button onClick={() => showFeedback("Great step forward!")} className={`px-3 py-1 rounded-full font-semibold shadow-sm border ${isDawn ? 'bg-white text-dawn-primary border-slate-200' : 'bg-slate-700/80 text-dusk-primary border-slate-600'}`}>
                        I did it!
                    </button>
                </div>
            </Card>

            <Card>
                <h3 className={`font-bold ${textColor} text-lg`}>My Progress</h3>
                <p className={`text-sm ${subTextColor} mb-3`}>Consistency is key. Celebrate every step.</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                        <p className="text-3xl">🔥</p>
                        <p className={`font-bold text-xl ${textColor}`}>{userData.streaks.noContact}</p>
                        <p className={`text-xs ${subTextColor}`}>Day{userData.streaks.noContact !== 1 && 's'} No Contact</p>
                    </div>
                    <div>
                        <p className="text-3xl">📖</p>
                        <p className={`font-bold text-xl ${textColor}`}>{userData.streaks.journaling}</p>
                        <p className={`text-xs ${subTextColor}`}>Day{userData.streaks.journaling !== 1 && 's'} Journaling</p>
                    </div>
                    <div>
                        <p className="text-3xl">❤️</p>
                        <p className={`font-bold text-xl ${textColor}`}>{userData.streaks.selfCare}</p>
                        <p className={`text-xs ${subTextColor}`}>Day{userData.streaks.selfCare !== 1 && 's'} Self-Care</p>
                    </div>
                </div>
            </Card>
        </div>
    );
}

export default HomeScreen;