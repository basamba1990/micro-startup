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
    const { videoId, idea } = await req.json();

    if (!idea) {
      return new Response(
        JSON.stringify({ error: "Missing idea parameter" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Call OpenAI to generate LinkedIn script
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
            content: "You are a LinkedIn video script expert. Generate engaging, concise scripts optimized for LinkedIn videos.",
          },
          {
            role: "user",
            content: `Create a 60-second LinkedIn video script for this idea: "${idea}". 
            
            Return a JSON object with:
            - hook: A compelling opening line (max 20 words)
            - script: The full 60-second script
            - cta: A call-to-action (max 15 words)`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
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
        generated_hook: scriptData.hook,
        generated_cta: scriptData.cta,
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
