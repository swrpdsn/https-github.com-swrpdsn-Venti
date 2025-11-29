import React, { useState, createContext, useEffect, Dispatch, SetStateAction } from 'react';
import { UserData, Screen, UserProfile } from './types';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './services/supabaseClient';

import Onboarding from './components/Onboarding';
import HomeScreen from './screens/HomeScreen';
import JournalScreen from './screens/JournalScreen';
import AIChatScreen from './screens/AIChatScreen';
import ProgramsScreen from './screens/ProgramsScreen';
import LearnScreen from './screens/LearnScreen';
import MoreScreen from './screens/MoreScreen';
import SOSScreen from './screens/SOSScreen';
import CommunityChatScreen from './screens/CommunityChatScreen';
import CommunityStoriesScreen from './screens/CommunityStoriesScreen';
import MyStoriesScreen from './screens/MyStoriesScreen';
import StoryEditorScreen from './screens/StoryEditorScreen';
import AuthScreen from './screens/AuthScreen';
import LoadingScreen from './components/Loading';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import AccessDeniedScreen from './screens/AccessDeniedScreen';
import { HomeIcon, JournalIcon, ChatIcon, ProgramsIcon, MoreIcon, SOSIcon, ChevronLeftIcon, ShieldIcon } from './components/Icons';
import Card from './components/Card';

export const initialUserProfile: Omit<UserProfile, 'id'> = {
  name: '',
  role: 'user',
  onboardingComplete: false,
  anonymous_display_name: null,
  breakupContext: { role: '', initiator: '', reason: '', redFlags: '', feelings: [] },
  exName: '',
  shieldList: ['', '', '', '', ''],
  baseline: { mood: 5, sleep: 8, anxiety: 5, urge: 5 },
  program: null,
  programDay: 1,
  lastTaskCompletedDate: null,
  streaks: { noContact: 0, journaling: 0, selfCare: 0 },
  emergencyContact: { name: '', phone: '' },
};

export interface AppContextType {
    session: Session | null;
    user: User | null;
    userData: UserData | null;
    setUserData: Dispatch<SetStateAction<UserData | null>>;
    activeScreen: Screen;
    navigationStack: Screen[];
    navigateTo: (screen: Screen) => void;
    goBack: () => void;
    resetToScreen: (screen: Screen) => void;
    showSOS: boolean;
    setShowSOS: Dispatch<SetStateAction<boolean>>;
    activeStoryId: number | null;
    setActiveStoryId: Dispatch<SetStateAction<number | null>>;
}

export const AppContext = createContext<AppContextType | null>(null);

interface AppProps {
  adminMode?: boolean;
}

