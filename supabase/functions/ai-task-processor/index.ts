import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TaskRequest {
  type: 'text' | 'voice' | 'photo';
  content: string; // text message, base64 audio, or base64 image
  context?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, content, context } = await req.json() as TaskRequest;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let userMessage = '';
    let messages: any[] = [];

    const systemPrompt = `You are an AI assistant for HelpR that helps create tasks and service bookings. 

Your job is to analyze user input and extract actionable tasks or service booking requests.

For each input, respond with a JSON object containing:
{
  "tasks": [
    {
      "title": "Short task title",
      "description": "Detailed description",
      "category": "cleaning|plumbing|electrical|ac_appliance|painting|carpentry|pest_control|renovation|general",
      "priority": "low|medium|high",
      "type": "booking|todo",
      "suggestedDate": "YYYY-MM-DD or null",
      "estimatedDuration": "duration string or null"
    }
  ],
  "summary": "Brief summary of what was detected"
}

Categories:
- cleaning: House cleaning, deep cleaning, bathroom cleaning
- plumbing: Pipe repairs, leaks, drainage, water heater
- electrical: Wiring, switches, fans, electrical repairs
- ac_appliance: AC service, refrigerator, washing machine, appliances
- painting: Wall painting, interior/exterior painting
- carpentry: Furniture repair, woodwork, door/window fixes
- pest_control: Termites, cockroaches, bed bugs, rodents
- renovation: Home renovation, remodeling
- general: Personal tasks, reminders, other items

If it's a home service need, set type to "booking". For personal tasks, set type to "todo".
Always respond with valid JSON only.`;

    if (type === 'text') {
      userMessage = content;
      messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze this request and extract tasks: "${content}"` }
      ];
    } else if (type === 'voice') {
      // For voice, content is base64 audio - we'll use Gemini's multimodal capability
      userMessage = `[Voice transcription request]`;
      messages = [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: [
            { type: 'text', text: 'Listen to this audio and extract any tasks or service requests mentioned. Transcribe and analyze the content.' },
            { 
              type: 'input_audio', 
              input_audio: { 
                data: content, 
                format: 'wav' 
              } 
            }
          ]
        }
      ];
    } else if (type === 'photo') {
      // For photos, analyze the image for issues/tasks
      userMessage = `[Image analysis request]`;
      messages = [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: [
            { 
              type: 'text', 
              text: `Analyze this image and identify any home maintenance issues, repairs needed, or tasks visible. ${context ? `Context: ${context}` : ''}` 
            },
            { 
              type: 'image_url', 
              image_url: { 
                url: content.startsWith('data:') ? content : `data:image/jpeg;base64,${content}` 
              } 
            }
          ]
        }
      ];
    }

    console.log(`Processing ${type} request`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Usage limit reached. Please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiContent = data.choices[0].message.content;
    
    console.log('AI Response:', aiContent);

    // Parse the JSON response
    let parsedResponse;
    try {
      // Extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      parsedResponse = {
        tasks: [{
          title: 'New Task',
          description: aiContent,
          category: 'general',
          priority: 'medium',
          type: 'todo'
        }],
        summary: 'Created task from your input'
      };
    }

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-task-processor:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
