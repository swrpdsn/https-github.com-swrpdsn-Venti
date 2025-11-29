


import React, { useState } from 'react';
import { ChevronRightIcon } from '../components/Icons';
import Card from '../components/Card';

interface LearnTopic {
    title: string;
    content: string;
}

const topics: LearnTopic[] = [
    {
        title: "The 'Stages of Grief' are a Myth (Sort of)",
        content: "You've likely heard of the 5 stages: Denial, Anger, Bargaining, Depression, Acceptance. While useful, they are not a linear checklist. Healing is messy. You might feel anger one day, acceptance the next, and then back to denial. That's normal. Think of them as ingredients in a soup, not steps on a ladder. Be kind to yourself, wherever you are today."
    },
    {
        title: "What is 'No Contact' really doing?",
        content: "No Contact isn't a punishment for your ex; it's a detox for you. A relationship creates strong neural pathways in your brain, like a well-worn path in a forest. Every time you contact them, you walk that path again, keeping it clear. No Contact is about letting that path overgrow, allowing your brain to build new, healthier pathways that don't lead back to them."
    },
    {
        title: "Understanding Attachment Styles",
        content: "Our early bonds shape how we act in adult relationships. If you often feel intense anxiety about being abandoned, you might have an 'Anxious' attachment style. If you tend to shut down and need space, you might be 'Avoidant.' Understanding your style (and your ex's) isn't about blame; it's a superpower. It helps you understand your needs and choose healthier relationships in the future."
    },
    {
        title: "What are Cognitive Distortions?",
        content: "After a breakup, your mind can play tricks on you. These are 'Cognitive Distortions.' For example, 'Catastrophizing' ('I'll be alone forever') or 'All-or-Nothing Thinking' ('The entire relationship was a waste'). Your Shield List is a tool to fight these. By recognizing these thoughts as distortions, not facts, you can take back your power."
    }
];

const LearnScreen: React.FC = () => {
    const [openTopic, setOpenTopic] = useState<number | null>(null);

    const toggleTopic = (index: number) => {
        setOpenTopic(openTopic === index ? null : index);
    };
    
    const isDawn = document.documentElement.classList.contains('theme-dawn');
    const textColor = isDawn ? 'text-dawn-text' : 'text-dusk-text';
    const subTextColor = isDawn ? 'text-slate-600' : 'text-slate-400';
    const iconColor = isDawn ? 'text-dawn-primary' : 'text-dusk-primary';
    const topicContentBg = isDawn ? 'bg-slate-100/50' : 'bg-slate-900/50';
    const topicBorder = isDawn ? 'border-slate-200' : 'border-slate-700';

    return (
        <div className="space-y-4 animate-fade-in">
             <Card className="p-4 text-center">
                <h2 className={`text-2xl font-bold ${textColor}`}>Healing Insights</h2>
                <p className={`${subTextColor} mt-1`}>Understanding the 'why' behind your feelings is a superpower.</p>
            </Card>
            <div className="space-y-2">
                {topics.map((topic, index) => (
                    <Card key={index} className="overflow-hidden p-0">
                        <button
                            onClick={() => toggleTopic(index)}
                            className="w-full text-left p-4 flex justify-between items-center"
                        >
                            <h3 className={`font-bold ${textColor}`}>{topic.title}</h3>
                            <ChevronRightIcon className={`w-6 h-6 ${iconColor} transition-transform ${openTopic === index ? 'rotate-90' : ''}`} />
                        </button>
                        {openTopic === index && (
                            <div className={`p-4 ${topicContentBg} border-t ${topicBorder}`}>
                                <p className={`${textColor} leading-relaxed`}>{topic.content}</p>
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default LearnScreen;