
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthScreen: React.FC = () => {
    // Views: 'login' (email/pass), 'phone', 'forgot_password'
    const [view, setView] = useState<'login' | 'phone' | 'forgot_password'>('login');
    
    // Email State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // Phone State
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);

    // UI State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    // --- Helpers ---
    const resetState = () => {
        setError(null);
        setMessage(null);
        setLoading(false);
    };

    // --- Email / Password Handlers ---
    const handleEmailAuth = async (action: 'login' | 'signup') => {
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (action === 'signup') {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                setMessage("Sign-up successful! Check your email to confirm.");
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            }
        } catch (error: any) {
            setError(error.message || "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.href.split('?')[0],
            });
            if (error) throw error;
            setMessage("Password reset link sent! Please check your email.");
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // --- Google OAuth Handler ---
    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin,
                },
            });
            if (error) throw error;
        } catch (error: any) {
            setError(error.message);
            setLoading(false);
        }
    };

    // --- Phone OTP Handlers ---
    const handleSendOtp = async () => {
        if (!phone) {
            setError("Please enter a valid phone number.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithOtp({ phone });
            if (error) throw error;
            setShowOtpInput(true);
            setMessage("OTP sent! Please check your phone.");
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) return;
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.verifyOtp({
                phone,
                token: otp,
                type: 'sms',
            });
            if (error) throw error;
            // Session handled by onAuthStateChange in App.tsx
        } catch (error: any) {
            setError(error.message);
            setLoading(false);
        }
    };

    // --- Styling Variables ---
    const isDawn = document.documentElement.classList.contains('theme-dawn');
    const backgroundClass = isDawn
      ? 'bg-gradient-to-br from-dawn-bg-start to-dawn-bg-end'
      : 'bg-gradient-to-br from-dusk-bg-start to-dusk-bg-end';
    const textColor = isDawn ? 'text-dawn-text' : 'text-dusk-text';
    const cardClass = isDawn ? 'bg-white/80' : 'bg-slate-800/50';
    const inputClass = `w-full p-3 border rounded-md focus:ring-2 focus:border-transparent ${isDawn ? 'bg-white border-slate-300 text-slate-800 focus:ring-dawn-primary' : 'bg-slate-900/50 border-slate-700 text-dusk-text focus:ring-dusk-primary'}`;
    const primaryBtn = isDawn ? 'bg-dawn-primary text-white hover:bg-dawn-primary/90' : 'bg-dusk-primary text-dusk-bg-start hover:bg-dusk-primary/90';
    const secondaryBtn = isDawn ? 'bg-dawn-secondary text-white hover:bg-dawn-secondary/90' : 'bg-dusk-secondary text-dusk-bg-start hover:bg-dusk-secondary/90';
    const googleBtn = 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50';

    // --- Render Components ---
    
    const GoogleButton = () => (
        <button 
            onClick={handleGoogleLogin} 
            disabled={loading}
            className={`w-full font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 ${googleBtn}`}
        >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Sign in with Google</span>
        </button>
    );

    const Divider = () => (
         <div className="flex items-center my-4">
            <div className={`flex-grow border-t ${isDawn ? 'border-slate-300' : 'border-slate-600'}`}></div>
            <span className={`flex-shrink-0 mx-4 text-sm ${isDawn ? 'text-slate-500' : 'text-slate-400'}`}>OR</span>
            <div className={`flex-grow border-t ${isDawn ? 'border-slate-300' : 'border-slate-600'}`}></div>
        </div>
    );

    const renderLoginForm = () => (
        <div className={`w-full max-w-sm p-8 rounded-xl shadow-md backdrop-blur-sm border border-white/10 ${cardClass}`}>
            <h2 className={`text-2xl font-bold text-center mb-6 ${textColor}`}>Welcome Back</h2>
            
            <div className="space-y-4">
                <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                />
                <div className="space-y-3 pt-2">
                    <button onClick={() => handleEmailAuth('login')} disabled={loading} className={`w-full font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 ${primaryBtn}`}>
                        {loading ? 'Processing...' : 'Log In'}
                    </button>
                    <button onClick={() => handleEmailAuth('signup')} disabled={loading} className={`w-full font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 ${secondaryBtn}`}>
                        Sign Up
                    </button>
                </div>
                
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                {message && <p className="text-green-500 text-sm text-center">{message}</p>}

                <div className="text-center space-y-2">
                     <button onClick={() => { setView('forgot_password'); resetState(); }} className={`text-sm hover:underline ${isDawn ? 'text-slate-600' : 'text-slate-400'}`}>
                        Forgot Password?
                    </button>
                </div>

                <Divider />

                <GoogleButton />
                
                <button onClick={() => { setView('phone'); resetState(); }} className={`w-full mt-3 py-3 rounded-lg border font-semibold transition-colors ${isDawn ? 'border-slate-300 text-slate-600 hover:bg-slate-50' : 'border-slate-600 text-slate-300 hover:bg-slate-800'}`}>
                    Use Phone Number
                </button>
            </div>
        </div>
    );

    const renderPhoneForm = () => (
        <div className={`w-full max-w-sm p-8 rounded-xl shadow-md backdrop-blur-sm border border-white/10 ${cardClass}`}>
            <h2 className={`text-2xl font-bold text-center mb-6 ${textColor}`}>Phone Login</h2>
            <div className="space-y-4">
                {!showOtpInput ? (
                    <>
                        <p className={`text-sm text-center mb-4 ${isDawn ? 'text-slate-600' : 'text-slate-400'}`}>
                            Enter your phone number (e.g., +15550000000) to receive a one-time login code.
                        </p>
                        <input
                            type="tel"
                            placeholder="+1 555-555-5555"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className={inputClass}
                        />
                        <button onClick={handleSendOtp} disabled={loading} className={`w-full font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 ${primaryBtn}`}>
                            {loading ? 'Sending...' : 'Send Code'}
                        </button>
                    </>
                ) : (
                    <>
                         <p className={`text-sm text-center mb-4 ${isDawn ? 'text-slate-600' : 'text-slate-400'}`}>
                            Enter the code sent to {phone}
                        </p>
                        <input
                            type="text"
                            placeholder="123456"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className={`${inputClass} text-center text-xl tracking-widest`}
                            maxLength={6}
                        />
                         <button onClick={handleVerifyOtp} disabled={loading} className={`w-full font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 ${primaryBtn}`}>
                            {loading ? 'Verifying...' : 'Verify & Login'}
                        </button>
                         <button onClick={() => setShowOtpInput(false)} className={`w-full text-sm underline ${isDawn ? 'text-slate-600' : 'text-slate-400'}`}>
                            Change Phone Number
                        </button>
                    </>
                )}
                
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                {message && <p className="text-green-500 text-sm text-center">{message}</p>}

                <Divider />
                
                <button onClick={() => { setView('login'); resetState(); }} className={`w-full py-2 text-sm hover:underline ${isDawn ? 'text-slate-600' : 'text-slate-400'}`}>
                    Back to Email Login
                </button>
            </div>
        </div>
    );

    const renderForgotPassword = () => (
        <div className={`w-full max-w-sm p-8 rounded-xl shadow-md backdrop-blur-sm border border-white/10 ${cardClass}`}>
             <h2 className={`text-2xl font-bold text-center mb-6 ${textColor}`}>Reset Password</h2>
             <form onSubmit={handlePasswordReset} className="space-y-4">
                 <p className={`text-sm text-center ${isDawn ? 'text-slate-600' : 'text-slate-400'}`}>
                     Enter your email and we'll send you a link to reset your password.
                 </p>
                 <input
                     type="email"
                     placeholder="Email address"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className={inputClass}
                     required
                 />
                 <button type="submit" disabled={loading} className={`w-full font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 ${primaryBtn}`}>
                     {loading ? 'Sending...' : 'Send Reset Link'}
                 </button>

                 {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                 {message && <p className="text-green-500 text-sm text-center">{message}</p>}
                 
                 <div className="text-center mt-4">
                    <button onClick={() => { setView('login'); resetState(); }} className={`text-sm hover:underline ${isDawn ? 'text-slate-600' : 'text-slate-400'}`}>
                        Back to Log In
                    </button>
                </div>
             </form>
        </div>
    );

    return (
        <div className={`min-h-screen font-sans flex flex-col items-center justify-center p-4 transition-colors duration-500 ${backgroundClass}`}>
             <div className="text-center mb-8">
                <h1 className={`text-6xl font-thin tracking-[0.2em] uppercase ${isDawn ? 'text-dawn-text/80' : 'text-dusk-text/80'}`}>
                  VENTI
                </h1>
                <p className={`mt-2 text-lg tracking-wider italic ${isDawn ? 'text-dawn-text/80' : 'text-dusk-text/80'}`}>
                  Your healing journey starts here.
                </p>
            </div>
            
            {view === 'login' && renderLoginForm()}
            {view === 'phone' && renderPhoneForm()}
            {view === 'forgot_password' && renderForgotPassword()}
        </div>
    );
};

export default AuthScreen;
