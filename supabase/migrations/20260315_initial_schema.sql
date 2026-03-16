-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Videos table
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  file_path TEXT,
  product_type TEXT, -- linkedin_ghost / recruit_audit / realestate_clip
  status TEXT DEFAULT 'uploaded', -- uploaded / processing / completed / failed
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Video Transcriptions
CREATE TABLE video_transcriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  transcript TEXT,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMP DEFAULT now()
);

-- AI Analysis / Scores
CREATE TABLE video_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  clarity_score INT,
  persuasion_score INT,
  emotion_score INT,
  engagement_score INT,
  storytelling_score INT,
  feedback JSONB,
  generated_script TEXT,
  generated_hook TEXT,
  generated_cta TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Payments / Subscriptions
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_payment_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  product_type TEXT, -- linkedin_ghost / recruit_audit / realestate_clip / subscription
  amount NUMERIC(10, 2),
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending', -- pending / succeeded / failed
  subscription_plan TEXT, -- freemium / pro / enterprise
  created_at TIMESTAMP DEFAULT now()
);

-- User Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT DEFAULT 'freemium', -- freemium / pro / enterprise
  status TEXT DEFAULT 'active', -- active / canceled / expired
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- User Credits / Usage
CREATE TABLE user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_type TEXT, -- linkedin_ghost / recruit_audit / realestate_clip
  credits_available INT DEFAULT 0,
  credits_used INT DEFAULT 0,
  reset_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_videos_product_type ON videos(product_type);
CREATE INDEX idx_transcriptions_video_id ON video_transcriptions(video_id);
CREATE INDEX idx_analysis_video_id ON video_analysis(video_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_credits_user_id ON user_credits(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_transcriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- RLS Policies for videos
CREATE POLICY "Users can view their own videos" ON videos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own videos" ON videos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for transcriptions
CREATE POLICY "Users can view transcriptions of their videos" ON video_transcriptions
  FOR SELECT USING (
    video_id IN (SELECT id FROM videos WHERE user_id = auth.uid())
  );

-- RLS Policies for analysis
CREATE POLICY "Users can view analysis of their videos" ON video_analysis
  FOR SELECT USING (
    video_id IN (SELECT id FROM videos WHERE user_id = auth.uid())
  );

-- RLS Policies for payments
CREATE POLICY "Users can view their own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for credits
CREATE POLICY "Users can view their own credits" ON user_credits
  FOR SELECT USING (auth.uid() = user_id);
