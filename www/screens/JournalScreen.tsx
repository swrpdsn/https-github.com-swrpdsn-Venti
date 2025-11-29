





import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../App';
import { AppContextType, JournalEntry, MoodEntry } from '../types';
import { TrashIcon, SparklesIcon } from '../components/Icons';
import { getAIWeeklySummary } from '../services/geminiService';
import Card from '../components/Card';

// NOTE: Recharts is loaded from CDN and accessed via window.Recharts

type JournalTab = 'guided' | 'free' | 'mood';

const JournalScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<JournalTab>('guided');
    
    const tabs: {id: JournalTab, label: string}[] = [
        { id: 'guided', label: 'Guided' },
        { id: 'free', label: 'Free Write' },
        { id: 'mood', label: 'Mood Tracker' },
    ];
    
    const renderContent = () => {
        switch(activeTab) {
            case 'guided': return <GuidedJournal setActiveTab={setActiveTab} />;
            case 'free': return <FreeJournal />;
            case 'mood': return <MoodTracker />;
            default: return null;
        }
    };
    
    const isDawn = document.documentElement.classList.contains('theme-dawn');
    const baseBorder = isDawn ? 'border-slate-200' : 'border-slate-700';
    const activeBorder = isDawn ? 'border-dawn-primary' : 'border-dusk-primary';
    const activeText = isDawn ? 'text-dawn-primary' : 'text-dusk-primary';
    const baseText = isDawn ? 'text-slate-500' : 'text-slate-400';
    const hoverText = isDawn ? 'hover:text-dawn-text' : 'hover:text-dusk-text';


    return (
        <div>
            <div className={`flex space-x-1 border-b-2 ${baseBorder} mb-4`}>
                {tabs.map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-2 px-3 sm:px-4 font-semibold text-base sm:text-lg transition-colors ${activeTab === tab.id ? `${activeBorder} ${activeText} border-b-4` : `${baseText} ${hoverText} border-b-4 border-transparent`}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="animate-fade-in">{renderContent()}</div>
        </div>
    );
};

const GuidedJournal: React.FC<{ setActiveTab: (tab: JournalTab) => void }> = ({ setActiveTab }) => {
    const context = useContext(AppContext) as AppContextType;
    const { setUserData } = context;
    const [content, setContent] = useState('');
    const prompt = "What’s one lesson you’ve learned from this pain?";

    const saveEntry = () => {
        if (!content.trim()) return;
        const newEntry: JournalEntry = {
            id: new Date().toISOString(),
            date: new Date().toLocaleDateString(),
            prompt,
            content,
            mood: 5, // Default mood
        };
        setUserData(prev => ({ ...prev, journalEntries: [newEntry, ...prev.journalEntries] }));
        setContent('');
        alert('Entry Saved!');
        setActiveTab('free');
    };
    
    const isDawn = document.documentElement.classList.contains('theme-dawn');

    return (
        <Card>
            <p className={`font-semibold ${isDawn ? 'text-dawn-text' : 'text-dusk-text'} mb-2`}>{prompt}</p>
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={`w-full h-48 p-2 border rounded-md focus:ring-2 resize-none
                    ${isDawn 
                        ? 'bg-white border-slate-300 focus:ring-dawn-primary focus:border-transparent' 
                        : 'bg-slate-900/50 border-slate-700 text-dusk-text focus:ring-dusk-primary focus:border-transparent'}`}
                placeholder="Write your thoughts here..."
            />
            <button onClick={saveEntry} className={`mt-2 w-full font-bold py-2 px-4 rounded-lg transition-colors
                 ${isDawn ? 'bg-dawn-primary text-white hover:bg-dawn-primary/90' : 'bg-dusk-primary text-dusk-bg-start hover:bg-dusk-primary/90'}`}>
                Save Entry
            </button>
        </Card>
    );
};

