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
    const { videoId, transcript, jobTitle } = await req.json();

    if (!transcript || !jobTitle) {
      return new Response(
        JSON.stringify({ error: "Missing transcript or jobTitle" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Call OpenAI to analyze interview
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
            content: "You are an expert HR interviewer and communication analyst. Analyze interview transcripts and provide detailed feedback.",
          },
          {
            role: "user",
            content: `Analyze this interview transcript for a ${jobTitle} position:
            
            "${transcript}"
            
            Return a JSON object with:
            - clarity_score: 0-100 (how clear and articulate)
            - persuasion_score: 0-100 (how convincing)
            - emotion_score: 0-100 (emotional intelligence)
            - engagement_score: 0-100 (engagement level)
            - storytelling_score: 0-100 (storytelling ability)
            - feedback: Array of key feedback points
            - recommendation: Hiring recommendation`,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices[0].message.content;
    const analysisData = JSON.parse(content);

    // Update video analysis in Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    if (videoId) {
      await supabase.from("video_analysis").insert({
        video_id: videoId,
        clarity_score: analysisData.clarity_score,
        persuasion_score: analysisData.persuasion_score,
        emotion_score: analysisData.emotion_score,
        engagement_score: analysisData.engagement_score,
        storytelling_score: analysisData.storytelling_score,
        feedback: analysisData.feedback,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: analysisData,
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
