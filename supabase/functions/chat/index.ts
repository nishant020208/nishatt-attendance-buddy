import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // With verify_jwt = true, JWT is already verified by Supabase
    // Extract user ID from JWT for logging purposes
    const authHeader = req.headers.get('Authorization');
    let userId = 'anonymous';
    
    if (authHeader) {
      try {
        const jwt = authHeader.replace('Bearer ', '');
        const payload = JSON.parse(atob(jwt.split('.')[1]));
        userId = payload.sub || 'unknown';
      } catch (e) {
        // If JWT parsing fails, continue with anonymous
      }
    }

    // Validate and sanitize input
    const requestData = await req.json();
    const { messages, timetable, subjects } = requestData;

    // Basic input validation
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid messages format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (messages.length > 50) {
      return new Response(JSON.stringify({ error: 'Too many messages' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate message content
    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        return new Response(JSON.stringify({ error: 'Invalid message format' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (typeof msg.content !== 'string' || msg.content.length > 5000) {
        return new Response(JSON.stringify({ error: 'Message content too long' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Validate arrays
    if (timetable && (!Array.isArray(timetable) || timetable.length > 100)) {
      return new Response(JSON.stringify({ error: 'Invalid timetable data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (subjects && (!Array.isArray(subjects) || subjects.length > 50)) {
      return new Response(JSON.stringify({ error: 'Invalid subjects data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const contextMessage = {
      role: 'system',
      content: `You are an intelligent attendance assistant. You have access to the student's timetable and attendance data.
      
Current timetable: ${timetable ? timetable.length + ' entries' : 'No timetable'}
Current subjects: ${subjects ? subjects.length + ' subjects' : 'No subjects'}

Help the student with questions about:
- Which classes to attend or bunk
- Current attendance percentages
- How many classes they can miss while maintaining 75% attendance
- Recommendations based on their attendance status
- Understanding their timetable

Be concise, helpful, and provide specific advice based on their actual data.`
    };

    console.log('Processing chat request', { 
      userId: userId.substring(0, 8),
      messageCount: messages.length,
      timestamp: Date.now()
    });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [contextMessage, ...messages],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'Payment required. Please add credits to your workspace.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.error('AI gateway error', { status: response.status });
      return new Response(JSON.stringify({ 
        error: 'Unable to process request' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chat function', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now()
    });
    return new Response(JSON.stringify({ 
      error: 'An error occurred processing your request' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
