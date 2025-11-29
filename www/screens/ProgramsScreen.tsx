import React, { useContext } from 'react';
import { AppContext } from '../App';
import { AppContextType, Program } from '../types';

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
            { title: 'Sensory Grounding', task: 'Notice five things you can see, four you can feel, three you can hear, two you can smell, and one you can taste. This brings you back to the present moment.' },
            { title: 'Kindness Note to Self', task: 'Write one kind, forgiving sentence to yourself in your journal. You are doing your best.' },
            { title: 'Listen to a Calming Song', task: 'Put on a piece of music with no lyrics. Close your eyes and let the sound wash over you.' },
            // ... add more to reach 30 unique tasks
        ]
    },
    'glow-up': {
        title: 'Glow-Up Challenge',
        emoji: '✨',
        tasks: [
            { title: 'Hydration Station', task: 'Drink a large glass of water as soon as you wake up, and one with every meal. Feel the revitalizing energy.' },
            { title: 'Move Your Body', task: 'Put on your favorite song and dance for its entire length, or go for a brisk 15-minute walk. The goal is to get your heart rate up.' },
            { title: 'Nourish Yourself', task: 'Eat one meal today that is full of color. Add a fruit or vegetable to your plate. Your body is your temple; treat it with kindness.' },
            { title: 'Declutter One Space', task: 'Choose one small area - a drawer, your desk, your car console - and tidy it for 10 minutes.' },
            { title: 'Learn Something New', task: 'Watch a 5-minute video on a topic you know nothing about. Expand your mind.' },
             // ... add more to reach 30 unique tasks
        ]
    },
    'no-contact': {
        title: 'No Contact Bootcamp',
        emoji: '🔥',
        tasks: [
            { title: 'The Digital Purge', task: 'Mute or block your ex on every social media platform. This is about creating a peaceful space for your mind to heal.' },
            { title: 'Redirect the Urge', task: 'When you feel the urge to check their socials, immediately open this app and write one sentence in your journal instead. Replace the habit.' },
            { title: 'Delete The Conversation', task: 'Delete the main text thread you had with your ex. This is a powerful symbolic act of letting go of the past.' },
            { title: 'Write an Unsent Letter', task: 'Pour all your feelings, anger, and pain into a letter you will never send. Then, delete it.' },
            { title: 'Identify a Trigger', task: 'What makes you want to contact them most? A time of day? A song? A place? Name it so you can prepare for it.' },
             // ... add more to reach 30 unique tasks
        ]
    },
};

// Fill up tasks to 30 for each program
for (const key in programTasks) {
    const pKey = key as Program;
    const p = programTasks[pKey];
    while (p.tasks.length < 30) {
        p.tasks.push(p.tasks[p.tasks.length % 5]); // Repeat the first 5 tasks
    }
}


const ProgramsScreen: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const { userData, navigateTo } = context;

    const currentProgramKey = userData?.program || 'healing';
    const programData = programTasks[currentProgramKey];
    const programDay = userData?.programDay || 1;
    const progress = Math.min(100, (programDay / 30) * 100);
    
    const isDawn = document.documentElement.classList.contains('theme-dawn');
    const headerGradient = isDawn
      ? 'from-dawn-primary/80 to-dawn-secondary/80'
      : 'from-dusk-primary/80 to-dusk-secondary/60';
    const headerTextColor = isDawn ? 'text-white' : 'text-dusk-bg-start';
    const headerSubTextColor = isDawn ? 'text-white/80' : 'text-dusk-bg-start/80';
    const textColor = isDawn ? 'text-dawn-text' : 'text-dusk-text';
    const cardClass = isDawn ? 'bg-white/70 border-white/20' : 'bg-slate-800/40 border-white/10';
    const progressBg = isDawn ? 'bg-dawn-primary' : 'bg-dusk-primary';
    const progressTrackBg = isDawn ? 'bg-slate-200' : 'bg-slate-700';

    return (
        <div className="space-y-4 animate-fade-in">
            <div className={`p-6 bg-gradient-to-br ${headerGradient} rounded-2xl shadow-lg text-center`}>
                <p className="text-6xl mb-2">{programData.emoji}</p>
                <h1 className={`text-3xl font-bold ${headerTextColor}`}>{programData.title}</h1>
                <p className={`mt-1 text-lg ${headerSubTextColor}`}>Your 30-Day Journey</p>
            </div>

            <div className={`p-4 rounded-xl shadow-md backdrop-blur-sm border transition-colors duration-500 ${cardClass}`}>
                <div className="flex justify-between items-center mb-2">
                    <h3 className={`font-bold ${textColor}`}>My Progress</h3>
                    <span className={`font-bold text-sm ${isDawn ? 'text-dawn-primary' : 'text-dusk-primary'}`}>Day {programDay} of 30</span>
                </div>
                <div className={`w-full ${progressTrackBg} rounded-full h-2.5`}>
                    <div className={`${progressBg} h-2.5 rounded-full`} style={{ width: `${progress}%` }}></div>
                </div>
                <p className={`text-xs text-center mt-2 ${isDawn ? 'text-slate-500' : 'text-slate-400'}`}>
                    You're on your way. Keep going!
                </p>
            </div>
            
            <div className={`p-4 rounded-xl shadow-md backdrop-blur-sm border transition-colors duration-500 ${cardClass}`}>
                <h3 className={`font-bold mb-3 ${textColor}`}>Daily Tasks</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {programData.tasks.map((task, index) => {
                        const day = index + 1;
                        const isCompleted = day < programDay;
                        const isCurrent = day === programDay;

                        return (
                            <div key={index} className={`p-3 rounded-lg flex items-start space-x-3 transition-all
                                ${isCurrent ? (isDawn ? 'bg-dawn-secondary/20' : 'bg-dusk-primary/20') : ''}
                                ${isCompleted ? 'opacity-50' : ''}
                            `}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5
                                    ${isCompleted ? (isDawn ? 'bg-slate-300 text-slate-500' : 'bg-slate-600 text-slate-400') : (isDawn ? 'bg-dawn-primary text-white' : 'bg-dusk-primary text-black')}
                                `}>
                                    {isCompleted ? '✔' : day}
                                </div>
                                <div>
                                    <p className={`font-semibold ${textColor}`}>{task.title}</p>
                                    <p className={`text-sm ${isDawn ? 'text-slate-600' : 'text-slate-400'}`}>{task.task}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
                 <p className={`text-xs text-center mt-4 ${isDawn ? 'text-slate-500' : 'text-slate-400'}`}>
                    Want to try a different path? <button onClick={() => navigateTo('more')} className="font-bold underline">Change Program</button>
                </p>
            </div>
        </div>
    );
};

export default ProgramsScreen;