import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Vocal Reps — Train Your Voice";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #1B6B5A 0%, #134D42 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Icon */}
        <div
          style={{
            display: "flex",
            width: 120,
            height: 120,
            borderRadius: 24,
            backgroundColor: "rgba(255,255,255,0.15)",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18V5l12-3v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="15" r="3" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: "white",
            marginBottom: 16,
            letterSpacing: "-0.02em",
          }}
        >
          Vocal Reps
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: "rgba(255,255,255,0.7)",
            marginBottom: 48,
          }}
        >
          Train Your Voice. One Rep at a Time.
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: 64,
          }}
        >
          {[
            { num: "70+", label: "Exercises" },
            { num: "16", label: "Core Training" },
            { num: "12", label: "Programs" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  color: "white",
                }}
              >
                {stat.num}
              </div>
              <div
                style={{
                  fontSize: 16,
                  color: "rgba(255,255,255,0.5)",
                  marginTop: 4,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
