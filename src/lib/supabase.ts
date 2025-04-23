import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Create a singleton instance
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

export function initSupabase(url: string, key: string) {
  supabaseInstance = createClient<Database>(url, key);
  return supabaseInstance;
}

export function getSupabase() {
  if (!supabaseInstance) {
    throw new Error('Supabase client not initialized');
  }
  return supabaseInstance;
}

export async function setupGitHubWebhook(
  repo: string,
  events: string[],
  githubToken: string,
  ngrokToken: string
): Promise<{ error: Error | null; url?: string }> {
  try {
    const [owner, repoName] = repo.split('/');
    
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/hooks`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `token ${githubToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'web',
          active: true,
          events,
          config: {
            url: `https://${ngrokToken}.ngrok.io/webhook`,
            content_type: 'json',
            insecure_ssl: '0',
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to create GitHub webhook');
    }

    const data = await response.json();
    return { error: null, url: data.config.url };
  } catch (error) {
    console.error('Error setting up webhook:', error);
    return { error: error as Error };
  }
}

export async function getProjects() {
  const supabase = getSupabase();
  return supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
}

export async function getProject(id: string) {
  const supabase = getSupabase();
  return supabase
    .from('projects')
    .select('*, events(*)')
    .eq('id', id)
    .single();
}

export async function createProject(projectData: {
  name: string;
  repository: string;
  description?: string;
}) {
  const supabase = getSupabase();
  return supabase.from('projects').insert(projectData).select().single();
}

export async function updateProject(
  id: string,
  projectData: Partial<{
    name: string;
    repository: string;
    description: string;
  }>
) {
  const supabase = getSupabase();
  return supabase.from('projects').update(projectData).eq('id', id);
}

export async function deleteProject(id: string) {
  const supabase = getSupabase();
  return supabase.from('projects').delete().eq('id', id);
}

export async function createEvent(eventData: {
  project_id: string;
  event_type: string;
  code_file_path: string;
  description?: string;
}) {
  const supabase = getSupabase();
  return supabase.from('events').insert(eventData).select().single();
}

export async function updateEvent(
  id: string,
  eventData: Partial<{
    event_type: string;
    code_file_path: string;
    description: string;
  }>
) {
  const supabase = getSupabase();
  return supabase.from('events').update(eventData).eq('id', id);
}

export async function deleteEvent(id: string) {
  const supabase = getSupabase();
  return supabase.from('events').delete().eq('id', id);
}

export async function getEventLogs(eventId: string, limit = 10) {
  const supabase = getSupabase();
  return supabase
    .from('event_logs')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })
    .limit(limit);
}