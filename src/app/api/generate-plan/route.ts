import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import exercisesData from "@/data/exercises.json";

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { voiceType, rangeLow, rangeHigh, experienceLevel, goals, feedback } =
      await req.json();

    if (!rangeLow || !rangeHigh || !experienceLevel) {
      return NextResponse.json(
        { error: "Missing required profile fields" },
        { status: 400 }
      );
    }

    const exerciseLibrary = JSON.stringify(
      exercisesData.map((ex) => ({
        id: ex.id,
        name: ex.name,
        pattern: ex.pattern,
        noteDuration: ex.noteDuration,
        description: ex.description,
        tags: ex.tags,
        difficulty: ex.difficulty,
        category: ex.category,
      })),
      null,
      2
    );

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
${exerciseLibrary}

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

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parse the JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    const plan = JSON.parse(jsonMatch[0]);

    // Validate exercise IDs exist
    const validIds = new Set(exercisesData.map((ex) => ex.id));
    plan.exercises = plan.exercises.filter((ex: { exerciseId: string }) =>
      validIds.has(ex.exerciseId)
    );

    if (plan.exercises.length === 0) {
      return NextResponse.json(
        { error: "AI generated plan with no valid exercises" },
        { status: 500 }
      );
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error("Plan generation error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error";

    if (message.includes("API key") || message.includes("auth")) {
      return NextResponse.json(
        { error: "Anthropic API key not configured. Add ANTHROPIC_API_KEY to your environment variables." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate plan. Please try again." },
      { status: 500 }
    );
  }
}
