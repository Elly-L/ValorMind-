-- Create therapy notes table for session insights and observations
CREATE TABLE IF NOT EXISTS public.therapy_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  note_type TEXT CHECK (note_type IN ('observation', 'insight', 'goal', 'summary')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create therapy session insights table for AI-generated analysis
CREATE TABLE IF NOT EXISTS public.therapy_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_analysis JSONB, -- Store mood trends and patterns
  key_themes TEXT[], -- Array of identified themes
  progress_indicators JSONB, -- Track therapeutic progress
  recommendations TEXT[], -- AI-generated recommendations
  risk_assessment TEXT CHECK (risk_assessment IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user therapy records table for long-term tracking
CREATE TABLE IF NOT EXISTS public.user_therapy_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_sessions INTEGER DEFAULT 0,
  first_session_date TIMESTAMP WITH TIME ZONE,
  last_session_date TIMESTAMP WITH TIME ZONE,
  primary_concerns TEXT[], -- Main issues user is working on
  therapeutic_goals TEXT[], -- Long-term goals
  progress_summary JSONB, -- Overall progress tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_therapy_notes_session_id ON public.therapy_notes(session_id);
CREATE INDEX IF NOT EXISTS idx_therapy_notes_note_type ON public.therapy_notes(note_type);
CREATE INDEX IF NOT EXISTS idx_therapy_insights_session_id ON public.therapy_insights(session_id);
CREATE INDEX IF NOT EXISTS idx_therapy_insights_user_id ON public.therapy_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_user_therapy_records_user_id ON public.user_therapy_records(user_id);

-- Enable Row Level Security
ALTER TABLE public.therapy_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapy_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_therapy_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for therapy_notes
CREATE POLICY "Users can view notes from own sessions" ON public.therapy_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions 
      WHERE chat_sessions.id = therapy_notes.session_id 
      AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert notes to own sessions" ON public.therapy_notes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_sessions 
      WHERE chat_sessions.id = therapy_notes.session_id 
      AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update notes from own sessions" ON public.therapy_notes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions 
      WHERE chat_sessions.id = therapy_notes.session_id 
      AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete notes from own sessions" ON public.therapy_notes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions 
      WHERE chat_sessions.id = therapy_notes.session_id 
      AND chat_sessions.user_id = auth.uid()
    )
  );

-- Create RLS policies for therapy_insights
CREATE POLICY "Users can view own therapy insights" ON public.therapy_insights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own therapy insights" ON public.therapy_insights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own therapy insights" ON public.therapy_insights
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for user_therapy_records
CREATE POLICY "Users can view own therapy records" ON public.user_therapy_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own therapy records" ON public.user_therapy_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own therapy records" ON public.user_therapy_records
  FOR UPDATE USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_therapy_notes_updated_at 
  BEFORE UPDATE ON public.therapy_notes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_therapy_insights_updated_at 
  BEFORE UPDATE ON public.therapy_insights 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_therapy_records_updated_at 
  BEFORE UPDATE ON public.user_therapy_records 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update user therapy records after session
CREATE OR REPLACE FUNCTION update_user_therapy_record()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert user therapy record when a new therapy session is created
  IF NEW.mode IN ('therapist', 'avatar-therapy') THEN
    INSERT INTO public.user_therapy_records (user_id, total_sessions, first_session_date, last_session_date)
    VALUES (NEW.user_id, 1, NEW.created_at, NEW.created_at)
    ON CONFLICT (user_id) DO UPDATE SET
      total_sessions = user_therapy_records.total_sessions + 1,
      last_session_date = NEW.created_at,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update therapy records
CREATE TRIGGER update_therapy_record_on_session
  AFTER INSERT ON public.chat_sessions
  FOR EACH ROW EXECUTE FUNCTION update_user_therapy_record();
