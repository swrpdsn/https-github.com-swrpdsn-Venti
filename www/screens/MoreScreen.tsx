





import React, { useContext, useState } from 'react';
import { AppContext, initialUserData } from '../App';
import { AppContextType, UserData } from '../types';
import { UsersIcon, BookOpenIcon, ChevronRightIcon, PencilIcon, LightbulbIcon } from '../components/Icons';
import Card from '../components/Card';


const MoreScreen: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const { userData, setUserData, navigateTo } = context;
    const [isChangingProgram, setIsChangingProgram] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');

    const programDetails = {
        'healing': { title: 'Calm Healing', desc: 'Meditations and journaling to process emotions.' },
        'glow-up': { title: 'Glow-Up Challenge', desc: 'Fitness, hydration, and self-care tasks.' },
        'no-contact': { title: 'No Contact Bootcamp', desc: 'Tools and streaks to manage urges.' },
    };

    const currentProgram = userData?.program ? programDetails[userData.program] : null;

    const handleProgramSelect = (program: UserData['program']) => {
        setUserData(prev => ({ ...prev, program, programDay: 1, lastTaskCompletedDate: null }));
        setIsChangingProgram(false);
        showFeedback("Program updated successfully!");
    }
    
    const handleResetAccount = () => {
        if (window.confirm("Are you sure you want to delete your account? All your data will be permanently erased. This action cannot be undone.")) {
            setUserData(initialUserData);
        }
    };
    
    const showFeedback = (message: string) => {
        setFeedbackMessage(message);
        setTimeout(() => {
            setFeedbackMessage('');
        }, 3000);
    };
    
    const isDawn = document.documentElement.classList.contains('theme-dawn');
    const textColor = isDawn ? 'text-dawn-text' : 'text-dusk-text';
    const subTextColor = isDawn ? 'text-slate-500' : 'text-slate-400';
    const nameColor = isDawn ? 'text-dawn-primary' : 'text-dusk-primary';
    const nameBg = isDawn ? 'bg-dawn-primary/20' : 'bg-dusk-primary/20';

    return (
        <div className="space-y-6 animate-fade-in">
            {feedbackMessage && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-brand-deep-purple text-white px-4 py-2 rounded-full shadow-lg z-20 animate-toast-in-out">
                    {feedbackMessage}
                </div>
            )}
            <div className="text-center">
                <div className={`w-24 h-24 ${nameBg} rounded-full mx-auto flex items-center justify-center text-4xl font-bold ${nameColor}`}>
                    {userData?.name.charAt(0).toUpperCase()}
                </div>
                <h2 className={`mt-4 text-2xl font-bold ${textColor}`}>{userData?.name}</h2>
                <p className={subTextColor}>Healing one day at a time</p>
            </div>
            
            <Card>
                <h3 className={`font-bold ${textColor} mb-3`}>My Program</h3>
                {isChangingProgram ? (
                     <ProgramChanger currentProgram={userData?.program} onSelect={handleProgramSelect} onCancel={() => setIsChangingProgram(false)}/>
                ) : (
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-semibold">{currentProgram?.title || 'None Selected'}</p>
                            <p className={`text-sm ${subTextColor}`}>{currentProgram?.desc}</p>
                        </div>
                        <button onClick={() => setIsChangingProgram(true)} className={`text-sm font-bold hover:underline ${isDawn ? 'text-dawn-primary' : 'text-dusk-primary'}`}>
                            Change
                        </button>
                    </div>
                )}
            </Card>

            <Card>
                <h3 className={`font-bold ${textColor} mb-3`}>Community & Learning</h3>
                 <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    <SettingsItem label="AI Community Chat" Icon={UsersIcon} onClick={() => navigateTo('community-chat')} />
                    <SettingsItem label="Community Stories" Icon={BookOpenIcon} onClick={() => navigateTo('community-stories')} />
                    <SettingsItem label="Healing Insights" Icon={LightbulbIcon} onClick={() => navigateTo('learn')} />
                </div>
            </Card>

            <Card>
                <h3 className={`font-bold ${textColor} mb-3`}>Personal</h3>
                 <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    <SettingsItem label="My Story" Icon={PencilIcon} onClick={() => navigateTo('my-stories')} />
                    <EmergencyContact />
                </div>
            </Card>

            <Card>
                <h3 className={`font-bold ${textColor} mb-3`}>Settings</h3>
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    <SettingsItem label="Notifications & Reminders" onClick={() => showFeedback('Feature coming soon!')} />
                    <SettingsItem label="App Lock (PIN/Biometric)" onClick={() => showFeedback('Feature coming soon!')} />
                    <SettingsItem label="Export My Data" onClick={() => showFeedback('Feature coming soon!')} />
                    <SettingsItem label="Delete My Account" isDestructive={true} onClick={handleResetAccount} />
                </div>
            </Card>
        </div>
    );
};

