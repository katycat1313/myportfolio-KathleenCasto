-- ATLAS Database Schema for Supabase
-- Run these SQL commands in the Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Conversations table - stores all visitor interactions
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitor_id TEXT NOT NULL,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    detected_intent VARCHAR(50),
    recommended_projects TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

-- Create index on visitor_id for faster queries
CREATE INDEX IF NOT EXISTS idx_conversations_visitor_id ON conversations(visitor_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);

-- Learning metrics table - tracks performance data
CREATE TABLE IF NOT EXISTS learning_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    detected_intent VARCHAR(50) NOT NULL,
    projects_recommended TEXT[],
    projects_clicked TEXT[],
    conversion BOOLEAN DEFAULT FALSE,
    conversion_value NUMERIC(10, 2),
    time_to_conversion INTEGER,
    user_satisfaction INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

-- Create indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_learning_metrics_intent ON learning_metrics(detected_intent);
CREATE INDEX IF NOT EXISTS idx_learning_metrics_timestamp ON learning_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_learning_metrics_conversion ON learning_metrics(conversion);

-- Session tracking table - optional, for tracking user sessions
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitor_id TEXT NOT NULL UNIQUE,
    session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_end TIMESTAMP WITH TIME ZONE,
    total_messages INTEGER DEFAULT 0,
    final_intent VARCHAR(50),
    converted BOOLEAN DEFAULT FALSE
  );

CREATE INDEX IF NOT EXISTS idx_sessions_visitor_id ON sessions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_start ON sessions(session_start);

-- Visitor profiles table - optional, for storing visitor metadata
CREATE TABLE IF NOT EXISTS visitor_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitor_id TEXT NOT NULL UNIQUE,
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    visit_count INTEGER DEFAULT 1,
    detected_intent VARCHAR(50),
    primary_interest TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

CREATE INDEX IF NOT EXISTS idx_visitor_profiles_visitor_id ON visitor_profiles(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitor_profiles_last_seen ON visitor_profiles(last_seen);

-- Activity logs table - optional, for debugging and analytics
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    visitor_id TEXT,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

CREATE INDEX IF NOT EXISTS idx_activity_logs_event_type ON activity_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (adjust as needed)
-- This allows the ATLAS server to read/write data
CREATE POLICY "Allow all for authenticated users" 
  ON conversations FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" 
  ON learning_metrics FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" 
  ON sessions FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" 
  ON visitor_profiles FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" 
  ON activity_logs FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Analytics view - recommended conversations by intent
CREATE OR REPLACE VIEW intent_performance AS
SELECT 
  detected_intent,
  COUNT(*) as total_conversations,
  COUNT(DISTINCT visitor_id) as unique_visitors,
  ARRAY_AGG(DISTINCT recommended_projects[1]) FILTER (WHERE recommended_projects IS NOT NULL) as top_projects,
  AVG(EXTRACT(EPOCH FROM (response::text::length * INTERVAL '1 second'))) as avg_response_time
FROM conversations
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY detected_intent;

-- Analytics view - conversion by project
CREATE OR REPLACE VIEW project_conversion_analysis AS
SELECT 
  project,
  COUNT(*) as total_recommendations,
  COUNT(*) FILTER (WHERE conversion = true) as conversions,
  ROUND(100.0 * COUNT(*) FILTER (WHERE conversion = true) / COUNT(*), 2) as conversion_rate
FROM (
    SELECT 
    UNNEST(projects_recommended) as project,
      conversion
    FROM learning_metrics
    WHERE timestamp > NOW() - INTERVAL '30 days'
  )
GROUP BY project
ORDER BY conversion_rate DESC;
