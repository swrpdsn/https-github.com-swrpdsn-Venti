// supabase/functions/get-ai-weekly-summary/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../shared/cors.ts'
import { ai } from '../shared/gemini.ts'
import { type JournalEntry, type MoodEntry } from '../../../types.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { entries, moods } = await req.json();
        
    const moodsString = moods.map((m: MoodEntry) => `Date: ${new Date(m.date).toLocaleDateString()}, Mood: ${m.mood}/10`).join('\n') || 'No mood entries this week.';
    const journalEntriesString = entries.map((e: JournalEntry) => `Date: ${new Date(e.created_at).toLocaleDateString()}, Content: "${e.content}"`).join('\n\n') || 'No journal entries this week.';

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