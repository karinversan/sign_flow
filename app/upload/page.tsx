"use client";

import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  FileUp,
  Home,
  Plus,
  Radio,
  Search,
  Sparkles,
  Volume2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { outputLanguages, signLanguages, voiceOptions } from "@/lib/mock/data";
import { defaultTranscript, TranscriptSegment } from "@/lib/mock/jobs";
import { formatSrtTime, formatTimecode, parseTimecodeInput, toSeconds } from "@/lib/utils/timecode";
import { cn } from "@/lib/utils";

type RenderMode = "subtitles" | "voice" | "both";

const initialSegments: TranscriptSegment[] = defaultTranscript.map((item) => ({ ...item }));

function createDownload(fileName: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function toSrt(segments: TranscriptSegment[]) {
  return segments
    .map((segment, index) => {
      return `${index + 1}\n${formatSrtTime(toSeconds(segment.start))} --> ${formatSrtTime(
        toSeconds(segment.end)
      )}\n${segment.text}`;
    })
    .join("\n\n");
}

function findSegmentByTime(segments: TranscriptSegment[], second: number) {
  const normalized = Math.max(0, Math.floor(second));
  const inside = segments.find((segment) => {
    const start = toSeconds(segment.start);
    const end = toSeconds(segment.end);
    return normalized >= start && normalized < end;
  });
  if (inside) return inside;

  return segments
    .slice()
    .reverse()
    .find((segment) => normalized >= toSeconds(segment.start));
}

export default function UploadPage() {
  const [fileName, setFileName] = useState("");
  const [segments, setSegments] = useState<TranscriptSegment[]>(initialSegments);
  const [activeSegmentId, setActiveSegmentId] = useState(initialSegments[0]?.id ?? "");
  const [segmentQuery, setSegmentQuery] = useState("");
  const [jumpTo, setJumpTo] = useState("");

  const [signLanguage, setSignLanguage] = useState("ASL");
  const [outputLanguage, setOutputLanguage] = useState("English");
  const [mode, setMode] = useState<RenderMode>("both");

  const [subtitleEnabled, setSubtitleEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voice, setVoice] = useState("nova");
  const [fontSize, setFontSize] = useState("M");
  const [fontFamily, setFontFamily] = useState("Inter");
  const [subtitleColor, setSubtitleColor] = useState("#ffffff");
  const [subtitleBackground, setSubtitleBackground] = useState(true);
  const [subtitlePosition, setSubtitlePosition] = useState("bottom");

  const [originalVolume, setOriginalVolume] = useState(70);
  const [overlayVolume, setOverlayVolume] = useState(75);

  const totalDuration = useMemo(
    () => Math.max(1, ...segments.map((segment) => toSeconds(segment.end))),
    [segments]
  );
  const [playheadSec, setPlayheadSec] = useState(0);

  const activeFromPlayhead = useMemo(
    () => findSegmentByTime(segments, playheadSec),
    [segments, playheadSec]
  );

  useEffect(() => {
    if (!activeFromPlayhead) return;
    if (activeFromPlayhead.id !== activeSegmentId) {
      setActiveSegmentId(activeFromPlayhead.id);
    }
  }, [activeFromPlayhead, activeSegmentId]);

  const activeSegment = useMemo(
    () => segments.find((segment) => segment.id === activeSegmentId) ?? segments[0],
    [activeSegmentId, segments]
  );

  const voiceoverScript = useMemo(
    () =>
      `Tone ${voice}. ${segments
        .map((segment) => segment.text.trim())
        .filter(Boolean)
        .join(" ")}`,
    [segments, voice]
  );

  const visibleSegments = useMemo(() => {
    const q = segmentQuery.trim().toLowerCase();
    if (!q) return segments;
    return segments.filter((segment) => {
      return (
        segment.text.toLowerCase().includes(q) ||
        segment.start.includes(q) ||
        segment.end.includes(q) ||
        segment.id.toLowerCase().includes(q)
      );
    });
  }, [segments, segmentQuery]);

  const previewClass = useMemo(() => {
    const size = fontSize === "S" ? "text-base" : fontSize === "L" ? "text-3xl" : "text-2xl";
    const position = subtitlePosition === "top" ? "top-6" : "bottom-6";
    return { size, position };
  }, [fontSize, subtitlePosition]);

  const previewSegment = activeFromPlayhead ?? activeSegment;
  const previewText = previewSegment?.text?.trim() || "Select a segment from the timeline";

  const activeIndex = Math.max(
    0,
    segments.findIndex((segment) => segment.id === activeSegmentId)
  );

  const selectSegment = (segment: TranscriptSegment) => {
    setActiveSegmentId(segment.id);
    setPlayheadSec(toSeconds(segment.start));
  };

  const moveBySegment = (direction: -1 | 1) => {
    const nextIndex = Math.min(Math.max(activeIndex + direction, 0), segments.length - 1);
    const next = segments[nextIndex];
    if (!next) return;
    selectSegment(next);
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
  };

  const updateSegment = (id: string, patch: Partial<TranscriptSegment>) => {
    setSegments((prev) => prev.map((segment) => (segment.id === id ? { ...segment, ...patch } : segment)));
  };

  const addSegment = () => {
    const nextId = `seg_${segments.length + 1}`;
    const start = totalDuration;
    const end = totalDuration + 3;
    const next: TranscriptSegment = {
      id: nextId,
      start: formatTimecode(start),
      end: formatTimecode(end),
      text: "New subtitle line..."
    };
    setSegments((prev) => [...prev, next]);
    selectSegment(next);
  };

  const onJumpToTime = () => {
    const parsed = parseTimecodeInput(jumpTo);
    if (parsed === null) return;
    setPlayheadSec(Math.min(Math.max(parsed, 0), totalDuration));
  };

  return (
    <section className="pb-14 pt-12">
      <div className="mx-auto w-full max-w-[1520px] px-4 md:px-6">
        <div className="page-head flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="page-kicker">Video editor workspace</p>
            <h1 className="section-title">Video Translation</h1>
            <p className="page-lead">
              Realistic subtitle workflow for long videos: timeline scrubbing, timecode jump, and dense segment editing.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="gap-2">
              <Link href="/">
                <Home className="h-4 w-4" />
                Home
              </Link>
            </Button>
            <Button asChild variant="secondary" className="gap-2">
              <Link href="/live">
                <Radio className="h-4 w-4" />
                Realtime
              </Link>
            </Button>
          </div>
        </div>

        <Card className="border-white/10 bg-black/45">
          <CardHeader>
            <CardTitle>1) Upload video</CardTitle>
            <CardDescription>Upload one file and move directly into the workspace editor.</CardDescription>
          </CardHeader>
          <CardContent>
            <label className="flex min-h-36 cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-white/20 bg-white/[0.02] p-6 text-center hover:border-white/30">
              <FileUp className="h-6 w-6 text-white/75" />
              <div>
                <p className="text-sm font-medium">Choose a video file</p>
                <p className="text-xs text-muted-foreground">mp4 / mov / mkv (mock)</p>
              </div>
              <input type="file" accept="video/*" className="hidden" onChange={onFileChange} />
            </label>
            {fileName && (
              <p className="mt-3 text-sm text-muted-foreground">
                Uploaded: <span className="text-foreground">{fileName}</span>
              </p>
            )}
          </CardContent>
        </Card>

        {fileName && (
          <>
            <Card className="mt-5 border-white/10 bg-black/45">
              <CardContent className="grid gap-3 p-4 md:grid-cols-3 xl:grid-cols-6">
                <div className="space-y-1.5 xl:col-span-2">
                  <Label>Sign language</Label>
                  <Select value={signLanguage} onValueChange={setSignLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {signLanguages.map((language) => (
                        <SelectItem key={language} value={language}>
                          {language}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 xl:col-span-2">
                  <Label>Output language</Label>
                  <Select value={outputLanguage} onValueChange={setOutputLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {outputLanguages.map((language) => (
                        <SelectItem key={language} value={language}>
                          {language}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 xl:col-span-2">
                  <Label>Render mode</Label>
                  <Select value={mode} onValueChange={(value) => setMode(value as RenderMode)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="subtitles">Subtitles only</SelectItem>
                      <SelectItem value="voice">Voice only</SelectItem>
                      <SelectItem value="both">Subtitles + Voice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.9fr_0.9fr]">
              <Card className="border-white/10 bg-black/45">
                <CardHeader>
                  <CardTitle>2) Large preview and time navigation</CardTitle>
                  <CardDescription>
                    Timeline is bound to subtitle intervals, so you can edit exactly where text appears in the video.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative flex h-[58vh] min-h-[460px] items-center justify-center rounded-xl border border-white/10 bg-black/35">
                    <div className="absolute inset-0 scan-overlay opacity-30" />
                    <p className="text-sm text-muted-foreground">Mock video preview</p>
                    {subtitleEnabled && (mode === "subtitles" || mode === "both") && (
                      <div
                        className={cn(
                          "absolute left-1/2 w-[92%] max-w-5xl -translate-x-1/2 rounded-lg px-3 py-2 text-center leading-snug",
                          previewClass.position,
                          previewClass.size
                        )}
                        style={{
                          color: subtitleColor,
                          fontFamily,
                          background: subtitleBackground ? "rgba(0,0,0,0.58)" : "transparent"
                        }}
                      >
                        {previewText}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Clock3 className="h-3.5 w-3.5" />
                        Playhead {formatTimecode(playheadSec)} / {formatTimecode(totalDuration)}
                      </span>
                      <span>{segments.length} segments</span>
                    </div>

                    <Slider
                      min={0}
                      max={totalDuration}
                      step={1}
                      value={[playheadSec]}
                      onValueChange={(v) => setPlayheadSec(v[0] ?? 0)}
                    />

                    <div className="relative mt-3 h-8 rounded-md border border-white/10 bg-black/30">
                      {segments.map((segment) => {
                        const start = toSeconds(segment.start);
                        const end = toSeconds(segment.end);
                        const left = (start / totalDuration) * 100;
                        const width = Math.max(((end - start) / totalDuration) * 100, 1.5);
                        const active = segment.id === activeSegmentId;

                        return (
                          <button
                            key={segment.id}
                            type="button"
                            onClick={() => selectSegment(segment)}
                            className={cn(
                              "absolute top-1 h-6 rounded-sm border transition",
                              active
                                ? "border-white/40 bg-white/35"
                                : "border-white/15 bg-white/10 hover:border-white/35"
                            )}
                            style={{ left: `${left}%`, width: `${width}%` }}
                            title={`${segment.start} - ${segment.end}`}
                          />
                        );
                      })}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Button size="sm" variant="secondary" onClick={() => moveBySegment(-1)}>
                        <ChevronLeft className="h-4 w-4" />
                        Prev segment
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => moveBySegment(1)}>
                        Next segment
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Input
                        value={jumpTo}
                        onChange={(event) => setJumpTo(event.target.value)}
                        placeholder="Jump: 00:01:24 or 84"
                        className="h-9 w-52"
                      />
                      <Button size="sm" variant="outline" onClick={onJumpToTime}>
                        Jump
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-5 xl:sticky xl:top-24 xl:self-start">
                <Card className="border-white/10 bg-black/45">
                  <CardHeader>
                    <CardTitle>3) Output controls</CardTitle>
                    <CardDescription>All key parameters in one panel.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="subtitles">
                      <TabsList className="w-full">
                        <TabsTrigger value="subtitles">Subtitles</TabsTrigger>
                        <TabsTrigger value="audio">Audio</TabsTrigger>
                      </TabsList>

                      <TabsContent value="subtitles" className="space-y-3 pt-3">
                        <div className="space-y-1.5">
                          <Label>Voice</Label>
                          <Select value={voice} onValueChange={setVoice}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {voiceOptions.map((item) => (
                                <SelectItem key={item.value} value={item.value}>
                                  {item.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <Label>Size</Label>
                            <Select value={fontSize} onValueChange={setFontSize}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="S">S</SelectItem>
                                <SelectItem value="M">M</SelectItem>
                                <SelectItem value="L">L</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <Label>Position</Label>
                            <Select value={subtitlePosition} onValueChange={setSubtitlePosition}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="bottom">Bottom</SelectItem>
                                <SelectItem value="top">Top</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <Label>Font family</Label>
                            <Select value={fontFamily} onValueChange={setFontFamily}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Inter">Inter</SelectItem>
                                <SelectItem value="Space Grotesk">Space Grotesk</SelectItem>
                                <SelectItem value="monospace">Monospace</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <Label>Text color</Label>
                            <Input
                              type="color"
                              value={subtitleColor}
                              onChange={(event) => setSubtitleColor(event.target.value)}
                              className="h-10 p-1"
                            />
                          </div>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
                            <span className="text-sm">Subtitles</span>
                            <Switch checked={subtitleEnabled} onCheckedChange={setSubtitleEnabled} />
                          </div>
                          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
                            <span className="text-sm">Voiceover</span>
                            <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
                          <Label htmlFor="subtitle-bg">Subtitle background</Label>
                          <Switch id="subtitle-bg" checked={subtitleBackground} onCheckedChange={setSubtitleBackground} />
                        </div>
                      </TabsContent>

                      <TabsContent value="audio" className="space-y-3 pt-3">
                        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                          <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                            <span>Original video volume</span>
                            <span>{originalVolume}%</span>
                          </div>
                          <Slider value={[originalVolume]} onValueChange={(v) => setOriginalVolume(v[0] ?? 70)} max={100} />
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                          <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                            <span>Overlay voice volume</span>
                            <span>{overlayVolume}%</span>
                          </div>
                          <Slider value={[overlayVolume]} onValueChange={(v) => setOverlayVolume(v[0] ?? 75)} max={100} />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                <Card className="border-white/10 bg-black/45">
                  <CardHeader>
                    <CardTitle>4) Export</CardTitle>
                    <CardDescription>Files are generated from the current editor state.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant="secondary"
                      className="w-full justify-start gap-2"
                      onClick={() => createDownload(`${fileName}.srt`, toSrt(segments), "text/plain")}
                    >
                      <Download className="h-4 w-4" />
                      Download subtitles (.srt)
                    </Button>
                    <Button
                      variant="secondary"
                      className="w-full justify-start gap-2"
                      onClick={() =>
                        createDownload(
                          `${fileName}-voice-track.wav`,
                          `Mock audio render\nVoice: ${voice}\nVolume: ${overlayVolume}%`,
                          "audio/wav"
                        )
                      }
                    >
                      <Volume2 className="h-4 w-4" />
                      Download audio track
                    </Button>
                    <Button
                      variant="secondary"
                      className="w-full justify-start gap-2"
                      onClick={() =>
                        createDownload(
                          `${fileName}-full-video.mp4`,
                          `Mock video export\nMode: ${mode}\nSubtitles: ${subtitleEnabled}\nVoice: ${voiceEnabled}`,
                          "video/mp4"
                        )
                      }
                    >
                      <Download className="h-4 w-4" />
                      Download video
                    </Button>
                    <Button asChild variant="outline" className="mt-2 w-full gap-2">
                      <Link href="/jobs/upload_mock">
                        <Sparkles className="h-4 w-4" />
                        Open job editor
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className="mt-5 border-white/10 bg-black/45">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle>5) Segment editor for long subtitles</CardTitle>
                    <CardDescription>
                      Search by text or timecode, select any segment, and edit timing + text in one place.
                    </CardDescription>
                  </div>
                  <Button variant="secondary" size="sm" className="gap-1.5" onClick={addSegment}>
                    <Plus className="h-4 w-4" />
                    Add segment
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 xl:grid-cols-[0.56fr_0.44fr]">
                <div className="grid gap-4 lg:grid-cols-[0.5fr_0.5fr]">
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-8"
                        value={segmentQuery}
                        onChange={(event) => setSegmentQuery(event.target.value)}
                        placeholder="Search segment text or 00:00:18"
                      />
                    </div>

                    <div className="max-h-[360px] space-y-2 overflow-auto pr-1">
                      {visibleSegments.map((segment, index) => (
                        <button
                          key={segment.id}
                          type="button"
                          onClick={() => selectSegment(segment)}
                          className={cn(
                            "w-full rounded-lg border px-3 py-2 text-left text-sm transition",
                            activeSegmentId === segment.id
                              ? "border-white/30 bg-white/[0.09]"
                              : "border-white/10 bg-white/[0.02] hover:border-white/22"
                          )}
                        >
                          <p className="text-xs uppercase tracking-[0.2em] text-white/56">
                            Segment {index + 1} • {segment.start} - {segment.end}
                          </p>
                          <p className="mt-1 line-clamp-2">{segment.text}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    <Label>Active segment</Label>
                    {activeSegment ? (
                      <>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Start</Label>
                            <Input
                              value={activeSegment.start}
                              onChange={(event) => updateSegment(activeSegment.id, { start: event.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">End</Label>
                            <Input
                              value={activeSegment.end}
                              onChange={(event) => updateSegment(activeSegment.id, { end: event.target.value })}
                            />
                          </div>
                        </div>
                        <Textarea
                          className="min-h-[220px]"
                          value={activeSegment.text}
                          onChange={(event) => updateSegment(activeSegment.id, { text: event.target.value })}
                        />
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">Choose a segment from the list.</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <Label>Voiceover script (auto)</Label>
                  <Textarea className="min-h-[300px]" value={voiceoverScript} readOnly />
                  <p className="text-xs text-muted-foreground">
                    Subtitle text and voiceover script stay synchronized, even for long timelines.
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </section>
  );
}
