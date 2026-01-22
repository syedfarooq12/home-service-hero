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
    const { idDocumentUrl, selfieUrl } = await req.json();
    
    if (!idDocumentUrl || !selfieUrl) {
      return new Response(
        JSON.stringify({ error: "Both ID document and selfie URLs are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Use AI vision to compare faces between ID document and selfie
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are an AI face verification expert. Your task is to analyze two images:
1. A government ID document containing a photo
2. A live selfie of a person

Compare the faces in both images and determine if they belong to the same person.

You MUST respond with a JSON object containing:
- "match": boolean (true if faces match, false otherwise)
- "confidence": number between 0 and 100 (how confident you are in the match)
- "analysis": string (brief explanation of your decision)
- "issues": array of strings (any issues detected like blurry image, face not visible, etc.)

Be thorough but reasonable. Consider that ID photos may be older and lighting conditions differ.
A confidence score above 75 is considered a verified match.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please compare these two images. The first is a government ID document and the second is a selfie. Determine if they show the same person."
              },
              {
                type: "image_url",
                image_url: { url: idDocumentUrl }
              },
              {
                type: "image_url",
                image_url: { url: selfieUrl }
              }
            ]
          }
        ],
        temperature: 0.1,
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
          JSON.stringify({ error: "AI service requires payment. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI verification service unavailable");
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No response from AI verification");
    }

    // Parse the AI response - extract JSON from the response
    let verificationResult;
    try {
      // Try to find JSON in the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        verificationResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      verificationResult = {
        match: false,
        confidence: 0,
        analysis: "Unable to process verification",
        issues: ["Failed to parse AI response"]
      };
    }

    return new Response(
      JSON.stringify({
        verified: verificationResult.match && verificationResult.confidence >= 75,
        confidence: verificationResult.confidence,
        analysis: verificationResult.analysis,
        issues: verificationResult.issues || [],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Face verification error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Verification failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
