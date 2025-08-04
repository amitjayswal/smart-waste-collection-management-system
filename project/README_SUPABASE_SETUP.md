# Complete Supabase Setup Guide

This guide will walk you through setting up Supabase to work with your ESP32 Smart Waste Management system.

## Step 1: Create a Supabase Project

1. **Go to [supabase.com](https://supabase.com)**
2. **Click "Start your project"**
3. **Sign up/Login** with GitHub, Google, or email
4. **Create a new project:**
   - Organization: Choose or create one
   - Project name: `smart-waste-management`
   - Database password: Create a strong password (save this!)
   - Region: Choose closest to your location
   - Click "Create new project"

## Step 2: Get Your Project Credentials

1. **In your Supabase dashboard, go to Settings → API**
2. **Copy these values:**
   - Project URL (looks like: `https://abcdefghijklmnop.supabase.co`)
   - Anon public key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Step 3: Configure Your Local Environment

1. **In VS Code, create a `.env` file in your project root:**
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

2. **Replace the values with your actual Supabase credentials**

## Step 4: Set Up the Database

1. **In Supabase dashboard, go to SQL Editor**
2. **Click "New query"**
3. **Copy and paste the SQL from `supabase/migrations/create_bin_updates_table.sql`**
4. **Click "Run" to create the table**

## Step 5: Deploy the Edge Function

1. **In Supabase dashboard, go to Edge Functions**
2. **Click "Create a new function"**
3. **Name it: `update-bin`**
4. **Replace the default code with the content from `supabase/functions/update-bin/index.ts`**
5. **Click "Deploy function"**

## Step 6: Test the Setup

1. **In VS Code terminal, run:**
   ```bash
   npm install
   npm run dev
   ```

2. **Open your browser to the local development URL**
3. **Check the status panels:**
   - Database status should show "Connected"
   - ESP32 status will show "Waiting for ESP32 data"

4. **Click "Test ESP32 Update" button to simulate data**

## Step 7: Configure Your ESP32

1. **Update your ESP32 code with these values:**
   ```cpp
   // Replace these with your actual values
   const char* serverURL = "https://your-project-id.supabase.co/functions/v1/update-bin";
   const char* apiKey = "your-anon-key-here";
   ```

2. **Upload the code to your ESP32**

## Step 8: Verify Real-time Updates

1. **Upload the ESP32 code and open Serial Monitor**
2. **Watch for successful data transmission messages**
3. **Check your web application - bin #1001 should update in real-time**

## Troubleshooting

### Database Connection Issues
- Verify your `.env` file has correct credentials
- Check that the table was created successfully
- Ensure RLS policies are set up correctly

### ESP32 Connection Issues
- Verify WiFi credentials in ESP32 code
- Check that the Supabase URL and API key are correct
- Monitor Serial output for HTTP response codes

### Edge Function Issues
- Check the function logs in Supabase dashboard
- Verify the function is deployed and active
- Test the endpoint directly with a tool like Postman

## Data Flow Summary

1. **ESP32** → Sends HTTP POST to `/functions/v1/update-bin`
2. **Edge Function** → Validates data and saves to database
3. **Frontend** → Subscribes to real-time database changes
4. **UI Updates** → Automatically when new data arrives

## Security Notes

- The anon key is safe to use in client-side code
- RLS policies control data access
- All data is validated before saving
- CORS is properly configured for web access

## Next Steps

Once everything is working:
1. Remove the "Test ESP32 Update" button for production
2. Add error handling and retry logic to ESP32 code
3. Consider adding data visualization and historical charts
4. Set up alerts for critical bin levels