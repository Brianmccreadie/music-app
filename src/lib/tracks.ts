export interface Track {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  exerciseIds: string[];
  gradient: string;
}

export const TRACKS: Track[] = [
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
      "yawn-sigh",
      "sustained-tone",
      "major-triad",
      "minor-triad",
    ],
    gradient: "from-amber-600 to-orange-700",
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
  },
  {
    id: "build-vocal-agility",
    name: "Build Vocal Agility",
    subtitle: "Speed, precision, flexibility",
    description:
      "Fast-moving patterns to develop vocal dexterity. Essential for runs, riffs, and melismatic singing.",
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
      "major-scale-full",
      "vowel-modification",
    ],
    gradient: "from-sky-600 to-blue-700",
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
      "staccato-repeated",
      "fifth-jump",
      "octave-arpeggio",
      "vocal-fry-onset",
      "wide-arpeggio",
    ],
    gradient: "from-red-600 to-orange-700",
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
  },
];
