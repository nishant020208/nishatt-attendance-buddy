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
    const { imageData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log('Extracting timetable from image...');

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
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response:', JSON.stringify(data, null, 2));

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call in response");
    }

    const extractedData = JSON.parse(toolCall.function.arguments);
    console.log('Extracted timetable data:', extractedData);

    return new Response(
      JSON.stringify({ success: true, data: extractedData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error in extract-timetable function:', error);
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
