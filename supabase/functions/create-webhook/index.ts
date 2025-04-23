import { serve } from "https://deno.land/std@0.182.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Get request body
    const { repo, events } = await req.json();

    if (!repo || !events || !Array.isArray(events)) {
      return new Response(
        JSON.stringify({ error: "Invalid request parameters" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client with service role to get full access
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Create a unique webhook URL
    const randomId = crypto.randomUUID();
    const webhookUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/github-webhook?id=${randomId}`;

    // Get GitHub token from environment
    const githubToken = Deno.env.get("GITHUB_TOKEN");
    if (!githubToken) {
      throw new Error("GitHub token not configured");
    }

    // Create webhook in GitHub
    // Extract owner and repo name
    const [owner, repoName] = repo.split("/");
    
    // Set up webhook on the GitHub repository using GitHub API
    const webhookResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/hooks`,
      {
        method: "POST",
        headers: {
          "Accept": "application/vnd.github+json",
          "Authorization": `token ${githubToken}`,
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "web",
          active: true,
          events: events,
          config: {
            url: webhookUrl,
            content_type: "json",
            insecure_ssl: "0",
          },
        }),
      }
    );

    const webhookData = await webhookResponse.json();

    if (!webhookResponse.ok) {
      console.error("GitHub webhook error:", webhookData);
      throw new Error(`Failed to create GitHub webhook: ${webhookData.message}`);
    }

    // Update the project with webhook information
    const { error: updateError } = await supabaseAdmin
      .from("projects")
      .update({
        webhook_id: webhookData.id.toString(),
        webhook_url: webhookUrl,
      })
      .eq("repository", repo);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        webhookId: webhookData.id,
        webhookUrl,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating webhook:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to create webhook",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});