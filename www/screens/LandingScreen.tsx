import React from 'react';

interface LandingScreenProps {
  onBegin: () => void;
}

const LandingScreen: React.FC<LandingScreenProps> = ({ onBegin }) => {
  const isDawn = document.documentElement.classList.contains('theme-dawn');

  const buttonClass = isDawn
    ? 'bg-dawn-primary/80 text-white hover:bg-dawn-primary'
    : 'bg-dusk-primary/80 text-dusk-bg-start hover:bg-dusk-primary';
    
  const textColor = isDawn ? 'text-dawn-text/80' : 'text-dusk-text/80';

  return (
    <div className="flex flex-col items-center justify-between h-full p-8 text-center animate-fade-in">
      <div />
      <div>
        <h1 className={`text-7xl font-thin tracking-[0.2em] uppercase ${textColor}`}>
          VENTI
        </h1>
        <p className={`mt-4 text-xl tracking-wider italic ${textColor}`}>
          ...Just Breathe!
        </p>
      </div>
      <button
        onClick={onBegin}
        className={`w-full max-w-xs py-4 px-8 rounded-full font-bold text-lg shadow-lg transition-all duration-300 transform hover:scale-105 ${buttonClass}`}
      >
        Begin Your Journey
      </button>
    </div>
  );
};

export default LandingScreen;