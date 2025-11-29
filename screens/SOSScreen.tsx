

import React, { useState, useContext, useEffect, useMemo } from 'react';
import { AppContext, AppContextType } from '../App';
import { CloseIcon } from '../components/Icons';

type SOSMode = 'panic' | 'helplines' | 'shred' | 'contact';

const SOSScreen: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const { userData, setShowSOS, navigateTo } = context;
    const [mode, setMode] = useState<SOSMode>('panic');

    const renderContent = () => {
        switch (mode) {
            case 'panic': return <PanicScreen />;
            case 'helplines': return <HelplinesScreen />;
            case 'shred': return <ShredModeScreen shieldList={userData?.shieldList || []} />;
            case 'contact': return <CallContactScreen contact={userData?.emergencyContact} navigateTo={navigateTo} setShowSOS={setShowSOS} />;
            default: return null;
        }
    }

    return (
        <div className="fixed inset-0 bg-brand-deep-purple text-white z-50 flex flex-col p-4">
            <button onClick={() => setShowSOS(false)} className="self-end p-2 rounded-full hover:bg-white/20" aria-label="Close crisis support">
                <CloseIcon className="w-8 h-8" />
            </button>
            <div className="flex-1 flex flex-col items-center justify-center text-center">
                {renderContent()}
            </div>
            <div className="flex justify-center space-x-2 mt-4 flex-wrap gap-2">
                <button onClick={() => setMode('panic')} className={`px-4 py-2 rounded-full font-semibold ${mode === 'panic' ? 'bg-brand-teal' : 'bg-white/20'}`}>Breathe</button>
                <button onClick={() => setMode('contact')} className={`px-4 py-2 rounded-full font-semibold ${mode === 'contact' ? 'bg-brand-teal' : 'bg-white/20'}`}>Call Contact</button>
                <button onClick={() => setMode('shred')} className={`px-4 py-2 rounded-full font-semibold ${mode === 'shred' ? 'bg-brand-teal' : 'bg-white/20'}`}>Shred</button>
                <button onClick={() => setMode('helplines')} className={`px-4 py-2 rounded-full font-semibold ${mode === 'helplines' ? 'bg-brand-teal' : 'bg-white/20'}`}>Helplines</button>
            </div>
        </div>
    );
};

const PanicScreen: React.FC = () => {
    const [text, setText] = useState('Breathe in...');

    useEffect(() => {
        const inhaleTimer = setInterval(() => setText('Breathe in...'), 10000);
        const exhaleTimer = setTimeout(() => setInterval(() => setText('Breathe out...'), 10000), 4000);

        return () => {
            clearInterval(inhaleTimer);
            clearTimeout(exhaleTimer);
        }
    }, []);

    return (
        <div>
            <div className="relative w-48 h-48 flex items-center justify-center">
                <div className="absolute w-full h-full bg-brand-light-purple rounded-full animate-breathe-in"></div>
                <div className="absolute w-full h-full bg-brand-teal rounded-full animate-breathe-out"></div>
            </div>
            <p className="mt-8 text-2xl font-semibold tracking-wider">{text}</p>
            <p className="mt-2 text-brand-light-purple">You're safe. Just breathe.</p>
        </div>
    );
};

const HelplinesScreen: React.FC = () => (
    <div className="w-full max-w-sm flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4">You are not alone.</h2>
        <p className="mb-6 text-brand-light-purple">Help is available 24/7. Please reach out.</p>
        <div className="bg-white/10 p-4 rounded-lg w-full text-center">
            <h3 className="font-bold text-lg">National Suicide & Crisis Lifeline</h3>
            <p className="text-4xl font-bold my-2 tracking-widest">988</p>
            <a 
                href="tel:988"
                className="mt-2 w-full block bg-brand-teal text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-500 transition-colors"
            >
                Call Now
            </a>
        </div>
        <div className="bg-white/10 p-4 rounded-lg w-full text-center mt-4">
            <h3 className="font-bold">Crisis Text Line</h3>
            <p>Text HOME to 741741</p>
        </div>
    </div>
);

