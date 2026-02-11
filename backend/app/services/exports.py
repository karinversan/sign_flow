from app.models import TranscriptSegment


def _format_srt_time(seconds: float) -> str:
    total_ms = int(max(seconds, 0) * 1000)
    h = total_ms // 3_600_000
    m = (total_ms % 3_600_000) // 60_000
    s = (total_ms % 60_000) // 1000
    ms = total_ms % 1000
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def _format_vtt_time(seconds: float) -> str:
    total_ms = int(max(seconds, 0) * 1000)
    h = total_ms // 3_600_000
    m = (total_ms % 3_600_000) // 60_000
    s = (total_ms % 60_000) // 1000
    ms = total_ms % 1000
    return f"{h:02d}:{m:02d}:{s:02d}.{ms:03d}"


def render_srt(segments: list[TranscriptSegment]) -> str:
    lines: list[str] = []
    for idx, segment in enumerate(segments, start=1):
        lines.append(str(idx))
        lines.append(f"{_format_srt_time(segment.start_sec)} --> {_format_srt_time(segment.end_sec)}")
        lines.append(segment.text)
        lines.append("")
    return "\n".join(lines).strip() + "\n"


def render_vtt(segments: list[TranscriptSegment]) -> str:
    lines = ["WEBVTT", ""]
    for segment in segments:
        lines.append(f"{_format_vtt_time(segment.start_sec)} --> {_format_vtt_time(segment.end_sec)}")
        lines.append(segment.text)
        lines.append("")
    return "\n".join(lines).strip() + "\n"


def render_txt(segments: list[TranscriptSegment]) -> str:
    return "\n".join(segment.text for segment in segments if segment.text.strip()) + "\n"