const App: React.FC<AppProps> = ({ adminMode = false }) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [initError, setInitError] = useState<string | null>(null);

  const [navigationStack, setNavigationStack] = useState<Screen[]>(['home']);
  const [showSOS, setShowSOS] = useState<boolean>(false);
  const [activeStoryId, setActiveStoryId] = useState<number | null>(null);
  const [theme, setTheme] = useState('theme-dusk');

  useEffect(() => {
    const hour = new Date().getHours();
    const currentTheme = hour >= 6 && hour < 18 ? 'theme-dawn' : 'theme-dusk';
    setTheme(currentTheme);
    document.documentElement.className = currentTheme;
  }, []);

  const handleUserSession = async (user: User) => {
    setLoading(true);
    setInitError(null); // Reset error on new attempt
    
    try {
        // --- 1. CRITICAL: Fetch or Create Profile ---
        let { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

        if (profileError) {
            console.error("Critical: Profile fetch error", profileError);
            // Don't throw immediately, try to proceed carefully or let the creation logic run
            // mostly commonly 'PGRST116' (row not found) is handled by maybeSingle, 
            // but connection errors need to be caught.
            if (profileError.code !== 'PGRST116') {
                 throw new Error(`Connection failed: ${profileError.message}`);
            }
        }
        
        // If no profile exists, try to create one
        if (!profile) {
            // We use a minimal insert to avoid schema conflicts if the DB is missing columns
            const { role, ...profileDefaults } = initialUserProfile;
            const newProfileData = {
                id: user.id,
                name: user.email?.split('@')[0] || 'Friend',
                role: 'user', 
                onboardingComplete: false
            };

            const { data: insertedProfile, error: insertError } = await supabase
                .from('profiles')
                .insert(newProfileData)
                .select()
                .single();

            if (insertError) {
                // Handle Race Condition: If trigger created profile between check and insert
                if (insertError.code === '23505') { 
                    const { data: retryProfile, error: retryError } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();
                    
                    if (retryError || !retryProfile) {
                        throw new Error(`Profile sync failed: ${retryError?.message}`);
                    }
                    profile = retryProfile;
                } else {
                    console.error("Critical: Profile creation error", insertError);
                    throw new Error(`Unable to create profile: ${insertError.message}. Check Database RLS policies.`);
                }
            } else {
                profile = insertedProfile;
            }
        }

        // --- 2. NON-CRITICAL: Fetch Auxiliary Data ---
        const [
            journalResult,
            moodsResult,
            myStoriesResult,
            chatHistoryResult
        ] = await Promise.all([
            supabase.from('journal_entries').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
            supabase.from('moods').select('*').eq('user_id', user.id).order('date', { ascending: false }),
            supabase.from('my_stories').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }),
            supabase.from('chat_history').select('*').eq('user_id', user.id).order('created_at', { ascending: true })
        ]);

        if (journalResult.error) console.warn("Warning: Failed to load journal", journalResult.error);
        
        // --- 3. ROBUST MERGE: Combine Defaults with DB Data ---
        const safeProfile = { ...initialUserProfile, ...(profile as UserProfile), id: user.id };

        const fullUserData: UserData = {
            ...safeProfile,
            journalEntries: journalResult.data || [],
            moods: moodsResult.data || [],
            myStories: myStoriesResult.data || [],
            chatHistory: chatHistoryResult.data || [],
        };
        
        setUserData(fullUserData);

    } catch (error: any) {
        console.error("FATAL SESSION ERROR:", error);
        // DO NOT LOG OUT AUTOMATICALLY. Show the error screen instead.
        setInitError(error.message || "An unexpected error occurred.");
    } finally {
        setLoading(false);
    }
  };


  useEffect(() => {
    const initializeSession = async () => {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
            console.warn("Session check error:", error);
            setInitError(error.message);
            setLoading(false);
            return;
        }
        
        setSession(session);
        if (session?.user) {
            await handleUserSession(session.user);
        } else {
            setLoading(false);
        }
    };

    initializeSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        setSession(session);
        if (event === 'SIGNED_IN' && session?.user) {
            if (!userData || userData.id !== session.user.id) {
                await handleUserSession(session.user);
            }
        } else if (event === 'SIGNED_OUT') {
            setUserData(null);
            setNavigationStack(['home']);
            setInitError(null);
            setLoading(false);
        }
    });

    return () => {
        subscription?.unsubscribe();
    };
  }, []); 

  const activeScreen = navigationStack[navigationStack.length - 1];

  const navigateTo = (screen: Screen) => {
    setNavigationStack(stack => [...stack, screen]);
  };

  const goBack = () => {
    if (navigationStack.length > 1) {
      setNavigationStack(stack => stack.slice(0, -1));
    }
  };

  const resetToScreen = (screen: Screen) => {
    setNavigationStack([screen]);
  };

  const handleOnboardingComplete = async (profileData: UserProfile) => {
    const finalProfileData = { ...profileData, onboardingComplete: true };
    setUserData(prev => prev ? ({ ...prev, ...finalProfileData }) : null);
    const { error } = await supabase.from('profiles').upsert(finalProfileData);
    if (error) {
        console.error("Error saving profile:", error);
        alert("Issue saving profile: " + error.message);
    }
  };
  
  const backgroundClass = theme === 'theme-dawn'
    ? 'bg-gradient-to-br from-dawn-bg-start to-dawn-bg-end'
    : 'bg-gradient-to-br from-dusk-bg-start to-dusk-bg-end';

  const contextValue: AppContextType = {
      session,
      user: session?.user || null,
      userData,
      setUserData,
      activeScreen: adminMode ? 'admin-dashboard' : activeScreen,
      navigationStack,
      navigateTo,
      goBack,
      resetToScreen,
      showSOS,
      setShowSOS,
      activeStoryId,
      setActiveStoryId
  };

  // --- RENDER STATES ---

  if (loading) {
      return <LoadingScreen />;
  }

  // FAIL-SAFE ERROR SCREEN
  if (initError) {
      return (
          <div className={`min-h-screen flex items-center justify-center p-6 ${backgroundClass}`}>
              <Card className="max-w-md w-full text-center">
                  <h2 className="text-2xl font-bold text-red-500 mb-4">Unable to Load Profile</h2>
                  <p className="mb-6 text-slate-600 dark:text-slate-300">
                      We encountered an error while loading your data. This is often due to a network issue or a database configuration setting.
                  </p>
                  <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6 break-words text-sm">
                      <strong className="font-bold">Error Details: </strong>
                      <span className="block sm:inline">{initError}</span>
                  </div>
                  <div className="flex flex-col gap-3">
                      <button 
                          onClick={() => session?.user && handleUserSession(session.user)} 
                          className="w-full bg-brand-teal text-white font-bold py-3 rounded-lg hover:bg-teal-600 transition-colors"
                      >
                          Retry Connection
                      </button>
                      <button 
                          onClick={async () => {
                              await supabase.auth.signOut();
                              setInitError(null);
                          }} 
                          className="w-full bg-slate-500 text-white font-bold py-3 rounded-lg hover:bg-slate-600 transition-colors"
                      >
                          Log Out
                      </button>
                  </div>
              </Card>
          </div>
      );
  }

  if (!session) {
    return <AuthScreen />;
  }

  // Admin Mode Logic
  if (adminMode) {
      if (!userData) return <LoadingScreen />;
      if (userData.role !== 'admin' && userData.role !== 'superadmin') return <AccessDeniedScreen />;
      return (
          <AppContext.Provider value={contextValue}>
              <div className={`min-h-screen font-sans flex flex-col h-screen transition-colors duration-500 ${backgroundClass} ${theme}`}>
                  <AdminHeader />
                  <main className="flex-1 overflow-y-auto p-4">
                      <AdminDashboardScreen />
                  </main>
              </div>
          </AppContext.Provider>
      );
  }
  
  // Onboarding Logic
  if (userData && !userData.onboardingComplete) {
    return <Onboarding onComplete={handleOnboardingComplete} initialData={userData} />;
  }
  
  // Main App Logic
  if (session && userData && userData.onboardingComplete) {
      const renderScreen = () => {
        switch (activeScreen) {
          case 'home': return <HomeScreen />;
          case 'journal': return <JournalScreen />;
          case 'chat': return <AIChatScreen />;
          case 'programs': return <ProgramsScreen />;
          case 'learn': return <LearnScreen />;
          case 'more': return <MoreScreen />;
          case 'community-group-simulation': return <CommunityChatScreen />;
          case 'community-stories': return <CommunityStoriesScreen />;
          case 'my-stories': return <MyStoriesScreen />;
          case 'story-editor': return <StoryEditorScreen />;
          case 'admin-dashboard': return <AdminDashboardScreen />;
          default: return <HomeScreen />;
        }
      };

      return (
        <AppContext.Provider value={contextValue}>
          <div className={`min-h-screen font-sans flex flex-col h-screen transition-colors duration-500 ${backgroundClass} ${theme}`}>
            {showSOS && <SOSScreen />}

            <Header />
            
            <main className="flex-1 overflow-y-auto p-4 pb-20">
              {renderScreen()}
            </main>

            <BottomNav />
          </div>
        </AppContext.Provider>
      );
  }

  // Fallback (should theoretically not be reached if loading logic is correct)
  return <LoadingScreen />;
};

