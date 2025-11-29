import React, { useState } from 'react';
import { UserData } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface OnboardingProps {
  onComplete: (data: UserData) => void;
  initialData: UserData;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, initialData }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<UserData>(initialData);

  const totalSteps = 8;

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const [section, field] = name.split('.');
    
    if (field) {
        setData(prev => ({
            ...prev,
            // Fix: Cast to object to satisfy TypeScript that the spread target is an object.
            [section]: { ...(prev[section as keyof UserData] as object), [field]: value }
        }));
    } else {
        setData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleShieldListChange = (index: number, value: string) => {
    const newList = [...data.shieldList];
    newList[index] = value;
    setData(prev => ({ ...prev, shieldList: newList }));
  };

  const renderStep = () => {
    switch(step) {
      case 1: return <WelcomeScreen name={data.name} onNameChange={handleInputChange} />;
      case 2: return <ConsentScreen />;
      case 3: return <BreakupContextScreen data={data.breakupContext} onChange={handleInputChange} />;
      case 4: return <ExNameScreen exName={data.exName} onExNameChange={handleInputChange} />;
      case 5: return <ReleaseThoughtScreen onComplete={nextStep} />;
      case 6: return <ShieldListScreen list={data.shieldList} onChange={handleShieldListChange} />;
      case 7: return <BaselineScreen data={data.baseline} setData={setData} />;
      case 8: return <ProgramChoiceScreen onSelect={(program) => setData(p => ({...p, program}))} selected={data.program} />;
      default: return <WelcomeScreen name={data.name} onNameChange={handleInputChange} />;
    }
  };

  const handleFinish = () => {
    if(data.program) {
        onComplete(data);
    } else {
        alert("Please select a program to start.");
    }
  }

  return (
    <div className="bg-brand-deep-purple min-h-screen text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl flex flex-col min-h-[500px]">
        <div className="flex-1">{renderStep()}</div>
        <div className="flex items-center justify-between mt-6">
          <button onClick={prevStep} disabled={step === 1} className="p-2 rounded-full hover:bg-white/20 disabled:opacity-50">
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <div className="flex space-x-2">
            {[...Array(totalSteps)].map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${step === i + 1 ? 'bg-white' : 'bg-white/50'}`}></div>
            ))}
          </div>
          {step < totalSteps ? (
            <button onClick={nextStep} disabled={step === 5} className="p-2 rounded-full hover:bg-white/20 disabled:opacity-50">
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          ) : (
            <button onClick={handleFinish} className="bg-brand-teal text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-500 transition-colors">
              Start Healing
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const WelcomeScreen: React.FC<{name: string, onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void}> = ({name, onNameChange}) => (
  <div className="text-center flex flex-col justify-center h-full">
    <h1 className="text-4xl font-bold mb-4">Welcome to Venti</h1>
    <p className="text-brand-light-purple mb-6">This is your space to heal. Some questions might feel tough, but they are here to guide you. You control what you share.</p>
    <input type="text" name="name" value={name} onChange={onNameChange} placeholder="What should we call you?" className="bg-white/20 border-2 border-transparent focus:border-white focus:ring-0 rounded-lg p-3 text-center text-white placeholder-white/70"/>
  </div>
);

const ConsentScreen: React.FC = () => (
    <div className="text-center flex flex-col justify-center h-full">
        <h2 className="text-2xl font-bold mb-4">Your Privacy Matters</h2>
        <ul className="text-left space-y-3 text-brand-light-purple list-disc list-inside mb-6">
            <li>Your journal is private and stored on your device.</li>
            <li>We don't show you ads or sell your data.</li>
            <li>You can export or delete your data anytime.</li>
        </ul>
        <p>This is a support tool, not a replacement for medical care.</p>
    </div>
);

const BreakupContextScreen: React.FC<{ data: UserData['breakupContext'], onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void }> = ({ data, onChange }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Tell Us a Little More</h2>
            <p className="text-sm text-brand-light-purple mb-6">This helps us tailor your experience.</p>
            <textarea
                name="breakupContext.reason"
                value={data.reason}
                onChange={onChange}
                placeholder="In your words, why did it end?"
                className="w-full bg-white/20 border-2 border-transparent focus:border-white focus:ring-0 rounded-lg p-3 text-white placeholder-white/70 h-32"
            />
        </div>
    );
};

const ExNameScreen: React.FC<{exName: string, onExNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void}> = ({exName, onExNameChange}) => (
    <div className="text-center flex flex-col justify-center h-full">
        <h2 className="text-2xl font-bold mb-4">Let's Name This Chapter</h2>
        <p className="text-brand-light-purple mb-6">To heal from something, we must be able to name it. This could be their name, a nickname, or a word that represents this time (e.g., "The Lesson"). This is for your eyes only.</p>
        <input type="text" name="exName" value={exName} onChange={onExNameChange} placeholder="What should we call this chapter?" className="bg-white/20 border-2 border-transparent focus:border-white focus:ring-0 rounded-lg p-3 text-center text-white placeholder-white/70"/>
    </div>
);

const ShreddedText: React.FC<{ text: string }> = ({ text }) => (
    <div className="text-xl italic text-center break-words h-48 overflow-hidden relative">
        {text.split('').map((char, index) => (
            <span key={index} className="inline-block animate-shred-fall" style={{ animationDelay: `${index * 10}ms` }}>
                {char === ' ' ? '\u00A0' : char}
            </span>
        ))}
    </div>
);

const ReleaseThoughtScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [ventText, setVentText] = useState('');
    const [isShredding, setIsShredding] = useState(false);

    const handleShred = () => {
        if (!ventText.trim()) return;
        setIsShredding(true);
        setTimeout(() => {
            onComplete();
        }, 2000); // Allow time for animation + buffer
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-2 text-center">A Ritual of Release</h2>
            <p className="text-sm text-brand-light-purple mb-6 text-center">Write down one painful thought or memory. We will digitally shred it, symbolizing your first step in letting go.</p>
            <div className="bg-white/10 p-2 rounded-lg min-h-[200px] flex items-center justify-center overflow-hidden">
                {isShredding ? (
                   <ShreddedText text={ventText} />
                ) : (
                    <textarea
                        value={ventText}
                        onChange={(e) => setVentText(e.target.value)}
                        placeholder="Let one thing go..."
                        className="w-full h-48 p-3 bg-transparent text-white placeholder-white/50 focus:outline-none resize-none text-center"
                    />
                )}
            </div>
            <button onClick={handleShred} disabled={isShredding || !ventText.trim()} className="mt-4 w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 disabled:bg-red-800 disabled:opacity-50 transition-colors">
                {isShredding ? 'Releasing...' : 'Shred This Thought'}
            </button>
        </div>
    );
};

const ShieldListScreen: React.FC<{ list: string[], onChange: (index: number, value: string) => void }> = ({ list, onChange }) => (
    <div>
        <h2 className="text-2xl font-bold mb-2">Your Shield List</h2>
        <p className="text-sm text-brand-light-purple mb-6">List 5 painful truths about your ex or the relationship. We'll show you these in moments of weakness.</p>
        <div className="space-y-2">
            {list.map((item, index) => (
                <input
                    key={index}
                    type="text"
                    value={item}
                    onChange={(e) => onChange(index, e.target.value)}
                    placeholder={`Painful Truth #${index + 1}`}
                    className="w-full bg-white/20 border-2 border-transparent focus:border-white focus:ring-0 rounded-lg p-2 text-white placeholder-white/70"
                />
            ))}
        </div>
    </div>
);

