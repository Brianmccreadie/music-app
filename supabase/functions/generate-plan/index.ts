// Supabase Edge Function: generate-plan
// Deploy with: supabase functions deploy generate-plan --no-verify-jwt
// Set secret: supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

Deno.serve(async (req) => {
  // CORS headers for client-side calls
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    const { voiceType, rangeLow, rangeHigh, experienceLevel, goals, feedback, exerciseLibrary } =
      await req.json();

    if (!rangeLow || !rangeHigh || !experienceLevel) {
      return new Response(
        JSON.stringify({ error: "Missing required profile fields" }),
        { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    const feedbackSection = feedback
      ? `\nUSER FEEDBACK ON PREVIOUS PLAN:\n${feedback}\nAdjust the new plan based on this feedback.\n`
      : "";

    const prompt = `You are a vocal coach AI. Given the singer's profile and the exercise library below, create a personalized practice plan.

SINGER PROFILE:
- Voice type: ${voiceType || "Not specified"}
- Range: ${rangeLow} to ${rangeHigh}
- Experience: ${experienceLevel}
- Goals: ${goals?.length > 0 ? goals.join(", ") : "General improvement"}
${feedbackSection}
EXERCISE LIBRARY:
${JSON.stringify(exerciseLibrary, null, 2)}

Create a practice plan as a JSON object with this exact structure:
{
  "name": "Plan name",
  "description": "Brief description of the plan",
  "durationMinutes": 15,
  "exercises": [
    {
      "exerciseId": "exercise-id-from-library",
      "tempoOverride": 100,
      "notes": "Coaching tip for this exercise"
    }
  ]
}

Rules:
- The plan should be 15-20 minutes long
- Start with warm-ups, progress to technique work targeting their goals, end with a cool-down
- Only select exercises appropriate for their difficulty level (${experienceLevel})
- Include 5-8 exercises
- Set tempoOverride based on their experience (slower for beginners, faster for advanced)
- Each "notes" field should be a brief, encouraging coaching tip specific to this exercise and their goals
- Only use exercise IDs from the library provided

Return ONLY the JSON object, no other text.`;

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Anthropic API key not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(
        JSON.stringify({ error: `Anthropic API error: ${response.status}` }),
        { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    const message = await response.json();
    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response" }),
        { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    const plan = JSON.parse(jsonMatch[0]);

    // Validate exercise IDs exist
    const validIds = new Set(exerciseLibrary.map((ex: { id: string }) => ex.id));
    plan.exercises = plan.exercises.filter((ex: { exerciseId: string }) =>
      validIds.has(ex.exerciseId)
    );

    if (plan.exercises.length === 0) {
      return new Response(
        JSON.stringify({ error: "AI generated plan with no valid exercises" }),
        { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    return new Response(JSON.stringify(plan), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to generate plan. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  }
});
