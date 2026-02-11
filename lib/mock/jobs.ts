export type JobStatus = "Processing" | "Done" | "Failed";

export type JobHistoryItem = {
  id: string;
  createdAt: string;
  type: "Live" | "Upload";
  language: string;
  status: JobStatus;
};

export type TranscriptSegment = {
  id: string;
  start: string;
  end: string;
  text: string;
};

export const mockHistory: JobHistoryItem[] = [
  {
    id: "job_9a1x",
    createdAt: "2026-02-10 18:42",
    type: "Live",
    language: "ASL → English",
    status: "Done"
  },
  {
    id: "job_4n2k",
    createdAt: "2026-02-10 16:20",
    type: "Upload",
    language: "RSL → Russian",
    status: "Processing"
  },
  {
    id: "job_8f6m",
    createdAt: "2026-02-09 21:03",
    type: "Upload",
    language: "BSL → English",
    status: "Done"
  },
  {
    id: "job_7h2d",
    createdAt: "2026-02-08 09:11",
    type: "Live",
    language: "ASL → Español",
    status: "Failed"
  }
];

export const defaultTranscript: TranscriptSegment[] = [
  {
    id: "seg_1",
    start: "00:00:00",
    end: "00:00:03",
    text: "Hello, today we will start with a short introduction."
  },
  {
    id: "seg_2",
    start: "00:00:03",
    end: "00:00:06",
    text: "Next we will show how subtitle styling updates in real time."
  },
  {
    id: "seg_3",
    start: "00:00:06",
    end: "00:00:10",
    text: "After that you can export the file as SRT or VTT."
  },
  {
    id: "seg_4",
    start: "00:00:10",
    end: "00:00:14",
    text: "This interface version demonstrates frontend behavior only."
  },
  {
    id: "seg_5",
    start: "00:00:14",
    end: "00:00:18",
    text: "In a real recording, subtitle chunks can become much denser."
  },
  {
    id: "seg_6",
    start: "00:00:18",
    end: "00:00:21",
    text: "Use the timeline to jump to exact moments before editing."
  },
  {
    id: "seg_7",
    start: "00:00:21",
    end: "00:00:24",
    text: "Each edited line immediately updates the voiceover script."
  },
  {
    id: "seg_8",
    start: "00:00:24",
    end: "00:00:28",
    text: "You can switch between original, subtitled, and voiceover preview."
  },
  {
    id: "seg_9",
    start: "00:00:28",
    end: "00:00:31",
    text: "Search helps locate segments by phrase when the list is long."
  },
  {
    id: "seg_10",
    start: "00:00:31",
    end: "00:00:35",
    text: "The active segment remains synchronized with the playhead."
  },
  {
    id: "seg_11",
    start: "00:00:35",
    end: "00:00:39",
    text: "You can also jump directly by entering a timecode."
  },
  {
    id: "seg_12",
    start: "00:00:39",
    end: "00:00:43",
    text: "Style controls define subtitle size, position, and background."
  },
  {
    id: "seg_13",
    start: "00:00:43",
    end: "00:00:46",
    text: "Voice controls tune the synthetic narration profile and tone."
  },
  {
    id: "seg_14",
    start: "00:00:46",
    end: "00:00:50",
    text: "Exports always reflect the latest edited subtitle timeline."
  }
];