const BaselineScreen: React.FC<{ data: UserData['baseline'], setData: React.Dispatch<React.SetStateAction<UserData>> }> = ({ data, setData }) => {
    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setData(prev => ({...prev, baseline: {...prev.baseline, [name]: Number(value)}}))
    }
    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Baseline Check-in</h2>
            <p className="text-sm text-brand-light-purple mb-6">How are you feeling right now?</p>
            <div className="space-y-6">
                <label className="block">Mood (😔 to 🙂)</label>
                <input type="range" name="mood" min="1" max="10" value={data.mood} onChange={handleSliderChange} className="w-full" />
                <label className="block">Anxiety Level</label>
                <input type="range" name="anxiety" min="1" max="10" value={data.anxiety} onChange={handleSliderChange} className="w-full" />
                <label className="block">Urge to Contact Them</label>
                <input type="range" name="urge" min="1" max="10" value={data.urge} onChange={handleSliderChange} className="w-full" />
            </div>
        </div>
    );
};


const ProgramChoiceScreen: React.FC<{onSelect: (p: UserData['program']) => void, selected: UserData['program']}> = ({ onSelect, selected }) => {
    const programs = [
        { id: 'healing', title: 'Calm Healing', desc: 'Meditations and journaling to process emotions.' },
        { id: 'glow-up', title: 'Glow-Up Challenge', desc: 'Fitness, hydration, and self-care tasks.' },
        { id: 'no-contact', title: 'No Contact Bootcamp', desc: 'Tools and streaks to manage urges.' },
    ];

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Choose Your 30-Day Program</h2>
            <div className="space-y-3">
                {programs.map(p => (
                    <button key={p.id} onClick={() => onSelect(p.id as UserData['program'])} className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${selected === p.id ? 'bg-brand-teal border-transparent' : 'bg-white/10 border-white/20 hover:border-white'}`}>
                        <h3 className="font-bold">{p.title}</h3>
                        <p className="text-sm text-white/80">{p.desc}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};


export default Onboarding;