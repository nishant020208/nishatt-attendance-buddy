import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('Unauthorized request - missing auth header');
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.log('Authentication failed');
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { imageData } = await req.json();

    // Validate image data
    if (!imageData || typeof imageData !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid image data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check base64 string size (approximately 10MB limit)
    const base64Length = imageData.replace(/^data:image\/\w+;base64,/, '').length;
    const sizeInBytes = (base64Length * 3) / 4;
    const maxSizeInBytes = 10 * 1024 * 1024; // 10MB

    if (sizeInBytes > maxSizeInBytes) {
      return new Response(JSON.stringify({ 
        error: 'Image size exceeds 10MB limit' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate base64 image format
    if (!imageData.match(/^data:image\/(png|jpeg|jpg|gif|webp);base64,/)) {
      return new Response(JSON.stringify({ 
        error: 'Invalid image format. Supported formats: PNG, JPEG, JPG, GIF, WEBP' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing timetable extraction', {
      userId: user.id.substring(0, 8),
      imageSizeKB: Math.round(sizeInBytes / 1024),
      timestamp: Date.now()
    });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are an expert at analyzing timetable images. Extract ALL information from this timetable image with maximum accuracy.

CRITICAL INSTRUCTIONS:
1. SUBJECTS: Extract EVERY subject visible in the timetable
   - Include the full subject name and its code/abbreviation
   - Look for subjects in ALL cells, headers, and labels
   - Common patterns: Subject names are often in full caps, codes are short (2-5 chars)
   - Don't miss any subject, even if it appears only once

2. TIMETABLE ENTRIES: Extract EVERY class schedule entry
   - Day: Must be one of Monday, Tuesday, Wednesday, Thursday, Friday, Saturday
   - Time: Extract in HH:MM format (24-hour). Common patterns: 09:05, 11:45, 14:00, etc.
   - Subject Code: Must match exactly with the codes from the subjects array
   - Look in EVERY cell of the timetable grid
   - If multiple classes happen at the same time on different days, create separate entries

3. HANDLING DIFFERENT FORMATS:
   - Grid format: Rows = time slots, Columns = days (or vice versa)
   - List format: Sequential entries with day/time/subject
   - Mixed format: Combination of the above
   - Look for time indicators (AM/PM, 24-hour format)
   - Look for day abbreviations (Mon, Tue, etc.) and expand them

4. QUALITY CHECKS:
   - Every subject in the subjects array must appear at least once in timetable entries
   - Every timetable entry's subjectCode must exist in the subjects array
   - Time should be realistic (typically between 07:00 and 20:00)
   - Extract ALL visible entries, don't skip any cells

5. SPECIAL CASES:
   - If a cell contains multiple subjects, create separate entries for each
   - If a subject has variants (like "Lab", "Lecture"), treat as separate if they have different codes
   - Ignore break times, lunch periods unless they're labeled as subjects
   
Please analyze the image thoroughly and extract EVERYTHING you can see.`
              },
              {
                type: "image_url",
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_timetable",
              description: "Extract timetable information from the image",
              parameters: {
                type: "object",
                properties: {
                  subjects: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Full subject name" },
                        code: { type: "string", description: "Subject code or abbreviation" }
                      },
                      required: ["name", "code"],
                      additionalProperties: false
                    }
                  },
                  timetable: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        day: { 
                          type: "string", 
                          enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                          description: "Day of the week"
                        },
                        subjectCode: { type: "string", description: "Subject code matching the subjects array" },
                        time: { type: "string", description: "Time in HH:MM format (24-hour)" }
                      },
                      required: ["day", "subjectCode", "time"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["subjects", "timetable"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_timetable" } }
      })
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.error("AI gateway error", { status: response.status });
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();

    console.log('Timetable extraction successful', {
      userId: user.id.substring(0, 8),
      timestamp: Date.now()
    });

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call in response");
    }

    const extractedData = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({ success: true, data: extractedData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error in extract-timetable function', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now()
    });
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to extract timetable" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
