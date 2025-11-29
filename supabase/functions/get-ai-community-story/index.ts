// supabase/functions/get-ai-community-story/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../shared/cors.ts'
import { ai } from '../shared/gemini.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { topic } = await req.json();
    
    const prompt = `Based on the topic "${topic}", write a short (3-4 paragraphs), anonymous, and hopeful story from the first-person perspective of someone who has gone through a similar experience and is now healing. The tone should be gentle, relatable, and encouraging. The story should focus on a small moment of realization or a step forward in their healing journey. Do not use the user's name. End the story on a positive and empowering note.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
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