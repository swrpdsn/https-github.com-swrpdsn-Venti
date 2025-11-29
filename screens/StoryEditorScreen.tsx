import React, { useState, useContext, useEffect } from 'react';
import { AppContext, AppContextType } from '../App';
import { MyStory } from '../types';
import { TrashIcon, ShareIcon } from '../components/Icons';
import Card from '../components/Card';
import { addStory, updateStory, deleteStory } from '../services/dataService';

const StoryEditorScreen: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const { user, userData, setUserData, activeStoryId, goBack } = context;

    const [story, setStory] = useState<Partial<MyStory>>({ title: '', content: '' });

    useEffect(() => {
        if (activeStoryId) {
            const existingStory = userData?.myStories.find(s => s.id === activeStoryId);
            if (existingStory) {
                setStory(existingStory);
            }
        }
    }, [activeStoryId, userData?.myStories]);

    const handleSave = async () => {
        if (!story.title?.trim() || !story.content?.trim() || !user) {
            alert("Please provide a title and content for your story.");
            return;
        }

        if (activeStoryId) { // Update existing story
            const { data, error } = await updateStory(activeStoryId, { title: story.title, content: story.content });
            if (error || !data) {
                alert("Could not update story. Please try again.");
            } else {
                setUserData(prev => prev ? ({ ...prev, myStories: prev.myStories.map(s => s.id === activeStoryId ? data : s) }) : null);
                goBack();
            }
        } else { // Create new story
            const newStoryData = {
                user_id: user.id,
                title: story.title,
                content: story.content,
            };
            const { data, error } = await addStory(newStoryData as Omit<MyStory, 'id'|'created_at'|'updated_at'>);
             if (error || !data) {
                alert("Could not save new story. Please try again.");
            } else {
                setUserData(prev => prev ? ({ ...prev, myStories: [data, ...prev.myStories] }) : null);
                goBack();
            }
        }
    };

    const handleDelete = async () => {
        if (activeStoryId && window.confirm("Are you sure you want to permanently delete this story?")) {
            setUserData(prev => prev ? ({
                ...prev,
                myStories: prev.myStories.filter(s => s.id !== activeStoryId)
            }) : null);

            const { error } = await deleteStory(activeStoryId);
            if (error) {
                alert("Could not delete story. Please try again.");
                // Revert state if necessary
            }
            goBack();
        }
    };
    
    const handleShare = () => {
        const subject = `My Venti Story: ${story.title}`;
        const body = story.content;
        const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body || '')}`;
        window.location.href = mailtoLink;
    }

    const title = activeStoryId ? "Edit Story" : "New Story";
    const isDawn = document.documentElement.classList.contains('theme-dawn');
    const textColor = isDawn ? 'text-dawn-text' : 'text-dusk-text';
    const inputClass = `w-full p-3 border rounded-md focus:ring-2 focus:border-transparent ${isDawn ? 'bg-white border-slate-300 focus:ring-dawn-primary' : 'bg-slate-900/50 border-slate-700 text-dusk-text focus:ring-dusk-primary'}`;
    const buttonClass = isDawn ? 'bg-dawn-primary text-white hover:bg-dawn-primary/90' : 'bg-dusk-primary text-dusk-bg-start hover:bg-dusk-primary/90';
    const shareButtonColor = isDawn ? 'text-dawn-secondary' : 'text-dusk-secondary';

    return (
        <div className="space-y-4 animate-fade-in">
            <h2 className={`text-2xl font-bold text-center ${textColor}`}>{title}</h2>
            <Card>
                <div className="space-y-4">
                    <input
                        type="text"
                        value={story.title}
                        onChange={(e) => setStory(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Give your story a title..."
                        className={`${inputClass} text-lg font-semibold`}
                    />
                    <textarea
                        value={story.content}
                        onChange={(e) => setStory(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Write what's on your heart..."
                        className={`${inputClass} h-64 resize-none`}
                    />
                    <button
                        onClick={handleSave}
                        className={`w-full font-bold py-3 px-4 rounded-lg transition-colors ${buttonClass}`}
                    >
                        Save Story
                    </button>
                    {activeStoryId && (
                        <div className="flex items-center justify-center space-x-4 pt-2">
                            <button
                                onClick={handleShare}
                                className={`flex items-center space-x-2 ${shareButtonColor} font-semibold hover:underline`}
                            >
                                <ShareIcon className="w-5 h-5"/>
                                <span>Share</span>
                            </button>
                             <button
                                onClick={handleDelete}
                                className="flex items-center space-x-2 text-red-500 font-semibold hover:underline"
                            >
                                <TrashIcon className="w-5 h-5"/>
                                <span>Delete</span>
                            </button>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default StoryEditorScreen;