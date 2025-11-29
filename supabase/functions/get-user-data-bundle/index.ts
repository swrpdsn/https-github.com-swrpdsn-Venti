// supabase/functions/get-user-data-bundle/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../shared/cors.ts'
import { type UserProfile } from '../../../types.ts'

// Add type definition for the Deno global to resolve TypeScript error in non-Deno environments.
declare const Deno: {
    env: {
        get: (key: string) => string | undefined;
    };
};

// Copied from App.tsx to make the function self-contained
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Ensure essential environment variables are set
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
        throw new Error('Missing required Supabase environment variables in Edge Function.');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userClient = createClient(
      supabaseUrl,
      anonKey,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("User not found from JWT.");

    const serviceClient = createClient(supabaseUrl, serviceRoleKey);
    
    // Step 1: Get or create profile
    let { data: profile, error: selectError } = await serviceClient
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
    
    if (selectError && selectError.code !== 'PGRST116') throw selectError;
    
    if (!profile) {
        const { role, ...profileDefaults } = initialUserProfile;
        const newProfileData = {
            id: user.id,
            ...profileDefaults,
            name: user.email?.split('@')[0] || 'Friend',
        };

        const { data: insertedProfile, error: insertError } = await serviceClient
            .from('profiles')
            .insert(newProfileData)
            .select()
            .single();

        if (insertError) throw insertError;
        profile = insertedProfile;
    }

    // Step 2: Get all other data
    const [
        { data: journalEntries, error: journalError },
        { data: moods, error: moodsError },
        { data: myStories, error: storiesError },
        { data: chatHistory, error: chatError }
    ] = await Promise.all([
        serviceClient.from('journal_entries').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        serviceClient.from('moods').select('*').eq('user_id', user.id).order('date', { ascending: false }),
        serviceClient.from('my_stories').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }),
        serviceClient.from('chat_history').select('*').eq('user_id', user.id).order('created_at', { ascending: true })
    ]);

    if (journalError || moodsError || storiesError || chatError) {
        console.error('Error fetching user data parts in edge function:', { journalError, moodsError, storiesError, chatError });
    }

    // Step 3: Assemble and return the full UserData object
    const fullUserData = {
        ...profile,
        journalEntries: journalEntries || [],
        moods: moods || [],
        myStories: myStories || [],
        chatHistory: chatHistory || [],
    };

    return new Response(JSON.stringify(fullUserData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in get-user-data-bundle:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})