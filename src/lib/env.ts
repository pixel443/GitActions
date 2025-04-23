import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
  VITE_GITHUB_TOKEN: z.string().min(1),
  VITE_NGROK_AUTH_TOKEN: z.string().min(1),
});

export function loadEnvConfig() {
  try {
    const env = {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
      VITE_GITHUB_TOKEN: import.meta.env.VITE_GITHUB_TOKEN,
      VITE_NGROK_AUTH_TOKEN: import.meta.env.VITE_NGROK_AUTH_TOKEN,
    };

    const result = envSchema.safeParse(env);

    if (!result.success) {
      console.error('Environment validation failed:', result.error);
      return null;
    }

    return result.data;
  } catch (error) {
    console.error('Failed to load environment config:', error);
    return null;
  }
}