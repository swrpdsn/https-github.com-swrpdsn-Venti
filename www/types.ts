// Fix: Import types from React to resolve namespace errors.
import type { Dispatch, SetStateAction } from 'react';

export type Screen = 'home' | 'journal' | 'chat' | 'programs' | 'sos' | 'more' | 'community-chat' | 'community-stories' | 'my-stories' | 'story-editor' | 'learn';
export type Program = 'healing' | 'glow-up' | 'no-contact';

export interface UserData {
  name: string;
  onboardingComplete: boolean;
  breakupContext: {
    role: 'dumpee' | 'dumper' | 'mutual' | '';
    initiator: 'me' | 'them' | 'mutual' | '';
    reason: string;
    redFlags: 'yes' | 'no' | 'unsure' | '';
    feelings: string[];
  };
  exName: string;
  shieldList: string[];
  baseline: {
    mood: number;
    sleep: number;
    anxiety: number;
    urge: number;
  };
  program: Program | null;
  programDay: number;
  lastTaskCompletedDate: string | null;
  journalEntries: JournalEntry[];
  myStories: MyStory[];
  moods: MoodEntry[];
  streaks: {
    noContact: number;
    journaling: number;
    selfCare: number;
  };
  emergencyContact: {
    name: string;
    phone: string;
  };
  chatHistory: ChatMessage[];
}

export interface JournalEntry {
  id: string;
  date: string;
  prompt?: string;
  content: string;
  mood: number;
}

export interface MyStory {
  id: string;
  date: string;
  title: string;
  content: string;
}

export interface MoodEntry {
  date: string; // YYYY-MM-DD
  mood: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface CommunityChatMessage {
  id: number;
  name: string; // 'You', 'Liam', 'Chloe', 'Maya', etc.
  text: string;
}

export interface AppContextType {
    // Fix: Changed userData to be non-nullable to match the state from useLocalStorage and resolve spread operator type errors.
    userData: UserData;
    setUserData: Dispatch<SetStateAction<UserData>>;
    activeScreen: Screen;
    navigationStack: Screen[];
    navigateTo: (screen: Screen) => void;
    goBack: () => void;
    resetToScreen: (screen: Screen) => void;
    showSOS: boolean;
    setShowSOS: Dispatch<SetStateAction<boolean>>;
    activeStoryId: string | null;
    setActiveStoryId: Dispatch<SetStateAction<string | null>>;
}