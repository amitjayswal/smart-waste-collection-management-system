import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if environment variables are properly configured
if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url' || !supabaseUrl.startsWith('https://')) {
  console.error('❌ Supabase URL is not configured properly. Please update your .env file with your actual Supabase project URL.')
  console.log('📝 Your .env file should contain:')
  console.log('VITE_SUPABASE_URL=https://your-project-id.supabase.co')
  console.log('VITE_SUPABASE_ANON_KEY=your-anon-key')
  console.log('🔗 Get these values from: https://supabase.com/dashboard/project/your-project/settings/api')
}

if (!supabaseAnonKey || supabaseAnonKey === 'your_supabase_anon_key') {
  console.error('❌ Supabase Anonymous Key is not configured properly. Please update your .env file with your actual Supabase anonymous key.')
}

// Use fallback values to prevent the app from crashing
const fallbackUrl = 'https://placeholder.supabase.co'
const fallbackKey = 'placeholder-key'

export const supabase = createClient(
  supabaseUrl && supabaseUrl !== 'your_supabase_project_url' && supabaseUrl.startsWith('https://') 
    ? supabaseUrl 
    : fallbackUrl,
  supabaseAnonKey && supabaseAnonKey !== 'your_supabase_anon_key' 
    ? supabaseAnonKey 
    : fallbackKey
)

// Export a flag to check if Supabase is properly configured
export const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseUrl !== 'your_supabase_project_url' && 
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey && 
  supabaseAnonKey !== 'your_supabase_anon_key'