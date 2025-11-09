import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get user from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { patientData, symptoms, labResults, imageData } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Starting TB diagnosis analysis with image analysis...");

    // Build comprehensive prompt for TB diagnosis with lesion detection
    const analysisPrompt = `You are an expert TB (Tuberculosis) diagnostic assistant with advanced image analysis capabilities. Analyze the following patient data and provide a detailed assessment.

Patient Information:
- Name: ${patientData.name}
- Age: ${patientData.age}
- Gender: ${patientData.gender}
- Symptom Duration: ${patientData.duration}
${patientData.history ? `- Medical History: ${patientData.history}` : ''}

Symptoms: ${symptoms.join(', ')}
${labResults ? `Lab Results: ${labResults}` : ''}
${imageData ? 'Note: A chest X-ray or CT scan image has been provided for analysis. Please identify any visible lesions or abnormalities.' : ''}

Please provide a structured response in the following JSON format:
{
  "summary": "Brief summary of findings",
  "findings": ["finding 1", "finding 2", ...],
  "confidence": "low|medium|high",
  "confidenceScore": 85,
  "classification": "no_tb|possible_tb|likely_tb",
  "recommendation": "Detailed recommendation",
  "disclaimer": "Medical disclaimer",
  "lesions": [
    {
      "x": 0.3,
      "y": 0.4,
      "width": 0.15,
      "height": 0.12,
      "confidence": 0.85
    }
  ]
}

Classification Guide:
- "no_tb": No significant TB indicators found (<30% confidence)
- "possible_tb": Some TB indicators present, further testing recommended (30-70% confidence)
- "likely_tb": Strong TB indicators, immediate action required (>70% confidence)

If an X-ray image is provided, identify lesion locations as normalized coordinates (0-1 range) relative to image dimensions.
Focus on TB-specific indicators: upper lobe infiltrates, cavitary lesions, miliary patterns, pleural effusion.
Provide clear, actionable recommendations based on risk level.`;

    // Build messages with multimodal content
    const messages: any[] = [
      { role: "system", content: "You are a medical AI assistant specialized in tuberculosis detection and diagnosis with image analysis capabilities." }
    ];

    // Add text and image in the same user message if image is provided
    if (imageData) {
      messages.push({
        role: "user",
        content: [
          { type: "text", text: analysisPrompt },
          { type: "image_url", image_url: { url: imageData } }
        ]
      });
    } else {
      messages.push({
        role: "user",
        content: analysisPrompt
      });
    }

    // Call Lovable AI Gateway with multimodal support
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro", // Best for image analysis + medical reasoning
        messages: messages,
      }),
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
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error("AI analysis failed");
    }

    const aiResponse = await response.json();
    const analysisText = aiResponse.choices[0]?.message?.content;

    console.log("Analysis completed successfully");

    // Parse the AI response
    let analysis;
    try {
      // Try to extract JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
        // Ensure all required fields are present
        if (!analysis.confidenceScore) {
          analysis.confidenceScore = analysis.confidence === "high" ? 85 : analysis.confidence === "medium" ? 60 : 40;
        }
        if (!analysis.classification) {
          analysis.classification = analysis.confidence === "high" ? "likely_tb" : analysis.confidence === "medium" ? "possible_tb" : "no_tb";
        }
        if (!analysis.lesions) {
          analysis.lesions = [];
        }
      } else {
        // Fallback structure if JSON parsing fails
        analysis = {
          summary: analysisText,
          findings: ["Analysis completed. Please review the summary."],
          confidence: "medium",
          confidenceScore: 50,
          classification: "possible_tb",
          recommendation: "Consult with a qualified healthcare professional for comprehensive evaluation.",
          disclaimer: "⚠️ This is an AI-based diagnostic suggestion, not a medical diagnosis. Always consult a qualified physician.",
          lesions: []
        };
      }
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      analysis = {
        summary: analysisText.substring(0, 500),
        findings: ["Unable to parse structured response. Please review the summary."],
        confidence: "medium",
        confidenceScore: 50,
        classification: "possible_tb",
        recommendation: "Consult with a qualified healthcare professional for comprehensive evaluation.",
        disclaimer: "⚠️ This is an AI-based diagnostic suggestion, not a medical diagnosis. Always consult a qualified physician.",
        lesions: []
      };
    }

    // Save assessment to database
    try {
      const { error: dbError } = await supabaseClient
        .from('patient_assessments')
        .insert({
          user_id: user.id,
          patient_name: patientData.name,
          patient_age: patientData.age,
          patient_gender: patientData.gender,
          symptom_duration: patientData.duration,
          medical_history: patientData.history,
          symptoms: symptoms,
          lab_results: labResults,
          has_image: !!imageData,
          diagnosis_summary: analysis.summary,
          findings: analysis.findings,
          confidence: analysis.confidence,
          recommendation: analysis.recommendation
        });

      if (dbError) {
        console.error('Database error:', dbError);
        // Continue even if DB save fails
      } else {
        console.log("Assessment saved to database");
      }
    } catch (saveError) {
      console.error("Failed to save assessment:", saveError);
      // Continue even if save fails
    }

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-diagnosis:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Analysis failed" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