const FreeJournal: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const { userData, setUserData } = context;

    const deleteEntry = (id: string) => {
        setUserData(prev => ({
            ...prev,
            journalEntries: prev.journalEntries.filter(entry => entry.id !== id)
        }));
    };
    
    const isDawn = document.documentElement.classList.contains('theme-dawn');
    const textColor = isDawn ? 'text-dawn-text' : 'text-dusk-text';
    const subTextColor = isDawn ? 'text-slate-500' : 'text-slate-400';
    const promptColor = isDawn ? 'text-dawn-secondary' : 'text-dusk-secondary';

    return (
        <div className="space-y-4">
            {userData?.journalEntries.length === 0 ? (
                <Card>
                    <p className={subTextColor}>No entries yet. Start by answering a guided prompt or writing whatever is on your mind.</p>
                </Card>
            ) : (
                userData?.journalEntries.map(entry => (
                    <Card key={entry.id}>
                        <div className="relative">
                           <p className={`text-sm ${subTextColor}`}>{new Date(entry.id).toLocaleString()}</p>
                           {entry.prompt && <p className={`font-semibold mt-1 italic ${promptColor}`}>"{entry.prompt}"</p>}
                           <p className={`mt-2 whitespace-pre-wrap ${textColor}`}>{entry.content}</p>
                           <button onClick={() => deleteEntry(entry.id)} aria-label="Delete entry" className={`absolute top-0 right-0 p-1 rounded-full ${isDawn ? 'text-slate-400 hover:text-red-500 hover:bg-red-100' : 'text-slate-500 hover:text-red-400 hover:bg-red-900/50'}`}>
                               <TrashIcon className="w-5 h-5"/>
                           </button>
                        </div>
                    </Card>
                ))
            )}
        </div>
    );
};

