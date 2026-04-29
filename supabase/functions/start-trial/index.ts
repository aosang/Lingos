import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '@supabase/supabase-js/cors'

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")
  Deno.env.get("SB_PUBLISHABLE_KEY")
)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // your business logic. queries run as the caller
  return Response.json({ ok: true })
})