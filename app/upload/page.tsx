"use client";

import Link from "next/link";
import { ChangeEvent, useMemo, useState } from "react";
import { Download, FileUp, Home, Plus, Radio, Sparkles, Volume2 } from "lucide-react";

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
import { cn } from "@/lib/utils";

type RenderMode = "subtitles" | "voice" | "both";

type Segment = {
  id: string;
  text: string;
};

const initialSegments: Segment[] = [
  { id: "seg_1", text: "Здравствуйте, это пример перевода видео." },
  { id: "seg_2", text: "Вы можете менять фразы и сразу видеть новый результат в preview." },
  { id: "seg_3", text: "Экспорт формируется из текущей версии сегментов." }
];

function createDownload(fileName: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function toSrt(text: string) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return lines
    .map((line, index) => {
      const startSec = index * 4;
      const endSec = startSec + 3;
      const s = `00:00:${String(startSec).padStart(2, "0")},000`;
      const e = `00:00:${String(endSec).padStart(2, "0")},000`;
      return `${index + 1}\n${s} --> ${e}\n${line}`;
    })
    .join("\n\n");
}

export default function UploadPage() {
  const [fileName, setFileName] = useState("");
  const [activeSegmentId, setActiveSegmentId] = useState(initialSegments[0]?.id ?? "");
  const [segments, setSegments] = useState<Segment[]>(initialSegments);
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

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
  };

  const updateSegmentText = (id: string, text: string) => {
    setSegments((prev) => prev.map((segment) => (segment.id === id ? { ...segment, text } : segment)));
  };

  const addSegment = () => {
    const nextId = `seg_${segments.length + 1}`;
    const next = { id: nextId, text: "Новая строка субтитров..." };
    setSegments((prev) => [...prev, next]);
    setActiveSegmentId(nextId);
  };

  const activeSegment = useMemo(
    () => segments.find((segment) => segment.id === activeSegmentId) ?? segments[0],
    [activeSegmentId, segments]
  );

  const transcriptText = useMemo(
    () => segments.map((segment) => segment.text.trim()).filter(Boolean).join("\n"),
    [segments]
  );

  const previewClass = useMemo(() => {
    const size = fontSize === "S" ? "text-base" : fontSize === "L" ? "text-2xl" : "text-xl";
    const position = subtitlePosition === "top" ? "top-5" : "bottom-5";
    return { size, position };
  }, [fontSize, subtitlePosition]);

  const previewText = activeSegment?.text?.trim() || "Выберите сегмент для редактирования";

  return (
    <section className="container pb-14 pt-12">
      <div className="page-head flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="page-kicker">Video editor mode</p>
          <h1 className="section-title">Перевод видео</h1>
          <p className="page-lead">
            Один файл -&gt; сразу редактор. Настройте визуал субтитров, голос, микс дорожек и экспорт.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Главная
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
          <CardTitle>1) Загрузите одно видео</CardTitle>
          <CardDescription>После выбора файла редактор активируется на этой же странице.</CardDescription>
        </CardHeader>
        <CardContent>
          <label className="flex min-h-40 cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-white/20 bg-white/[0.02] p-6 text-center hover:border-white/30">
            <FileUp className="h-6 w-6 text-white/75" />
            <div>
              <p className="text-sm font-medium">Выберите видеофайл</p>
              <p className="text-xs text-muted-foreground">mp4 / mov / mkv (mock)</p>
            </div>
            <input type="file" accept="video/*" className="hidden" onChange={onFileChange} />
          </label>
          {fileName && (
            <p className="mt-3 text-sm text-muted-foreground">
              Загружено: <span className="text-foreground">{fileName}</span>
            </p>
          )}
        </CardContent>
      </Card>

      {fileName && (
        <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.95fr]">
          <div className="space-y-5">
            <Card className="border-white/10 bg-black/45">
              <CardHeader>
                <CardTitle>2) Preview</CardTitle>
                <CardDescription>Смотрите как будет выглядеть финальный слой перевода.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative flex h-72 items-center justify-center rounded-xl border border-white/10 bg-black/35">
                  <p className="text-sm text-muted-foreground">Mock video preview</p>
                  {subtitleEnabled && (mode === "subtitles" || mode === "both") && (
                    <div
                      className={cn(
                        "absolute left-1/2 w-[90%] -translate-x-1/2 rounded-lg px-3 py-2 text-center leading-snug",
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
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-black/45">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle>3) Редактор сегментов</CardTitle>
                    <CardDescription>Редактируйте строки поштучно, а не одним длинным полем.</CardDescription>
                  </div>
                  <Button variant="secondary" size="sm" className="gap-1.5" onClick={addSegment}>
                    <Plus className="h-4 w-4" />
                    Добавить
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 lg:grid-cols-[0.55fr_0.45fr]">
                <div className="max-h-[290px] space-y-2 overflow-auto pr-1">
                  {segments.map((segment, index) => (
                    <button
                      key={segment.id}
                      type="button"
                      onClick={() => setActiveSegmentId(segment.id)}
                      className={cn(
                        "w-full rounded-lg border px-3 py-2 text-left text-sm transition",
                        activeSegmentId === segment.id
                          ? "border-white/30 bg-white/[0.09]"
                          : "border-white/10 bg-white/[0.02] hover:border-white/22"
                      )}
                    >
                      <p className="text-xs uppercase tracking-[0.2em] text-white/56">Segment {index + 1}</p>
                      <p className="mt-1 line-clamp-2">{segment.text}</p>
                    </button>
                  ))}
                </div>

                <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <Label>Текст активного сегмента</Label>
                  {activeSegment ? (
                    <Textarea
                      className="min-h-[200px]"
                      value={activeSegment.text}
                      onChange={(event) => updateSegmentText(activeSegment.id, event.target.value)}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">Выберите сегмент слева.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-5 xl:sticky xl:top-24 xl:self-start">
            <Card className="border-white/10 bg-black/45">
              <CardHeader>
                <CardTitle>4) Настройки вывода</CardTitle>
                <CardDescription>Язык, стиль, голос и аудио-микс в одном блоке.</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="general">
                  <TabsList className="w-full">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="subtitles">Subtitles</TabsTrigger>
                    <TabsTrigger value="audio">Audio</TabsTrigger>
                  </TabsList>

                  <TabsContent value="general" className="space-y-3 pt-3">
                    <div className="space-y-2">
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
                    <div className="space-y-2">
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
                    <div className="space-y-2">
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
                    <div className="space-y-2">
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
                  </TabsContent>

                  <TabsContent value="subtitles" className="space-y-3 pt-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Font size</Label>
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
                      <div className="space-y-2">
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
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
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
                      <div className="space-y-2">
                        <Label>Text color</Label>
                        <Input
                          type="color"
                          value={subtitleColor}
                          onChange={(event) => setSubtitleColor(event.target.value)}
                          className="h-10 p-1"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
                      <Label htmlFor="subtitle-bg">Background</Label>
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
                <CardTitle>5) Экспорт</CardTitle>
                <CardDescription>Формируется из текущего состояния редактора.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="secondary"
                  className="w-full justify-start gap-2"
                  onClick={() => createDownload(`${fileName}.srt`, toSrt(transcriptText), "text/plain")}
                >
                  <Download className="h-4 w-4" />
                  Скачать субтитры (.srt)
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
                  Скачать только аудио
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
                  Скачать видео
                </Button>

                <Button asChild variant="outline" className="mt-2 w-full gap-2">
                  <Link href="/jobs/upload_mock">
                    <Sparkles className="h-4 w-4" />
                    Открыть детальный job-редактор
                  </Link>
                </Button>

                <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs text-muted-foreground">
                  1) Выберите файл. 2) Отредактируйте сегменты. 3) Настройте стиль/голос. 4) Скачайте нужный формат.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </section>
  );
}
