import React, { useContext } from 'react';
import { AppContext } from '../App';
import { AppContextType } from '../types';
import { ChevronRightIcon, PencilIcon } from '../components/Icons';
import Card from '../components/Card';

const MyStoriesScreen: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const { userData, navigateTo, setActiveStoryId } = context;

    const handleNewStory = () => {
        setActiveStoryId(null);
        navigateTo('story-editor');
    };

    const handleSelectStory = (id: string) => {
        setActiveStoryId(id);
        navigateTo('story-editor');
    };

    const isDawn = document.documentElement.classList.contains('theme-dawn');
    const textColor = isDawn ? 'text-dawn-text' : 'text-dusk-text';
    const subTextColor = isDawn ? 'text-slate-600' : 'text-slate-400';
    const buttonClass = isDawn ? 'bg-dawn-primary text-white hover:bg-dawn-primary/90' : 'bg-dusk-primary text-dusk-bg-start hover:bg-dusk-primary/90';
    const itemHoverClass = isDawn ? 'hover:bg-slate-50' : 'hover:bg-slate-700/50';
    const dividerColor = isDawn ? 'divide-slate-200' : 'divide-slate-700';


    return (
        <div className="space-y-4 animate-fade-in">
            <Card className="text-center">
                <h2 className={`text-xl font-bold ${textColor}`}>My Story</h2>
                <p className={`${subTextColor} mt-1`}>Your private space to write, reflect, and heal.</p>
            </Card>
            
            <button
                onClick={handleNewStory}
                className={`w-full font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-md ${buttonClass}`}
            >
                <PencilIcon className="w-5 h-5" />
                <span>Write a New Story</span>
            </button>

            <Card>
                <h3 className={`font-bold ${textColor} mb-3`}>Your Saved Stories</h3>
                {userData?.myStories && userData.myStories.length > 0 ? (
                    <div className={`divide-y ${dividerColor}`}>
                        {userData.myStories.map(story => (
                            <button 
                                key={story.id} 
                                onClick={() => handleSelectStory(story.id)}
                                className={`w-full text-left p-3 flex justify-between items-center ${itemHoverClass} rounded-md`}
                            >
                                <div>
                                    <p className={`font-semibold ${textColor}`}>{story.title}</p>
                                    <p className={`text-sm ${subTextColor}`}>Last updated: {new Date(story.date).toLocaleDateString()}</p>
                                </div>
                                <ChevronRightIcon className={`w-5 h-5 ${subTextColor}`} />
                            </button>
                        ))}
                    </div>
                ) : (
                    <p className={`${subTextColor} text-center py-4`}>You haven't written any stories yet. Start your first chapter today.</p>
                )}
            </Card>
        </div>
    );
};

export default MyStoriesScreen;