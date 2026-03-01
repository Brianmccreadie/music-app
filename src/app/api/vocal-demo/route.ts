import { NextRequest, NextResponse } from "next/server";
import demoData from "@/data/exercise-demos.json";

const demos = demoData as Record<
  string,
  {
    vocalInstruction: string;
    syllables: string;
    technique: string;
    demoDescription: string;
    demoRootNote: string;
  }
>;

// Default voice ID — ElevenLabs "Rachel" (warm, clear female voice)
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ElevenLabs API key not configured. Add ELEVENLABS_API_KEY to your environment variables." },
      { status: 500 }
    );
  }

  try {
    const { exerciseId } = await req.json();

    if (!exerciseId || !demos[exerciseId]) {
      return NextResponse.json(
        { error: "Invalid exercise ID" },
        { status: 400 }
      );
    }

    const demo = demos[exerciseId];

    // Build a natural-sounding text for the TTS
    // We add spacing/punctuation so ElevenLabs paces it like singing
    const syllables = demo.syllables
      .replace(/[↑↓]/g, "")
      .trim();

    // For sustained tones and lip trills, use the description
    const isSpecialExercise =
      syllables.includes("Ooooooooh") ||
      syllables.includes("Brrrrrrrrr") ||
      syllables.includes("Ahhhhhhhhh") ||
      syllables.includes("Weeeeeeeeeee");

    const ttsText = isSpecialExercise
      ? demo.demoDescription
      : `${syllables}`;

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${DEFAULT_VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: ttsText,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.4,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", response.status, errorText);
      return NextResponse.json(
        { error: "Failed to generate vocal demo" },
        { status: 502 }
      );
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (error) {
    console.error("Vocal demo generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate vocal demo" },
      { status: 500 }
    );
  }
}
