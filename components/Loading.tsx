import React from 'react';

const LoadingScreen: React.FC = () => {
    const isDawn = document.documentElement.classList.contains('theme-dawn');
    const backgroundClass = isDawn
    ? 'bg-gradient-to-br from-dawn-bg-start to-dawn-bg-end'
    : 'bg-gradient-to-br from-dusk-bg-start to-dusk-bg-end';
    
    const textColor = isDawn ? 'text-dawn-text/90' : 'text-dusk-text/90';

    return (
        <div className={`min-h-screen font-sans flex flex-col h-screen items-center justify-center transition-colors duration-500 ${backgroundClass}`}>
            <div className="relative w-24 h-24 flex items-center justify-center">
                 <div className="absolute w-full h-full bg-brand-light-purple rounded-full animate-breathe-in"></div>
                <div className="absolute w-full h-full bg-brand-teal rounded-full animate-breathe-out"></div>
            </div>
            <p className={`mt-8 text-xl font-semibold tracking-wider ${textColor}`}>Loading...</p>
        </div>
    );
};

export default LoadingScreen;