const AdminHeader: React.FC = () => {
  const handleLogout = () => supabase.auth.signOut();
  const isDawn = document.documentElement.classList.contains('theme-dawn');
  const textColor = isDawn ? 'text-dawn-text' : 'text-dusk-text';
  const headerBg = isDawn ? 'bg-white/20' : 'bg-black/20';
  
  return (
    <header className={`flex items-center justify-between p-4 ${headerBg} backdrop-blur-sm sticky top-0 z-10`}>
      <div className="flex items-center space-x-2">
        <ShieldIcon className={`w-6 h-6 ${textColor}`} />
        <h1 className={`text-xl font-bold ${textColor}`}>Venti Admin</h1>
      </div>
      <div>
        <button 
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1.5 rounded-full font-bold flex items-center space-x-1.5 shadow-md hover:bg-red-600 transition-colors"
          aria-label="Log out"
        >
          <span>Log Out</span>
        </button>
      </div>
    </header>
  );
};


const Header: React.FC = () => {
  const context = React.useContext(AppContext);
  if (!context) return null;
  const { setShowSOS, goBack, activeScreen } = context;

  const isTabScreen = ['home', 'journal', 'chat', 'programs', 'learn', 'more', 'admin-dashboard'].includes(activeScreen);
  const isDawn = document.documentElement.classList.contains('theme-dawn');

  const textColor = isDawn ? 'text-dawn-text' : 'text-dusk-text';
  const buttonBg = isDawn ? 'hover:bg-black/10' : 'hover:bg-white/10';


  return (
    <header className="grid grid-cols-3 items-center p-4 bg-transparent sticky top-0 z-10">
      <div className="justify-self-start">
        {!isTabScreen && (
          <button onClick={goBack} className={`p-2 rounded-full ${buttonBg} transition-colors`} aria-label="Go back">
            <ChevronLeftIcon className={`w-6 h-6 ${textColor}`} />
          </button>
        )}
      </div>
      <div className="flex items-center justify-self-center">
        <h1 className={`text-xl font-bold ${textColor}`}>Venti</h1>
      </div>
      <div className="justify-self-end">
        <button 
          onClick={() => setShowSOS(true)}
          className="bg-red-500 text-white px-3 py-1.5 rounded-full font-bold flex items-center space-x-1.5 shadow-md hover:bg-red-600 transition-colors"
          aria-label="Open crisis support menu"
          >
          <SOSIcon className="w-5 h-5" />
          <span>SOS</span>
        </button>
      </div>
    </header>
  );
};

