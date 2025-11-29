import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
    const isDawn = document.documentElement.classList.contains('theme-dawn');
    const cardClass = isDawn 
      ? 'bg-white/70 border-white/20' 
      : 'bg-slate-800/40 border-white/10';

    return (
        <div className={`p-4 rounded-xl shadow-md backdrop-blur-sm border transition-colors duration-500 ${cardClass} ${className}`}>
            {children}
        </div>
    );
};

export default Card;