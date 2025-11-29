// supabase/functions/admin-get-users/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../shared/cors.ts'

// Add type definition for the Deno global to resolve TypeScript error in non-Deno environments.
declare const Deno: {
    env: {
        get: (key: string) => string | undefined;
    };
};

serve(async (req) => {
  // Handle CORS preflight requests
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

    // 1. Create a Supabase client with the Auth context of the logged-in user.
    const userClient = createClient(
      supabaseUrl,
      anonKey,
      { global: { headers: { Authorization: authHeader } } }
    )

    // 2. Get the user's profile and check their role.
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("User not found");

    const { data: profile, error: profileError } = await userClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (profileError) throw profileError;

    if (profile.role !== 'admin' && profile.role !== 'superadmin') {
      return new Response(JSON.stringify({ error: 'Not authorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // 3. If authorized, create a service role client to fetch all users.
    const serviceClient = createClient(supabaseUrl, serviceRoleKey);
    
    const { data: profiles, error: profilesError } = await serviceClient.from('profiles').select('*');
    if (profilesError) throw profilesError;

    const { data: { users: authUsers }, error: authUsersError } = await serviceClient.auth.admin.listUsers();
    if (authUsersError) throw authUsersError;
    
    // Combine profile data with email from auth users
    const combinedUsers = profiles.map(p => {
        const authUser = authUsers.find(u => u.id === p.id);
        return {
            ...p,
            email: authUser?.email || 'N/A'
        };
    });

    return new Response(JSON.stringify({ users: combinedUsers }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in admin-get-users:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})