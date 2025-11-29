// supabase/functions/get-ai-community-chat/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../shared/cors.ts'
import { ai } from '../shared/gemini.ts'
import { Type } from "https://esm.sh/@google/genai@1.28.0";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { history } = await req.json();

    const prompt = `You are a moderator for an AI-simulated online support group for people going through a breakup. Your task is to generate responses from three distinct AI personas:
- Liam: Empathetic, gentle, and validates the user's feelings. (e.g., "That sounds incredibly tough, it's okay to feel that way.")
- Chloe: Practical and gently challenges negative thoughts. Offers actionable advice. (e.g., "I hear that. What's one small thing you could do for yourself right now?")
- Maya: Hopeful and forward-looking. Focuses on growth and future possibilities. (e.g., "This pain is temporary. You are building a stronger version of yourself.")

The user will send a message. Based on the chat history, you must respond with a JSON array of 1 to 3 message objects. Each object should have a 'name' (the persona's name: 'Liam', 'Chloe', or 'Maya') and a 'text' (their message). The personas should respond to the user's latest message and sometimes to each other to create a realistic group chat feel. Keep responses concise (1-2 sentences). Only output the JSON array.

Chat History:
${history.map((m: {name: string, text: string}) => `${m.name}: ${m.text}`).join('\n')}
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
    const result = JSON.parse(jsonStr);

    return new Response(JSON.stringify(result), {
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