const BottomNav: React.FC = () => {
  const context = React.useContext(AppContext);
  if (!context) return null;
  const { activeScreen, resetToScreen, userData } = context;

  const navItems: { screen: Screen, label: string, icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
    { screen: 'home', label: 'Home', icon: HomeIcon },
    { screen: 'journal', label: 'Journal', icon: JournalIcon },
    { screen: 'chat', label: 'AI Chat', icon: ChatIcon },
    { screen: 'programs', label: 'Program', icon: ProgramsIcon },
    { screen: 'more', label: 'More', icon: MoreIcon },
  ];

  if (userData?.role === 'admin' || userData?.role === 'superadmin') {
      const moreIndex = navItems.findIndex(item => item.screen === 'more');
      // Avoid duplicate admin tab if logic runs twice
      if (!navItems.find(i => i.screen === 'admin-dashboard')) {
        navItems.splice(moreIndex, 0, { screen: 'admin-dashboard', label: 'Admin', icon: ShieldIcon });
      }
  }
  
  const isDawn = document.documentElement.classList.contains('theme-dawn');
  const baseBg = isDawn ? 'bg-white/80' : 'bg-slate-800/60';
  const baseText = isDawn ? 'text-slate-600' : 'text-slate-300';
  const activeBg = isDawn ? 'bg-dawn-secondary/30' : 'bg-dusk-primary/30';
  const activeText = isDawn ? 'text-dawn-primary' : 'text-dusk-primary';
  const hoverBg = isDawn ? 'hover:bg-slate-100' : 'hover:bg-slate-700/80';


  return (
    <nav className={`fixed bottom-0 left-0 right-0 border-t backdrop-blur-md transition-colors duration-500 ${baseBg} ${isDawn ? 'border-slate-200' : 'border-slate-700'} flex justify-around p-2 z-10`}>
      {navItems.map((item) => (
        <button
          key={item.screen}
          onClick={() => resetToScreen(item.screen)}
          className={`flex flex-col items-center justify-center w-16 h-14 rounded-lg transition-colors ${
            activeScreen === item.screen ? `${activeBg} ${activeText}` : `${baseText} ${hoverBg}`
          }`}
        >
          <item.icon className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default App;