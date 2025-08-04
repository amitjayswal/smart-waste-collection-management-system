import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface BinUpdateData {
  binId: number;
  fillLevel: number;
  batteryLevel?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { binId, fillLevel, batteryLevel }: BinUpdateData = await req.json()

    // Validate input data
    if (!binId || fillLevel === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: binId and fillLevel' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (fillLevel < 0 || fillLevel > 100) {
      return new Response(
        JSON.stringify({ error: 'Fill level must be between 0 and 100' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Determine status based on fill level
    let status = 'normal'
    if (fillLevel >= 80) {
      status = 'critical'
    } else if (fillLevel >= 50) {
      status = 'warning'
    }

    // Insert data into Supabase database
    const { data, error } = await supabase
      .from('bin_updates')
      .insert({
        bin_id: binId,
        fill_level: fillLevel,
        battery_level: batteryLevel || 100,
        status: status
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to save data to database',
          details: error.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create response data
    const responseData = {
      success: true,
      binId,
      fillLevel,
      status,
      batteryLevel: batteryLevel || 100,
      timestamp: data.created_at,
      message: `Bin ${binId} updated successfully`,
      databaseId: data.id
    }

    console.log(`Bin ${binId} updated: ${fillLevel}% fill level, status: ${status}`)

    return new Response(
      JSON.stringify(responseData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error processing bin update:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})