const MoodTracker: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const { userData, setUserData } = context;
    const [mood, setMood] = useState(5);
    const [summary, setSummary] = useState<string | null>(null);
    const [isSummaryLoading, setIsSummaryLoading] = useState(false);
    const [feedback, setFeedback] = useState('');
    
    const isDawn = document.documentElement.classList.contains('theme-dawn');
    const textColor = isDawn ? 'text-dawn-text' : 'text-dusk-text';
    const subTextColor = isDawn ? 'text-slate-600' : 'text-slate-400';
    const buttonClass = isDawn ? 'bg-dawn-secondary text-white hover:bg-dawn-secondary/90' : 'bg-dusk-secondary text-dusk-bg-start hover:bg-dusk-secondary/90';
    const aiButtonClass = isDawn ? 'bg-dawn-primary text-white hover:bg-dawn-primary/90' : 'bg-dusk-primary text-dusk-bg-start hover:bg-dusk-primary/90';
    const summaryBg = isDawn ? 'bg-slate-100' : 'bg-slate-900/50';

    // @ts-ignore - Recharts is loaded from CDN
    const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = window.Recharts || {};
    
    const showFeedback = (message: string) => {
        setFeedback(message);
        setTimeout(() => setFeedback(''), 3000);
    }

    const addMoodEntry = () => {
        const today = new Date().toISOString().split('T')[0];
        const newEntry: MoodEntry = { date: today, mood };

        setUserData(prev => {
            const existingEntryIndex = prev.moods.findIndex(m => m.date === today);
            const newMoods = [...prev.moods];
            if (existingEntryIndex > -1) {
                newMoods[existingEntryIndex] = newEntry;
            } else {
                newMoods.push(newEntry);
            }
            return { ...prev, moods: newMoods };
        });
        showFeedback('Mood logged for today!');
    };

    const handleGetSummary = async () => {
        if (!userData) return;
        setIsSummaryLoading(true);
        setSummary(null);

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const recentEntries = userData.journalEntries.filter(entry => new Date(entry.id) >= oneWeekAgo);
        const recentMoods = userData.moods.filter(mood => new Date(mood.date) >= oneWeekAgo);

        if (recentEntries.length < 2 && recentMoods.length < 2) {
            setSummary("Keep tracking your mood and writing in your journal for a few more days to unlock your first weekly summary!");
            setIsSummaryLoading(false);
            return;
        }

        const generatedSummary = await getAIWeeklySummary(recentEntries, recentMoods);
        setSummary(generatedSummary);
        setIsSummaryLoading(false);
    };
    
    const chartData = useMemo(() => {
        if (!userData) return [];
        return userData.moods.slice(-7).map(m => ({
            name: new Date(m.date).toLocaleDateString('en-US', { weekday: 'short' }),
            mood: m.mood
        }));
    }, [userData]);


    return (
        <div className="space-y-4">
             <Card>
                <h3 className={`font-bold mb-2 ${textColor}`}>How are you feeling today?</h3>
                 {feedback && <p className="text-center text-sm text-green-600 mb-2">{feedback}</p>}
                <div className="flex items-center space-x-2 sm:space-x-4">
                    <span className="text-2xl">😔</span>
                    <input type="range" min="1" max="10" value={mood} onChange={(e) => setMood(Number(e.target.value))} className="w-full"/>
                    <span className="text-2xl">🙂</span>
                </div>
                <button onClick={addMoodEntry} className={`mt-4 w-full font-bold py-2 px-4 rounded-lg transition-colors ${buttonClass}`}>
                    Log Mood ({mood})
                </button>
            </Card>
            <Card>
                <h3 className={`font-bold mb-4 ${textColor}`}>Weekly Mood Trend</h3>
                <div style={{ width: '100%', height: 200 }}>
                    {BarChart ? (
                        <ResponsiveContainer>
                            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDawn ? '#e2e8f0' : '#475569'}/>
                                <XAxis dataKey="name" tick={{ fill: isDawn ? '#475569' : '#94a3b8' }} />
                                <YAxis domain={[0, 10]} tick={{ fill: isDawn ? '#475569' : '#94a3b8' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDawn ? 'rgba(255,255,255,0.8)' : 'rgba(30,41,59,0.8)',
                                        borderColor: isDawn ? '#e2e8f0' : '#475569',
                                        color: textColor
                                    }}
                                />
                                <Bar dataKey="mood" fill={isDawn ? '#dd6b20' : '#a78bfa'} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className={subTextColor}>Loading chart...</p>
                        </div>
                    )}
                </div>
            </Card>
            <Card>
                <div className="flex items-center space-x-2">
                    <SparklesIcon className={`w-6 h-6 ${isDawn ? 'text-dawn-primary' : 'text-dusk-primary'}`} />
                    <h3 className={`font-bold ${textColor}`}>AI Weekly Summary</h3>
                </div>
                <p className={`text-sm ${subTextColor} my-2`}>Get personalized insights based on your journal entries and mood trends from the last 7 days.</p>
                <button 
                    onClick={handleGetSummary} 
                    disabled={isSummaryLoading} 
                    className={`w-full font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 ${aiButtonClass}`}
                >
                    {isSummaryLoading ? 'Analyzing...' : 'Generate My Summary'}
                </button>
                {(summary || isSummaryLoading) && (
                    <div className={`mt-4 p-3 rounded-lg ${summaryBg}`}>
                        {isSummaryLoading ? (
                             <div className="flex items-center justify-center space-x-1">
                                <p className={textColor}>Thinking...</p>
                                <div className={`w-2 h-2 ${isDawn ? 'bg-slate-500' : 'bg-slate-400'} rounded-full animate-pulse`}></div>
                                <div className={`w-2 h-2 ${isDawn ? 'bg-slate-500' : 'bg-slate-400'} rounded-full animate-pulse [animation-delay:0.2s]`}></div>
                                <div className={`w-2 h-2 ${isDawn ? 'bg-slate-500' : 'bg-slate-400'} rounded-full animate-pulse [animation-delay:0.4s]`}></div>
                            </div>
                        ) : (
                             <p className={`${textColor} whitespace-pre-wrap`}>{summary}</p>
                        )}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default JournalScreen;