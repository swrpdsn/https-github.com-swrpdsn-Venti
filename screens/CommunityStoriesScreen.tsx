import React, { useState } from 'react';
import { getAICommunityStory } from '../services/geminiService';
import { SparklesIcon } from '../components/Icons';
import Card from '../components/Card';

const storyTopics = [
    "Feeling lonely after the breakup",
    "Struggling with the urge to contact my ex",
    "Finding my own strength again",
    "Dealing with memories",
    "Am I good enough?",
    "Letting go of anger",
];

const CommunityStoriesScreen: React.FC = () => {
    const [story, setStory] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

    const handleGetStory = async (topic: string) => {
        setIsLoading(true);
        setStory(null);
        setSelectedTopic(topic);
        const generatedStory = await getAICommunityStory(topic);
        setStory(generatedStory);
        setIsLoading(false);
    };
    
    const reset = () => {
        setStory(null);
        setSelectedTopic(null);
    }

    const isDawn = document.documentElement.classList.contains('theme-dawn');
    const textColor = isDawn ? 'text-dawn-text' : 'text-dusk-text';
    const subTextColor = isDawn ? 'text-slate-600' : 'text-slate-400';
    const buttonClass = isDawn ? 'bg-dawn-primary text-white hover:bg-dawn-primary/90' : 'bg-dusk-primary text-dusk-bg-start hover:bg-dusk-primary/90';
    const topicButtonClass = isDawn ? 'bg-slate-100 hover:bg-dawn-secondary/20 hover:text-dawn-primary' : 'bg-slate-700/50 hover:bg-dusk-primary/20 hover:text-dusk-primary';
    const topicButtonText = isDawn ? 'text-dawn-text' : 'text-dusk-text';


    return (
        <div className="space-y-4 animate-fade-in">
            <Card className="text-center">
                <h2 className={`text-xl font-bold ${textColor}`}>Community Stories</h2>
                <p className={`${subTextColor} mt-1`}>Anonymous stories of healing and hope.</p>
            </Card>

            {isLoading && (
                <Card className="text-center">
                    <h3 className={`font-semibold ${textColor} mb-2`}>Generating a story about...</h3>
                    <p className={`italic ${subTextColor} mb-4`}>"{selectedTopic}"</p>
                     <div className="flex justify-center items-center space-x-2">
                        <SparklesIcon className={`w-6 h-6 ${isDawn ? 'text-dawn-primary' : 'text-dusk-primary'} animate-pulse`} />
                        <p className={textColor}>Finding the right words...</p>
                    </div>
                </Card>
            )}

            {story && !isLoading && (
                <Card>
                     <h3 className={`font-bold ${textColor} text-lg mb-2`}>A Story About: <span className={`font-medium ${isDawn ? 'text-dawn-secondary' : 'text-dusk-secondary'}`}>{selectedTopic}</span></h3>
                    <p className={`${textColor} whitespace-pre-wrap leading-relaxed`}>{story}</p>
                     <button onClick={reset} className={`mt-4 w-full font-bold py-2 px-4 rounded-lg transition-colors ${buttonClass}`}>
                        Read Another Story
                    </button>
                </Card>
            )}
            
            {!story && !isLoading && (
                <Card>
                    <h3 className={`font-semibold ${textColor} mb-3`}>What do you want to read about today?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {storyTopics.map(topic => (
                             <button 
                                key={topic}
                                onClick={() => handleGetStory(topic)}
                                className={`w-full text-left p-3 ${topicButtonClass} ${topicButtonText} rounded-lg transition-colors font-medium`}
                            >
                                {topic}
                             </button>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
};

export default CommunityStoriesScreen;