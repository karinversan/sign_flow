export type SubtitleChunk = {
  id: string;
  text: string;
  confidence: number;
  kind: "partial" | "final";
  timestamp: string;
};

const phrases = [
  "Good morning, we are starting the stream.",
  "Today we will review subtitle settings.",
  "Add an output language in the right panel.",
  "Check that subtitle styling remains readable.",
  "You can switch to the Speed profile.",
  "Final phrases look denser and clearer.",
  "Partial phrases are slightly transparent.",
  "Export output as SRT or VTT.",
  "This stream is fully simulated on the frontend.",
  "For demo purposes, captions update every two seconds."
];

function formatTs(date: Date) {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

export function generateSubtitleChunk(seed: number): SubtitleChunk {
  const phrase = phrases[seed % phrases.length];
  const partialCut = Math.max(phrase.length - 10, Math.floor(phrase.length * 0.65));
  const kind = Math.random() > 0.4 ? "final" : "partial";

  return {
    id: crypto.randomUUID(),
    text: kind === "final" ? phrase : `${phrase.slice(0, partialCut)}...`,
    confidence: 72 + Math.round(Math.random() * 26),
    kind,
    timestamp: formatTs(new Date())
  };
}

export function seedSubtitles(): SubtitleChunk[] {
  return [generateSubtitleChunk(0), generateSubtitleChunk(1)].map((chunk, idx) => ({
    ...chunk,
    kind: idx === 0 ? "partial" : "final"
  }));
}
