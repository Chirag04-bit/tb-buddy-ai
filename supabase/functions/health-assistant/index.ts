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
    const { messages, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // System prompts based on type
    const systemPrompts = {
      symptom: `You are a caring and knowledgeable health assistant. Your role is to:
1. Listen to the user's symptoms with empathy
2. Ask clarifying questions when needed
3. Provide general health information and possible causes
4. Suggest home remedies when appropriate
5. Clearly indicate when professional medical attention is needed

IMPORTANT GUIDELINES:
- Always emphasize that this is educational information, not a diagnosis
- Be compassionate and reassuring
- Use simple, easy-to-understand language
- For serious symptoms (chest pain, difficulty breathing, severe bleeding, etc.), immediately advise seeking emergency care
- Remind users to consult healthcare professionals for proper diagnosis and treatment
- Do not prescribe specific medications or dosages

Be warm, supportive, and helpful while maintaining appropriate medical boundaries.`,
      
      default: `You are a helpful health assistant providing general health information and guidance. Always remind users that this information is educational and not a replacement for professional medical advice.`
    };

    const systemPrompt = systemPrompts[type as keyof typeof systemPrompts] || systemPrompts.default;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Service temporarily unavailable. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response. Please try again.';

    return new Response(
      JSON.stringify({ message: assistantMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Health assistant error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
