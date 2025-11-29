// supabase/functions/get-ai-response/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../shared/cors.ts'
import { ai } from '../shared/gemini.ts'
import { type UserData, type ChatMessage } from '../../../types.ts'

// The createPersonalizedSystemInstruction logic is now on the server
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


serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { newMessage, history, userData } = await req.json();
    
    const systemInstruction = createPersonalizedSystemInstruction(userData);

    const modelHistory = history.map((msg: ChatMessage) => ({
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
    
    return new Response(JSON.stringify({ text: response.text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});