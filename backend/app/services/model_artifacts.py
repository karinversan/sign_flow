from pathlib import Path

from app.config import settings


def _safe_folder_name(value: str) -> str:
    return "".join(char if char.isalnum() or char in {"-", "_", "."} else "-" for char in value)


def _local_model_dir(model_id: str, hf_repo: str, hf_revision: str) -> Path:
    cache_root = Path(settings.hf_cache_dir)
    return cache_root / "models" / _safe_folder_name(model_id) / _safe_folder_name(hf_repo) / _safe_folder_name(hf_revision)


def ensure_model_artifacts(model_id: str, hf_repo: str, hf_revision: str) -> str:
    model_dir = _local_model_dir(model_id, hf_repo, hf_revision)

    # Local pseudo-repos are always resolved by creating a deterministic placeholder directory.
    if hf_repo.startswith("local/"):
        model_dir.mkdir(parents=True, exist_ok=True)
        marker = model_dir / "MODEL_PLACEHOLDER.txt"
        if not marker.exists():
            marker.write_text(
                "Local placeholder model artifacts.\n"
                f"model_id={model_id}\nrepo={hf_repo}\nrevision={hf_revision}\n",
                encoding="utf-8",
            )
        return str(model_dir)

    if settings.hf_offline:
        if model_dir.exists():
            return str(model_dir)
        raise RuntimeError("hf_offline_without_cached_artifacts")

    try:
        from huggingface_hub import snapshot_download
    except ImportError as exc:
        raise RuntimeError("huggingface_hub_not_installed") from exc

    downloaded_path = snapshot_download(
        repo_id=hf_repo,
        revision=hf_revision,
        cache_dir=settings.hf_cache_dir,
        token=settings.hf_token,
    )
    return str(downloaded_path)
