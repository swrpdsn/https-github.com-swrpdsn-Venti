import { supabase, supabaseUrl, supabaseAnonKey } from './supabaseClient';
import { ChatMessage, JournalEntry, MoodEntry, UserData } from '../types';

// Helper for making secure, manual fetch requests to Supabase functions
const invokeFunction = async (functionName: string, body: object) => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) throw new Error('Could not get user session.');
    if (!session) throw new Error('User not authenticated.');

    const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            'apikey': supabaseAnonKey,
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(errorBody.error || `Function invocation failed with status ${response.status}`);
    }

    return response.json();
};


export const getAIResponse = async (
    newMessage: string, 
    history: ChatMessage[], 
    userData: UserData
): Promise<string> => {
    try {
        const body = { newMessage, history, userData };
        const data = await invokeFunction('get-ai-response', body);
        return data.text; 
    } catch (error) {
        console.error("Error invoking get-ai-response function:", error);
        return "I'm having a little trouble connecting right now. Please try again in a moment.";
    }
};

export const getAIWeeklySummary = async (entries: JournalEntry[], moods: MoodEntry[]): Promise<string> => {
    try {
        const body = { entries, moods };
        const data = await invokeFunction('get-ai-weekly-summary', body);
        return data.text;
    } catch (error) {
        console.error("Error invoking get-ai-weekly-summary function:", error);
        return "I'm having a little trouble generating your summary right now. Please try again in a moment.";
    }
};

export const getAICommunityChatResponse = async (history: {name: string, text: string}[]): Promise<{name: string, text: string}[]> => {
    try {
        const body = { history };
        const data = await invokeFunction('get-ai-community-chat', body);
        return data;
    } catch (error) {
        console.error("Error invoking get-ai-community-chat function:", error);
        return [{ name: "Venti", text: "It seems our group is a little quiet right now. Please try again in a moment." }];
    }
};

export const getAICommunityStory = async (topic: string): Promise<string> => {
    try {
        const body = { topic };
        const data = await invokeFunction('get-ai-community-story', body);
        return data.text;
    } catch (error) {
        console.error("Error invoking get-ai-community-story function:", error);
        return "I'm having trouble recalling a story right now. Please try again in a moment.";
    }
};