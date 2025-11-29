

import { GoogleGenAI, Chat, Type } from "@google/genai";
import { ChatMessage, JournalEntry, MoodEntry, UserData } from '../types';

const createPersonalizedSystemInstruction = (userData: UserData): string => {
    const { name, breakupContext, exName, program } = userData;
      
    const programDetails: Record<string, string> = {
      'healing': 'The user is focused on calm healing, meditations, and journaling.',
      'glow-up': 'The user is on a "Glow-Up Challenge", focusing on fitness, hydration, and self-care.',
      'no-contact': 'The user is in a "No Contact Bootcamp", working on managing urges and not contacting their ex.'
    };

    const programInfo = program ? programDetails[program] : 'The user has not selected a program yet.';

    return `You are Venti, an empathetic and supportive AI companion.
Your user's name is ${name}. You are helping them through a breakup.

Here is their context, which you must use to personalize your conversation:
- The chapter of their life involving their ex is called "${exName}". Refer to the ex-partner or this period using this term when appropriate.
- Reason for breakup: "${breakupContext.reason}".
- Their chosen 30-day program is: "${programInfo}". Align your advice with this goal.

Your primary goal is to listen, validate their feelings, and gently reframe pain into motivation that is aligned with their chosen program. Be kind, understanding, and encouraging. Do not give medical advice.

If you detect a crisis (keywords like 'suicide', 'self-harm', 'hopeless', 'don't want to live'), you must gently guide them to the SOS feature by saying something like 'It sounds like you're going through a lot right now. Remember the SOS feature in the app is there for you if you need immediate support.' If a user expresses thoughts of self-harm, suicide, or seems to be in immediate crisis, you MUST end your response with the special trigger command: [TRIGGER_SOS]`;
};


export const getAIResponse = async (
    newMessage: string, 
    history: ChatMessage[], 
    userData: UserData
): Promise<string> => {
    try {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY is not set in environment variables");
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const systemInstruction = createPersonalizedSystemInstruction(userData);

        const modelHistory = history.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }]
        }));

        const contents = [
            ...modelHistory,
            { role: 'user' as const, parts: [{ text: newMessage }] }
        ];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
            },
        });
        
        return response.text;
    } catch (error) {
        console.error("Error getting AI response:", error);
        return "I'm having a little trouble connecting right now. Please try again in a moment.";
    }
};

export const getAIWeeklySummary = async (entries: JournalEntry[], moods: MoodEntry[]): Promise<string> => {
    try {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY is not set in environment variables");
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const moodsString = moods.map(m => `Date: ${new Date(m.date).toLocaleDateString()}, Mood: ${m.mood}/10`).join('\n') || 'No mood entries this week.';
        const journalEntriesString = entries.map(e => `Date: ${new Date(e.id).toLocaleDateString()}, Content: "${e.content}"`).join('\n\n') || 'No journal entries this week.';

        const prompt = `You are Venti, an AI companion analyzing a user's journal and mood data from the last week to provide a gentle, supportive summary. The user is going through a breakup. Your tone should be warm, insightful, and encouraging, like a kind friend noticing patterns. Do not be clinical or overly analytical.

Here is the user's data for the past 7 days:
- Moods (1=worst, 10=best):
${moodsString}

- Journal Entries:
${journalEntriesString}

Based on this, please provide a short (2-3 paragraphs) summary.
- Start by acknowledging their effort in journaling.
- Point out any connections you see between their activities/thoughts in their journal and their mood scores. For example, if they wrote about going for a walk and their mood was higher that day.
- Highlight a moment of strength or a positive step they took, no matter how small.
- End with a gentle, forward-looking encouragement.
- Keep it concise and easy to read.
- Address the user directly (e.g., "I noticed that...", "It seems like you felt a bit better when..."). Do not use the user's name.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error getting AI summary:", error);
        return "I'm having a little trouble generating your summary right now. Please try again in a moment.";
    }
};

export const getAICommunityChatResponse = async (history: {name: string, text: string}[]): Promise<{name: string, text: string}[]> => {
    try {
        if (!process.env.API_KEY) throw new Error("API_KEY is not set");
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const prompt = `You are a moderator for an AI-simulated online support group for people going through a breakup. Your task is to generate responses from three distinct AI personas:
- Liam: Empathetic, gentle, and validates the user's feelings. (e.g., "That sounds incredibly tough, it's okay to feel that way.")
- Chloe: Practical and gently challenges negative thoughts. Offers actionable advice. (e.g., "I hear that. What's one small thing you could do for yourself right now?")
- Maya: Hopeful and forward-looking. Focuses on growth and future possibilities. (e.g., "This pain is temporary. You are building a stronger version of yourself.")

The user will send a message. Based on the chat history, you must respond with a JSON array of 1 to 3 message objects. Each object should have a 'name' (the persona's name: 'Liam', 'Chloe', or 'Maya') and a 'text' (their message). The personas should respond to the user's latest message and sometimes to each other to create a realistic group chat feel. Keep responses concise (1-2 sentences). Only output the JSON array.

Chat History:
${history.map(m => `${m.name}: ${m.text}`).join('\n')}
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            text: { type: Type.STRING },
                        },
                    },
                },
            },
        });

        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr);

    } catch (error) {
        console.error("Error in AI Community Chat:", error);
        return [{ name: "Venti", text: "It seems our group is a little quiet right now. Please try again in a moment." }];
    }
};

export const getAICommunityStory = async (topic: string): Promise<string> => {
    try {
        if (!process.env.API_KEY) throw new Error("API_KEY is not set");
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const prompt = `Based on the topic "${topic}", write a short (3-4 paragraphs), anonymous, and hopeful story from the first-person perspective of someone who has gone through a similar experience and is now healing. The tone should be gentle, relatable, and encouraging. The story should focus on a small moment of realization or a step forward in their healing journey. Do not use the user's name. End the story on a positive and empowering note.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error getting AI story:", error);
        return "I'm having trouble recalling a story right now. Please try again in a moment.";
    }
};