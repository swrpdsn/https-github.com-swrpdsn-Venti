import React from 'react';
import { supabase } from '../services/supabaseClient';
import Card from '../components/Card';
import { ShieldIcon } from '../components/Icons';

const AccessDeniedScreen: React.FC = () => {
    const isDawn = document.documentElement.classList.contains('theme-dawn');
    const textColor = isDawn ? 'text-dawn-text' : 'text-dusk-text';
    const subTextColor = isDawn ? 'text-slate-600' : 'text-slate-400';
    const buttonClass = isDawn ? 'bg-dawn-primary text-white hover:bg-dawn-primary/90' : 'bg-dusk-primary text-dusk-bg-start hover:bg-dusk-primary/90';
    const backgroundClass = isDawn
      ? 'bg-gradient-to-br from-dawn-bg-start to-dawn-bg-end'
      : 'bg-gradient-to-br from-dusk-bg-start to-dusk-bg-end';

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <div className={`min-h-screen font-sans flex flex-col items-center justify-center p-4 transition-colors duration-500 ${backgroundClass}`}>
            <Card className="text-center max-w-md">
                <ShieldIcon className={`w-16 h-16 mx-auto ${isDawn ? 'text-red-500' : 'text-red-400'}`} />
                <h1 className={`text-3xl font-bold mt-4 ${textColor}`}>Access Denied</h1>
                <p className={`mt-2 ${subTextColor}`}>You do not have the required permissions to access this page.</p>
                <div className="mt-6 flex flex-col sm:flex-row gap-2">
                    <button
                        onClick={() => window.location.href = '/'}
                        className={`w-full font-bold py-2 px-4 rounded-lg transition-colors ${buttonClass}`}
                    >
                        Go to Main App
                    </button>
                    <button
                        onClick={handleLogout}
                        className={`w-full font-bold py-2 px-4 rounded-lg transition-colors ${isDawn ? 'bg-slate-200 text-slate-700' : 'bg-slate-600 text-slate-200'}`}
                    >
                        Log Out
                    </button>
                </div>
            </Card>
        </div>
    );
};

export default AccessDeniedScreen;
