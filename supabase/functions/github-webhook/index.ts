import { serve } from "https://deno.land/std@0.182.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";

serve(async (req: Request) => {
  try {
    // Get webhook ID from query params
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new Response(
        JSON.stringify({ error: "Missing webhook ID" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get GitHub event data
    const payload = await req.json();
    const githubEvent = req.headers.get("X-GitHub-Event");

    if (!payload || !githubEvent) {
      return new Response(
        JSON.stringify({ error: "Invalid GitHub webhook payload" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Connect to Supabase
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Find project by webhook URL
    const { data: project, error: projectError } = await supabaseClient
      .from("projects")
      .select("id")
      .eq("webhook_url", `${Deno.env.get("SUPABASE_URL")}/functions/v1/github-webhook?id=${id}`)
      .single();

    if (projectError || !project) {
      console.error("Project not found:", projectError);
      return new Response(
        JSON.stringify({ error: "Project not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Map GitHub event to our event types
    let eventType = githubEvent;
    
    // Handle specific event sub-types
    if (githubEvent === "pull_request") {
      eventType = `pull_request.${payload.action}`;
    } else if (githubEvent === "create" && payload.ref_type) {
      eventType = `create.${payload.ref_type}`;
    } else if (githubEvent === "delete" && payload.ref_type) {
      eventType = `delete.${payload.ref_type}`;
    }

    // Find matching events for this project and event type
    const { data: events, error: eventsError } = await supabaseClient
      .from("events")
      .select("*")
      .eq("project_id", project.id)
      .eq("event_type", eventType)
      .eq("is_active", true);

    if (eventsError) {
      console.error("Error fetching events:", eventsError);
      return new Response(
        JSON.stringify({ error: "Error fetching events" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!events || events.length === 0) {
      return new Response(
        JSON.stringify({ message: "No matching event configurations found" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Process each matching event
    const processingResults = await Promise.all(
      events.map(async (event) => {
        try {
          // In a real implementation, this would trigger the specified file
          // For this demo, we just log the event
          console.log(`Would execute file: ${event.code_file_path}`);

          // Log successful execution
          await supabaseClient.from("event_logs").insert({
            event_id: event.id,
            payload: payload,
            status: "success",
          });

          return {
            event_id: event.id,
            success: true,
          };
        } catch (error) {
          // Log error
          await supabaseClient.from("event_logs").insert({
            event_id: event.id,
            payload: payload,
            status: "error",
            error_message: error.message,
          });

          return {
            event_id: event.id,
            success: false,
            error: error.message,
          };
        }
      })
    );

    return new Response(
      JSON.stringify({
        message: "Webhook processed",
        results: processingResults,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing webhook:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to process webhook",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});