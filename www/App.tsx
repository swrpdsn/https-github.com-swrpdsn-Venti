



import React, { useState, createContext, useMemo, useEffect } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { UserData, Screen, AppContextType } from './types';
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
import LandingScreen from './screens/LandingScreen';
import { HomeIcon, JournalIcon, ChatIcon, ProgramsIcon, MoreIcon, SOSIcon, ChevronLeftIcon } from './components/Icons';

export const initialUserData: UserData = {
  name: '',
  onboardingComplete: false,
  breakupContext: { role: '', initiator: '', reason: '', redFlags: '', feelings: [] },
  exName: '',
  shieldList: ['', '', '', '', ''],
  baseline: { mood: 5, sleep: 8, anxiety: 5, urge: 5 },
  program: null,
  programDay: 1,
  lastTaskCompletedDate: null,
  journalEntries: [],
  myStories: [],
  moods: [],
  streaks: { noContact: 0, journaling: 0, selfCare: 0 },
  emergencyContact: { name: '', phone: '' },
  chatHistory: [],
};

export const AppContext = createContext<AppContextType | null>(null);

const App: React.FC = () => {
  const [userData, setUserData] = useLocalStorage<UserData>('venti-user-data', initialUserData);
  const [navigationStack, setNavigationStack] = useState<Screen[]>(['home']);
  const [showSOS, setShowSOS] = useState<boolean>(false);
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [theme, setTheme] = useState('theme-dusk');
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    const currentTheme = hour >= 6 && hour < 18 ? 'theme-dawn' : 'theme-dusk';
    setTheme(currentTheme);
    document.documentElement.className = currentTheme;
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

  const contextValue = useMemo(() => ({
    userData,
    setUserData,
    activeScreen,
    navigationStack,
    navigateTo,
    goBack,
    resetToScreen,
    showSOS,
    setShowSOS,
    activeStoryId,
    setActiveStoryId
  }), [userData, setUserData, activeScreen, navigationStack, showSOS, setShowSOS, activeStoryId, setActiveStoryId]);

  const handleOnboardingComplete = (data: UserData) => {
    setUserData({ ...data, onboardingComplete: true });
  };
  
  const backgroundClass = theme === 'theme-dawn'
    ? 'bg-gradient-to-br from-dawn-bg-start to-dawn-bg-end'
    : 'bg-gradient-to-br from-dusk-bg-start to-dusk-bg-end';

  if (!userData.onboardingComplete) {
    if (showOnboarding) {
        return <Onboarding onComplete={handleOnboardingComplete} initialData={initialUserData} />;
    } else {
        return (
             <div className={`min-h-screen font-sans flex flex-col h-screen transition-colors duration-500 ${backgroundClass}`}>
                <LandingScreen onBegin={() => setShowOnboarding(true)} />
            </div>
        );
    }
  }

  const renderScreen = () => {
    switch (activeScreen) {
      case 'home': return <HomeScreen />;
      case 'journal': return <JournalScreen />;
      case 'chat': return <AIChatScreen />;
      case 'programs': return <ProgramsScreen />;
      case 'learn': return <LearnScreen />;
      case 'more': return <MoreScreen />;
      case 'community-chat': return <CommunityChatScreen />;
      case 'community-stories': return <CommunityStoriesScreen />;
      case 'my-stories': return <MyStoriesScreen />;
      case 'story-editor': return <StoryEditorScreen />;
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
};

const Header: React.FC = () => {
  const context = React.useContext(AppContext);
  if (!context) return null;
  const { setShowSOS, goBack, activeScreen } = context;

  const isTabScreen = ['home', 'journal', 'chat', 'programs', 'learn', 'more'].includes(activeScreen);
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
  const { activeScreen, resetToScreen } = context;

  const navItems: { screen: Screen, label: string, icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
    { screen: 'home', label: 'Home', icon: HomeIcon },
    { screen: 'journal', label: 'Journal', icon: JournalIcon },
    { screen: 'chat', label: 'AI Chat', icon: ChatIcon },
    { screen: 'programs', label: 'Program', icon: ProgramsIcon },
    { screen: 'more', label: 'More', icon: MoreIcon },
  ];
  
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