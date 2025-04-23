/*
  # Initial schema for GitHub Action Monitor

  1. New Tables
    - `projects` - Stores GitHub repository monitoring configurations
    - `events` - Stores event trigger configurations for projects
    - `event_logs` - Stores logs of triggered events

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  repository text NOT NULL,
  description text,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  webhook_id text,
  webhook_url text
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  code_file_path text NOT NULL,
  description text,
  is_active boolean DEFAULT true
);

-- Create event_logs table
CREATE TABLE IF NOT EXISTS event_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  payload jsonb NOT NULL,
  status text NOT NULL,
  error_message text
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for projects
CREATE POLICY "Users can create their own projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for events
CREATE POLICY "Users can create events for their projects"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = events.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view events for their projects"
  ON events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = events.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update events for their projects"
  ON events
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = events.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete events for their projects"
  ON events
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = events.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Create policies for event_logs
CREATE POLICY "Users can view logs for their events"
  ON event_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      JOIN projects ON events.project_id = projects.id
      WHERE events.id = event_logs.event_id
      AND projects.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON projects (user_id);
CREATE INDEX IF NOT EXISTS events_project_id_idx ON events (project_id);
CREATE INDEX IF NOT EXISTS event_logs_event_id_idx ON event_logs (event_id);
CREATE INDEX IF NOT EXISTS events_event_type_idx ON events (event_type);