const CallContactScreen: React.FC<{ contact: any, navigateTo: (s: any) => void, setShowSOS: (b: boolean) => void }> = ({ contact, navigateTo, setShowSOS }) => {
    const hasContact = contact && contact.name && contact.phone;

    const goToSettings = () => {
        setShowSOS(false);
        navigateTo('more');
    }

    return (
         <div className="w-full max-w-sm flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4">Call For Support</h2>
            {hasContact ? (
                <>
                    <p className="mb-6 text-brand-light-purple">Your emergency contact is ready.</p>
                    <div className="bg-white/10 p-6 rounded-lg w-full text-center">
                        <div className="w-20 h-20 bg-brand-light-purple rounded-full mx-auto flex items-center justify-center text-4xl font-bold text-brand-purple">
                           {contact.name.charAt(0).toUpperCase()}
                        </div>
                        <h3 className="font-bold text-2xl mt-4">{contact.name}</h3>
                        <p className="text-brand-light-purple">{contact.phone}</p>
                        <a 
                            href={`tel:${contact.phone}`}
                            className="mt-4 w-full block bg-brand-teal text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-500 transition-colors"
                        >
                            Call {contact.name}
                        </a>
                    </div>
                </>
            ) : (
                <>
                    <p className="mb-6 text-brand-light-purple">Set an emergency contact to quickly call a friend or family member when you need them most.</p>
                     <button 
                        onClick={goToSettings}
                        className="mt-2 w-full block bg-brand-teal text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-500 transition-colors"
                    >
                        Set Emergency Contact
                    </button>
                </>
            )}
         </div>
    );
};

const ShredModeScreen: React.FC<{ shieldList: string[] }> = ({ shieldList }) => {
    const [currentItem, setCurrentItem] = useState(0);
    const [subMode, setSubMode] = useState<'remember' | 'release'>('remember');
    const [ventText, setVentText] = useState('');
    const [isShredding, setIsShredding] = useState(false);
    
    const validItems = useMemo(() => shieldList.filter(item => item.trim() !== ''), [shieldList]);

    useEffect(() => {
        if (validItems.length > 0) {
            const randomIndex = Math.floor(Math.random() * validItems.length);
            setCurrentItem(randomIndex);
        }
    }, [validItems]);

    const handleShred = () => {
        if (!ventText.trim()) return;
        setIsShredding(true);
        setTimeout(() => {
            setVentText('');
            setIsShredding(false);
        }, 1000); // match animation duration
    };

    const ShreddedText = ({ text }: { text: string }) => (
        <div className="text-xl italic text-center break-words">
            {text.split('').map((char, index) => (
                <span key={index} className="inline-block animate-shred-fall" style={{ animationDelay: `${index * 5}ms` }}>
                    {char === ' ' ? '\u00A0' : char}
                </span>
            ))}
        </div>
    );
    
    return (
        <div className="w-full max-w-md">
            <div className="flex justify-center mb-4 border-b-2 border-white/20">
                <button onClick={() => setSubMode('remember')} className={`px-4 py-2 font-semibold ${subMode === 'remember' ? 'border-b-2 border-brand-teal' : 'text-white/70'}`}>Remember</button>
                <button onClick={() => setSubMode('release')} className={`px-4 py-2 font-semibold ${subMode === 'release' ? 'border-b-2 border-brand-teal' : 'text-white/70'}`}>Release</button>
            </div>
            {subMode === 'remember' ? (
                <>
                    <h2 className="text-2xl font-bold mb-4">Remember This.</h2>
                    <div className="bg-white/10 p-6 rounded-lg min-h-[100px] flex items-center justify-center">
                        <p className="text-xl italic">
                            {validItems.length > 0 ? validItems[currentItem] : "You haven't set up your shield list yet."}
                        </p>
                    </div>
                    <p className="mt-6 text-brand-light-purple">You deserve better than this. Don’t go back.</p>
                </>
            ) : (
                <>
                    <h2 className="text-2xl font-bold mb-4">Let It Go.</h2>
                     <div className="bg-white/10 p-2 rounded-lg min-h-[200px] flex items-center justify-center overflow-hidden">
                        {isShredding ? (
                           <ShreddedText text={ventText} />
                        ) : (
                            <textarea
                                value={ventText}
                                onChange={(e) => setVentText(e.target.value)}
                                placeholder="Let it all out... this is your private space to vent."
                                className="w-full h-48 p-3 bg-transparent text-white placeholder-white/50 focus:outline-none resize-none"
                            />
                        )}
                    </div>
                    <button onClick={handleShred} disabled={isShredding || !ventText.trim()} className="mt-4 w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 disabled:bg-red-800 disabled:opacity-50 transition-colors">
                        Shred It
                    </button>
                </>
            )}
        </div>
    );
};


export default SOSScreen;