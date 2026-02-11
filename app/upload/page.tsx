"use client";

import Link from "next/link";
import { ChangeEvent, useMemo, useState } from "react";
import { Download, FileUp, Home, Radio, Volume2 } from "lucide-react";

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
import { outputLanguages, signLanguages, voiceOptions } from "@/lib/mock/data";

type RenderMode = "subtitles" | "voice" | "both";

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

  const [transcript, setTranscript] = useState(
    "Здравствуйте, это пример перевода видео.\nВы можете редактировать текст субтитров перед экспортом."
  );

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
  };

  const previewClass = useMemo(() => {
    const size = fontSize === "S" ? "text-base" : fontSize === "L" ? "text-2xl" : "text-xl";
    const position = subtitlePosition === "top" ? "top-5" : "bottom-5";
    return { size, position };
  }, [fontSize, subtitlePosition]);

  return (
    <section className="container pb-14 pt-12">
      <div className="page-head flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="page-kicker">Video editor mode</p>
          <h1 className="section-title">Перевод видео</h1>
          <p className="page-lead">
            Загрузите один файл и сразу редактируйте перевод: язык, субтитры, озвучку, стиль и экспорт.
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
          <CardTitle>1) Загрузка одного видео</CardTitle>
          <CardDescription>После выбора файла редактор открывается сразу на этой же странице.</CardDescription>
        </CardHeader>
        <CardContent>
          <label className="flex min-h-40 cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-white/20 bg-white/[0.02] p-6 text-center hover:border-white/30">
            <FileUp className="h-6 w-6 text-white/75" />
            <div>
              <p className="text-sm font-medium">Выберите один видеофайл</p>
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
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_0.9fr]">
          <Card className="border-white/10 bg-black/45">
            <CardHeader>
              <CardTitle>2) Редактор перевода</CardTitle>
              <CardDescription>
                Вы можете сразу выбрать как должен выглядеть итог: субтитры, озвучка или оба варианта.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-white/60">Preview</p>
                <div className="relative flex h-64 items-center justify-center rounded-lg border border-white/10 bg-black/35">
                  <p className="text-sm text-muted-foreground">Mock video preview</p>
                  {subtitleEnabled && (mode === "subtitles" || mode === "both") && (
                    <div
                      className={`absolute ${previewClass.position} left-1/2 w-[90%] -translate-x-1/2 px-3 py-2 text-center ${previewClass.size}`}
                      style={{
                        color: subtitleColor,
                        fontFamily,
                        background: subtitleBackground ? "rgba(0,0,0,0.58)" : "transparent",
                        borderRadius: "10px"
                      }}
                    >
                      {transcript.split("\n")[0]}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
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
              </div>

              <div className="grid gap-3 md:grid-cols-2">
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
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <p className="mb-3 text-sm font-medium">Subtitle visual settings</p>
                <div className="grid gap-3 md:grid-cols-2">
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

                <div className="mt-3 grid gap-3 md:grid-cols-2">
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
                    <Label>Subtitle color</Label>
                    <Input
                      type="color"
                      value={subtitleColor}
                      onChange={(event) => setSubtitleColor(event.target.value)}
                      className="h-10 p-1"
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between rounded-lg border border-white/10 bg-black/25 px-3 py-2">
                  <Label htmlFor="subtitle-bg">Subtitle background</Label>
                  <Switch id="subtitle-bg" checked={subtitleBackground} onCheckedChange={setSubtitleBackground} />
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <p className="mb-3 text-sm font-medium">Audio mix</p>
                <div className="space-y-3">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Original video volume</span>
                      <span>{originalVolume}%</span>
                    </div>
                    <Slider value={[originalVolume]} onValueChange={(v) => setOriginalVolume(v[0] ?? 70)} max={100} />
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Overlay voice volume</span>
                      <span>{overlayVolume}%</span>
                    </div>
                    <Slider value={[overlayVolume]} onValueChange={(v) => setOverlayVolume(v[0] ?? 75)} max={100} />
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
                  <span className="text-sm">Enable subtitles</span>
                  <Switch checked={subtitleEnabled} onCheckedChange={setSubtitleEnabled} />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
                  <span className="text-sm">Enable voiceover</span>
                  <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Editable transcript</Label>
                <textarea
                  className="min-h-32 w-full rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm"
                  value={transcript}
                  onChange={(event) => setTranscript(event.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-black/45">
            <CardHeader>
              <CardTitle>3) Экспорт</CardTitle>
              <CardDescription>Mock-кнопки экспорта результата.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="secondary"
                className="w-full justify-start gap-2"
                onClick={() => createDownload(`${fileName}.srt`, toSrt(transcript), "text/plain")}
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
                Скачать только аудио дорожку
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
                Скачать видео полностью
              </Button>

              <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Кратко как пользоваться</p>
                <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs">
                  <li>Загрузите один файл.</li>
                  <li>Выберите язык и режим перевода.</li>
                  <li>Настройте стиль субтитров и громкости.</li>
                  <li>Отредактируйте текст и экспортируйте нужный формат.</li>
                </ol>
              </div>

              <Button asChild variant="outline" className="mt-2 w-full">
                <Link href="/">Вернуться на главный экран</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  );
}
