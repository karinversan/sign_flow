import {
  Activity,
  BadgeCheck,
  Captions,
  Download,
  Mic2,
  Shield,
  Sparkles,
  Timer,
  Video
} from "lucide-react";

export type LandingFeature = {
  title: string;
  description: string;
  icon: typeof Captions;
};

export type LandingStep = {
  title: string;
  description: string;
  icon: typeof Captions;
};

export const landingSteps: LandingStep[] = [
  {
    title: "Sign capture",
    description: "Camera/video input enters the pipeline as a frame sequence.",
    icon: Video
  },
  {
    title: "Recognition + text",
    description:
      "The model produces partial and final phrases that update in real time.",
    icon: Activity
  },
  {
    title: "Subtitles and export",
    description: "Output is shown as overlay and exported as SRT/VTT or burn-in render.",
    icon: Download
  }
];

export const landingFeatures: LandingFeature[] = [
  {
    title: "Live subtitles overlay",
    description: "Fullscreen mode with readable subtitle overlay on top of video.",
    icon: Captions
  },
  {
    title: "Export SRT/VTT",
    description: "Export timestamps and text in standard editing formats.",
    icon: Download
  },
  {
    title: "Burn-in subtitles",
    description: "Apply subtitle styling directly to video (mock UI).",
    icon: Sparkles
  },
  {
    title: "Voiceover TTS",
    description: "Voice mode with selectable voice profile for preview.",
    icon: Mic2
  },
  {
    title: "Profiles: Speed / Quality",
    description: "Fast response or more stable output with smooth switching.",
    icon: Timer
  },
  {
    title: "Status & confidence",
    description: "Connection and confidence indicators for each segment.",
    icon: BadgeCheck
  }
];

export const privacyItems = [
  "The UI shows only a demo stream with mock data.",
  "No real video, camera, or audio is uploaded or processed.",
  "Settings and history exist only in the current frontend session."
];

export const signLanguages = [
  "ASL",
  "BSL",
  "RSL",
  "UkrSL",
  "KSL",
  "JSL"
];

export const outputLanguages = [
  "English",
  "Russian",
  "Ukrainian",
  "Español",
  "Deutsch",
  "Français"
];

export const profiles = ["Speed", "Quality"] as const;

export const voiceOptions = [
  { value: "nova", label: "Nova" },
  { value: "atlas", label: "Atlas" },
  { value: "echo", label: "Echo" }
];

export const pricingPlans = [
  {
    name: "Free",
    monthly: 0,
    yearly: 0,
    description: "Prototypes and fast UX checks",
    cta: "Start for free",
    features: [
      "Live preview (mock)",
      "2 upload jobs/day",
      "SRT export",
      "Community support"
    ]
  },
  {
    name: "Pro",
    monthly: 24,
    yearly: 19,
    description: "For teams working with subtitles daily",
    cta: "Upgrade to Pro",
    highlighted: true,
    features: [
      "Unlimited jobs",
      "SRT + VTT export",
      "Subtitle style profiles",
      "Voiceover preview"
    ]
  },
  {
    name: "Studio",
    monthly: 89,
    yearly: 69,
    description: "Production pipelines and larger media teams",
    cta: "Contact sales",
    features: [
      "Multi-project workspaces",
      "Priority queue",
      "Collaboration notes",
      "Dedicated onboarding"
    ]
  }
];

export const docsFaq = [
  {
    q: "Is this a real ML pipeline?",
    a: "No. This project is fully mock-based to demonstrate UX and navigation."
  },
  {
    q: "Can I upload a file and get a result?",
    a: "You can walk through the full UI flow, but processing is simulated on the frontend."
  },
  {
    q: "What works for real right now?",
    a: "Routing, animations, forms, interactive controls, and client-side text export."
  }
];

export const aboutValues = [
  {
    title: "Clarity first",
    text: "Subtitle readability and controllable UI are prioritized over visual noise.",
    icon: Captions
  },
  {
    title: "Human-centered",
    text: "We build tools that reduce friction between sign and text.",
    icon: Sparkles
  },
  {
    title: "Safe by design",
    text: "In demo mode, no real media streams are used, only transparent mock flows.",
    icon: Shield
  }
];
