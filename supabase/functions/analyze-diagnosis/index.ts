import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { patientData, symptoms, labResults, imageData } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Starting TB diagnosis analysis...");

    // Build comprehensive prompt
    const systemPrompt = `You are a medical AI assistant specialized in tuberculosis detection and diagnosis. 
You analyze patient data, symptoms, and medical imaging to provide diagnostic insights.
Your analysis must be professional, evidence-based, and include appropriate disclaimers.

IMPORTANT: Always structure your response as a JSON object with the following fields:
- summary: string (brief overview of findings)
- findings: array of strings (specific observations)
- confidence: "low" | "medium" | "high"
- recommendation: string (next steps for the patient)
- disclaimer: string (medical disclaimer)`;

    const userPrompt = `Analyze the following patient case for tuberculosis:

PATIENT INFORMATION:
- Name: ${patientData.name}
- Age: ${patientData.age}
- Gender: ${patientData.gender}
- Symptom Duration: ${patientData.duration}
- Medical History: ${patientData.history || "None reported"}

SYMPTOMS:
${symptoms.join(", ")}

${labResults ? `LABORATORY RESULTS:\n${labResults}` : ""}

${imageData ? "A chest X-ray/CT scan image has been provided for analysis." : "No imaging provided."}

Please provide a comprehensive diagnostic analysis including:
1. Summary of findings
2. Key observations
3. Confidence level (low/medium/high)
4. Recommendations for next steps
5. Medical disclaimer

Format your response as a JSON object.`;

    // Build messages with multimodal content
    const messages: any[] = [
      { role: "system", content: systemPrompt }
    ];

    // Add text and image in the same user message if image is provided
    if (imageData) {
      messages.push({
        role: "user",
        content: [
          { type: "text", text: userPrompt },
          { type: "image_url", image_url: { url: imageData } }
        ]
      });
    } else {
      messages.push({
        role: "user",
        content: userPrompt
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
      } else {
        // Fallback structure if JSON parsing fails
        analysis = {
          summary: analysisText,
          findings: ["Analysis completed. Please review the summary."],
          confidence: "medium",
          recommendation: "Consult with a qualified healthcare professional for comprehensive evaluation.",
          disclaimer: "⚠️ This is an AI-based diagnostic suggestion, not a medical diagnosis. Always consult a qualified physician."
        };
      }
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      analysis = {
        summary: analysisText,
        findings: ["Analysis completed. Please review the summary."],
        confidence: "medium",
        recommendation: "Consult with a qualified healthcare professional for comprehensive evaluation.",
        disclaimer: "⚠️ This is an AI-based diagnostic suggestion, not a medical diagnosis. Always consult a qualified physician."
      };
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