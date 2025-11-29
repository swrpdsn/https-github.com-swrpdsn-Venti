import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = 'https://qytyhhntqlhofzyizlea.supabase.co';
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5dHloaG50cWxob2Z6eWl6bGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5ODY2NzUsImV4cCI6MjA3NzU2MjY3NX0.RzZlgdPXX6H421nNp5cSsWy0m9JEAykWoOW_uDsO--Q';

if (!supabaseUrl || !supabaseAnonKey) {
    const errorHTML = `
      <div style="background-color: #1e1b4b; color: #e2e8f0; font-family: sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1rem; text-align: center;">
        <div style="max-width: 600px;">
          <h1 style="font-size: 2rem; font-weight: bold; color: #c4b5fd; margin-bottom: 1rem;">Venti Configuration Error</h1>
          <p style="font-size: 1.125rem; line-height: 1.75; color: #cbd5e1; margin-bottom: 1.5rem;">The application cannot connect to its backend services. This is likely due to missing configuration.</p>
          <p style="margin-top: 1.5rem; font-size: 0.875rem; color: #94a3b8;">Please ensure the Supabase URL and Key are correctly set within the application code.</p>
        </div>
      </div>
    `;
    document.body.innerHTML = errorHTML;
    throw new Error("Supabase URL and Anon Key are not set. Application cannot start.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);