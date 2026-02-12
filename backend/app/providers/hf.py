import json
from pathlib import Path

from app.config import settings
from app.providers.base import ModelProvider, ProviderSegment
from app.services.model_artifacts import ensure_model_artifacts


class HuggingFaceProvider(ModelProvider):
    name = "huggingface"

    def health(self) -> dict:
        return {
            "provider": self.name,
            "status": "ok" if not settings.hf_offline else "degraded",
            "offline_mode": settings.hf_offline,
            "message": "HF runtime enabled. Provide artifacts with segments.json/transcript.txt for deterministic output.",
        }

    def _segments_from_artifacts(self, artifact_path: str | None) -> list[ProviderSegment] | None:
        if not artifact_path:
            return None

        root = Path(artifact_path)
        if not root.exists():
            return None

        segments_json = root / "segments.json"
        if segments_json.exists():
            raw = json.loads(segments_json.read_text(encoding="utf-8"))
            if isinstance(raw, list):
                segments: list[ProviderSegment] = []
                for idx, item in enumerate(raw):
                    if not isinstance(item, dict):
                        continue
                    text = str(item.get("text", "")).strip()
                    if not text:
                        continue
                    start_sec = float(item.get("start_sec", idx * 3.5))
                    end_sec = float(item.get("end_sec", start_sec + 3.5))
                    confidence = float(item.get("confidence", 0.85))
                    segments.append(
                        ProviderSegment(
                            order_index=idx,
                            start_sec=round(start_sec, 3),
                            end_sec=round(end_sec, 3),
                            text=text,
                            confidence=max(min(confidence, 1.0), 0.01),
                        )
                    )
                if segments:
                    return segments

        transcript_txt = root / "transcript.txt"
        if transcript_txt.exists():
            lines = [line.strip() for line in transcript_txt.read_text(encoding="utf-8").splitlines() if line.strip()]
            if lines:
                segments = []
                cursor = 0.0
                for idx, line in enumerate(lines):
                    end_sec = cursor + 3.5
                    segments.append(
                        ProviderSegment(
                            order_index=idx,
                            start_sec=round(cursor, 3),
                            end_sec=round(end_sec, 3),
                            text=line,
                            confidence=0.84,
                        )
                    )
                    cursor = end_sec
                return segments

        return None

    def transcribe(self, video_object_key: str, options: dict | None = None) -> list[ProviderSegment]:
        model_label = "hf-model"
        artifact_path: str | None = None
        hf_repo: str | None = None
        hf_revision: str = "main"
        if options and isinstance(options.get("model_id"), str):
            model_label = options["model_id"]
        if options and isinstance(options.get("artifact_path"), str):
            artifact_path = options["artifact_path"]
        if options and isinstance(options.get("hf_repo"), str):
            hf_repo = options["hf_repo"]
        if options and isinstance(options.get("hf_revision"), str):
            hf_revision = options["hf_revision"]

        if not artifact_path and hf_repo:
            artifact_path = ensure_model_artifacts(model_label, hf_repo, hf_revision)

        artifact_segments = self._segments_from_artifacts(artifact_path)
        if artifact_segments:
            return artifact_segments

        fallback_texts = [
            f"[{model_label}] HF fallback transcript path.",
            "No artifact transcript files were found, so baseline output is used.",
            "Provide segments.json or transcript.txt in model artifacts for custom runtime output.",
        ]
        segments: list[ProviderSegment] = []
        cursor = 0.0
        for idx, line in enumerate(fallback_texts):
            duration = 4.0
            segments.append(
                ProviderSegment(
                    order_index=idx,
                    start_sec=round(cursor, 3),
                    end_sec=round(cursor + duration, 3),
                    text=line,
                    confidence=0.76 - (idx * 0.03),
                )
            )
            cursor += duration
        return segments

    def regenerate(self, segments: list[ProviderSegment], options: dict | None = None) -> list[ProviderSegment]:
        return [
            ProviderSegment(
                order_index=segment.order_index,
                start_sec=segment.start_sec,
                end_sec=segment.end_sec,
                text=f"{segment.text} [hf-pass]",
                confidence=max(segment.confidence - 0.02, 0.5),
            )
            for segment in segments
        ]
