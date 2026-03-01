export type TrackCategory = "Foundations" | "Focused Training";

export interface Track {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  exerciseIds: string[];
  gradient: string;
  category: TrackCategory;
}

export const TRACK_CATEGORIES: TrackCategory[] = [
  "Foundations",
  "Focused Training",
];

export const TRACKS: Track[] = [
  // ── Foundations ──
  {
    id: "warm-up-essentials",
    name: "Warm-Up Essentials",
    subtitle: "Start every session right",
    description:
      "Gentle exercises to wake up your voice safely. From lip trills to simple scales — do these before anything else.",
    exerciseIds: [
      "lip-trill-scale",
      "tongue-trill-scale",
      "humming",
      "five-note-scale",
      "descending-five-note",
      "hooty-oo-scale",
      "yawn-sigh",
      "sustained-tone",
      "major-triad",
      "minor-triad",
    ],
    gradient: "from-amber-600 to-orange-700",
    category: "Foundations",
  },
  {
    id: "breath-control",
    name: "Breath Control Mastery",
    subtitle: "The foundation of great singing",
    description:
      "Develop your breath support, sustaining power, and dynamic control. These are the exercises that separate good singers from great ones.",
    exerciseIds: [
      "sustained-tone",
      "messa-di-voce",
      "lip-trill-scale",
      "staccato-repeated",
      "diaphragm-bounce",
      "major-scale-full",
      "vowel-modification",
    ],
    gradient: "from-sky-600 to-blue-700",
    category: "Foundations",
  },
  {
    id: "pitch-and-intonation",
    name: "Pitch & Intonation",
    subtitle: "Nail every note",
    description:
      "Sharpen your ear and hit every interval cleanly. From simple fourths to challenging sixths and octaves.",
    exerciseIds: [
      "fourth-jump",
      "fifth-jump",
      "major-sixth-jump",
      "octave-jump",
      "chromatic-five",
      "major-triad",
      "minor-triad",
      "diminished-seventh",
    ],
    gradient: "from-rose-600 to-pink-700",
    category: "Foundations",
  },
  {
    id: "expand-your-range",
    name: "Expand Your Range",
    subtitle: "Push your limits safely",
    description:
      "Exercises designed to gradually extend your upper and lower range while maintaining vocal health.",
    exerciseIds: [
      "sirens",
      "octave-arpeggio",
      "octave-jump",
      "wide-arpeggio",
      "two-octave-arpeggio",
      "belt-1-3-5-8",
      "yawn-sigh",
      "major-scale-full",
    ],
    gradient: "from-purple-600 to-indigo-700",
    category: "Foundations",
  },
  {
    id: "build-vocal-agility",
    name: "Build Vocal Agility",
    subtitle: "Speed, precision, flexibility",
    description:
      "Fast-moving patterns to develop vocal dexterity. The mechanical foundation you need before tackling runs and riffs.",
    exerciseIds: [
      "rapid-five-note",
      "thirds-pattern",
      "chromatic-five",
      "pentatonic-scale",
      "semitone-trill",
      "staccato-five-descending",
      "nine-note-run",
      "blues-scale",
    ],
    gradient: "from-emerald-600 to-teal-700",
    category: "Foundations",
  },
  {
    id: "performance-ready",
    name: "Performance Ready",
    subtitle: "Prepare for the stage",
    description:
      "A comprehensive collection that covers all the technical bases. Great for audition prep and pre-show routines.",
    exerciseIds: [
      "lip-trill-scale",
      "five-note-scale",
      "major-scale-full",
      "octave-arpeggio",
      "pentatonic-scale",
      "rapid-five-note",
      "messa-di-voce",
      "sirens",
    ],
    gradient: "from-yellow-600 to-amber-700",
    category: "Foundations",
  },

  // ── Focused Training ──
  {
    id: "develop-head-voice",
    name: "Develop Your Head Voice",
    subtitle: "Unlock your upper register",
    description:
      "Isolate and strengthen head voice with light, resonant exercises. Learn to access your upper range without strain or breathiness.",
    exerciseIds: [
      "hooty-oo-scale",
      "falsetto-slide-down",
      "yawn-sigh",
      "head-voice-arpeggio",
      "ee-head-voice-scale",
      "sob-exercise",
      "descending-five-note",
    ],
    gradient: "from-cyan-500 to-blue-600",
    category: "Focused Training",
  },
  {
    id: "develop-mix-voice",
    name: "Develop Your Mix",
    subtitle: "Bridge chest and head seamlessly",
    description:
      "Train the elusive mix voice — the blend of chest and head that gives you power in your upper range without flipping or cracking.",
    exerciseIds: [
      "mum-scale",
      "gee-scale",
      "bratty-nay-octave",
      "nay-twang",
      "mix-voice-slide",
      "sob-exercise",
      "octave-arpeggio",
      "belt-1-3-5-8",
    ],
    gradient: "from-fuchsia-600 to-purple-700",
    category: "Focused Training",
  },
  {
    id: "belt-and-power",
    name: "Belt & Power",
    subtitle: "Sing with authority",
    description:
      "Build chest voice strength, belt technique, and vocal power without strain. Essential for musical theater and pop.",
    exerciseIds: [
      "belt-1-3-5-8",
      "nay-twang",
      "gee-scale",
      "staccato-repeated",
      "fifth-jump",
      "octave-arpeggio",
      "vocal-fry-onset",
      "wide-arpeggio",
    ],
    gradient: "from-red-600 to-orange-700",
    category: "Focused Training",
  },
  {
    id: "tone-and-resonance",
    name: "Tone & Resonance",
    subtitle: "Shape your sound",
    description:
      "Work on vowel purity, placement, and resonance. These exercises help you develop a rich, full tone.",
    exerciseIds: [
      "vowel-modification",
      "nay-twang",
      "humming",
      "sob-exercise",
      "vocal-fry-onset",
      "descending-five-note",
      "minor-scale-full",
    ],
    gradient: "from-violet-600 to-purple-700",
    category: "Focused Training",
  },
  {
    id: "develop-vibrato",
    name: "Develop Your Vibrato",
    subtitle: "Add warmth and expression",
    description:
      "Build natural vibrato from the ground up. From diaphragm control to sustained oscillation — develop the vibrato that makes voices sing.",
    exerciseIds: [
      "diaphragm-bounce",
      "vibrato-pulses",
      "vibrato-oscillation",
      "sustained-vibrato",
      "sustained-tone",
      "messa-di-voce",
    ],
    gradient: "from-pink-500 to-rose-600",
    category: "Focused Training",
  },
  {
    id: "master-runs-riffs",
    name: "Master Runs & Riffs",
    subtitle: "Sing like the pros",
    description:
      "From basic pentatonic runs to gospel cascades. Build the speed, accuracy, and style to execute impressive vocal runs and riffs.",
    exerciseIds: [
      "pentatonic-run-fast",
      "three-note-turn",
      "rapid-five-note",
      "pentatonic-scale",
      "riff-cascade",
      "gospel-run",
      "nine-note-run",
      "blues-scale",
    ],
    gradient: "from-orange-500 to-red-600",
    category: "Focused Training",
  },
];
