import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Auth functions
export const signUp = async (email: string, password: string, fullName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session?.user;
};

// Video functions
export const uploadVideo = async (userId: string, file: File, title: string, productType: string) => {
  const fileName = `${userId}/${Date.now()}-${file.name}`;
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("videos")
    .upload(fileName, file);

  if (uploadError) return { error: uploadError };

  const { data, error } = await supabase
    .from("videos")
    .insert({
      user_id: userId,
      title,
      file_path: uploadData.path,
      product_type: productType,
      status: "uploaded",
    })
    .select()
    .single();

  return { data, error };
};

export const getVideos = async (userId: string) => {
  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return { data, error };
};

export const getVideoAnalysis = async (videoId: string) => {
  const { data, error } = await supabase
    .from("video_analysis")
    .select("*")
    .eq("video_id", videoId)
    .single();

  return { data, error };
};

// Transcription functions
export const getTranscription = async (videoId: string) => {
  const { data, error } = await supabase
    .from("video_transcriptions")
    .select("*")
    .eq("video_id", videoId)
    .single();

  return { data, error };
};

// Subscription functions
export const getSubscription = async (userId: string) => {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();

  return { data, error };
};

export const getUserCredits = async (userId: string, productType: string) => {
  const { data, error } = await supabase
    .from("user_credits")
    .select("*")
    .eq("user_id", userId)
    .eq("product_type", productType)
    .single();

  return { data, error };
};

// Payment functions
export const recordPayment = async (
  userId: string,
  stripePaymentId: string,
  amount: number,
  productType: string,
  plan: string
) => {
  const { data, error } = await supabase
    .from("payments")
    .insert({
      user_id: userId,
      stripe_payment_id: stripePaymentId,
      product_type: productType,
      amount,
      status: "succeeded",
      subscription_plan: plan,
    })
    .select()
    .single();

  return { data, error };
};

export const getPaymentHistory = async (userId: string) => {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return { data, error };
};

// Initialize user credits
export const initializeUserCredits = async (userId: string) => {
  try {
    const response = await fetch("/api/init-user-credits", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    return await response.json();
  } catch (error) {
    console.error("Initialize credits error:", error);
    throw error;
  }
};

// Get user plan and credits
export const getUserPlan = async (userId: string) => {
  try {
    const response = await fetch(`/api/get-user-plan?userId=${userId}`);
    return await response.json();
  } catch (error) {
    console.error("Get user plan error:", error);
    throw error;
  }
};