const EmergencyContact: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const { userData, setUserData } = context;
    const [isEditing, setIsEditing] = useState(false);
    const [contact, setContact] = useState(userData?.emergencyContact || { name: '', phone: '' });
    
    const isDawn = document.documentElement.classList.contains('theme-dawn');
    const textColor = isDawn ? 'text-dawn-text' : 'text-dusk-text';
    const subTextColor = isDawn ? 'text-slate-500' : 'text-slate-400';
    const buttonTextColor = isDawn ? 'text-dawn-primary' : 'text-dusk-primary';
    
    const handleSave = () => {
        setUserData(prev => ({...prev, emergencyContact: contact }));
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="p-3">
                <h4 className={`font-semibold ${textColor} mb-2`}>Edit Emergency Contact</h4>
                <div className="space-y-3">
                    <input 
                        type="text" 
                        placeholder="Contact Name" 
                        value={contact.name} 
                        onChange={(e) => setContact({...contact, name: e.target.value})} 
                        className={`w-full p-2 border rounded-md ${isDawn ? 'bg-slate-50 border-slate-300' : 'bg-slate-700 border-slate-600 text-white'}`}
                    />
                    <input 
                        type="tel" 
                        placeholder="Phone Number" 
                        value={contact.phone} 
                        onChange={(e) => setContact({...contact, phone: e.target.value})} 
                        className={`w-full p-2 border rounded-md ${isDawn ? 'bg-slate-50 border-slate-300' : 'bg-slate-700 border-slate-600 text-white'}`}
                    />
                    <div className="flex space-x-2">
                        <button onClick={handleSave} className={`flex-1 font-bold py-2 px-4 rounded-lg ${isDawn ? 'bg-dawn-primary text-white' : 'bg-dusk-primary text-black'}`}>Save</button>
                        <button onClick={() => setIsEditing(false)} className={`flex-1 font-bold py-2 px-4 rounded-lg ${isDawn ? 'bg-slate-200 text-slate-700' : 'bg-slate-600 text-slate-200'}`}>Cancel</button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-3 flex justify-between items-center">
            <div>
                <h4 className={`font-semibold ${textColor}`}>Emergency Contact</h4>
                <p className={`text-sm ${subTextColor}`}>{userData?.emergencyContact?.name || "Not set"}</p>
            </div>
            <button onClick={() => setIsEditing(true)} className={`text-sm font-bold hover:underline ${buttonTextColor}`}>
                {userData?.emergencyContact?.name ? "Edit" : "Set"}
            </button>
        </div>
    );
};

const ProgramChanger: React.FC<{currentProgram: UserData['program'], onSelect: (p: UserData['program']) => void, onCancel: () => void}> = ({ currentProgram, onSelect, onCancel }) => {
    const programs = [
        { id: 'healing', title: 'Calm Healing', desc: 'Meditations and journaling.' },
        { id: 'glow-up', title: 'Glow-Up Challenge', desc: 'Fitness and self-care tasks.' },
        { id: 'no-contact', title: 'No Contact Bootcamp', desc: 'Manage urges and build streaks.' },
    ];
    const isDawn = document.documentElement.classList.contains('theme-dawn');

    return (
        <div className="space-y-3">
             {programs.map(p => (
                <button 
                    key={p.id} 
                    onClick={() => onSelect(p.id as UserData['program'])} 
                    className={`w-full text-left p-3 rounded-lg border-2 transition-colors
                     ${currentProgram === p.id 
                         ? (isDawn ? 'bg-dawn-secondary/20 border-dawn-secondary' : 'bg-dusk-primary/20 border-dusk-primary') 
                         : (isDawn ? 'bg-slate-50 border-slate-200 hover:border-dawn-secondary/50' : 'bg-slate-700/50 border-slate-600 hover:border-dusk-primary/50')}`}
                >
                    <h4 className={`font-bold ${isDawn ? 'text-dawn-text' : 'text-dusk-text'}`}>{p.title}</h4>
                    <p className={`text-sm ${isDawn ? 'text-slate-600' : 'text-slate-400'}`}>{p.desc}</p>
                </button>
            ))}
            <button onClick={onCancel} className={`text-sm font-semibold hover:underline mt-2 ${isDawn ? 'text-slate-500' : 'text-slate-400'}`}>
                Cancel
            </button>
        </div>
    );
};

const SettingsItem: React.FC<{ label: string, isDestructive?: boolean, onClick?: () => void, Icon?: React.FC<React.SVGProps<SVGSVGElement>> }> = ({ label, isDestructive = false, onClick, Icon }) => {
    const isDawn = document.documentElement.classList.contains('theme-dawn');
    const textColor = isDestructive ? 'text-red-600' : (isDawn ? 'text-dawn-text' : 'text-dusk-text');
    const iconColor = isDawn ? 'text-dawn-primary' : 'text-dusk-primary';

    return (
        <button onClick={onClick} className={`w-full text-left p-3 flex justify-between items-center ${isDawn ? 'hover:bg-slate-50' : 'hover:bg-slate-700/50'} rounded-md`}>
            <div className="flex items-center space-x-3">
                {Icon && <Icon className={`w-6 h-6 ${isDestructive ? 'text-red-500' : iconColor}`}/>}
                <span className={`font-semibold ${textColor}`}>{label}</span>
            </div>
            <ChevronRightIcon className={`w-5 h-5 ${isDawn ? 'text-slate-400' : 'text-slate-500'}`} />
        </button>
    );
};


export default MoreScreen;