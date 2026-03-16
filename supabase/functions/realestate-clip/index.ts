import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { videoId, propertyDescription } = await req.json();

    if (!propertyDescription) {
      return new Response(
        JSON.stringify({ error: "Missing propertyDescription" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Call OpenAI to generate real estate marketing script
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert real estate marketing specialist. Create compelling property marketing scripts and highlights.",
          },
          {
            role: "user",
            content: `Create a 30-second marketing script for this property:
            
            "${propertyDescription}"
            
            Return a JSON object with:
            - script: A compelling 30-second marketing script
            - highlights: Array of 5 key selling points
            - seo_description: SEO-optimized description (max 160 chars)`,
          },
        ],
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices[0].message.content;
    const scriptData = JSON.parse(content);

    // Update video analysis in Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    if (videoId) {
      await supabase.from("video_analysis").insert({
        video_id: videoId,
        generated_script: scriptData.script,
        feedback: {
          highlights: scriptData.highlights,
          seo_description: scriptData.seo_description,
        },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: scriptData,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});
