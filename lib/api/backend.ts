export type ApiSession = {
  id: string;
  user_id: string | null;
  status: "ACTIVE" | "EXPIRED" | "CLOSED";
  created_at: string;
  expires_at: string;
  last_activity_at: string;
  video_object_key: string | null;
  remaining_seconds: number;
  active_job_id: string | null;
};

export type ApiJob = {
  id: string;
  session_id: string;
  status: "queued" | "processing" | "done" | "failed" | "expired";
  progress: number;
  model_version_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ApiSegment = {
  id: string;
  order_index: number;
  start_sec: number;
  end_sec: number;
  text: string;
  confidence: number;
  version: number;
};

export type ApiExport = {
  id: string;
  job_id: string;
  format: "SRT" | "VTT" | "TXT" | "AUDIO" | "VIDEO";
  status: "queued" | "done" | "failed";
  object_key: string;
  download_url: string;
  created_at: string;
};

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/v1";

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body !== undefined) headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `${response.status} ${response.statusText}`;
    try {
      const data = await response.json();
      if (typeof data?.detail === "string") message = data.detail;
    } catch {
      // ignore parse error
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function createSession(userId?: string) {
  return request<ApiSession>("/sessions", {
    method: "POST",
    body: { user_id: userId ?? null },
  });
}

export async function getSession(sessionId: string) {
  return request<ApiSession>(`/sessions/${sessionId}`);
}

export async function createUploadUrl(
  sessionId: string,
  fileName: string,
  contentType: string,
  fileSizeBytes?: number
) {
  return request<{ object_key: string; upload_url: string; expires_in_seconds: number }>(
    `/sessions/${sessionId}/upload-url`,
    {
      method: "POST",
      body: {
        file_name: fileName,
        content_type: contentType,
        file_size_bytes: fileSizeBytes ?? null,
      },
    }
  );
}

export async function uploadFileBySignedUrl(uploadUrl: string, file: File) {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type || "video/mp4" },
  });
  if (!response.ok) throw new Error(`upload_failed_${response.status}`);
}

export async function createJob(sessionId: string, modelVersionId?: string) {
  return request<ApiJob>(`/sessions/${sessionId}/jobs`, {
    method: "POST",
    body: { model_version_id: modelVersionId ?? null },
  });
}

export async function getJob(jobId: string) {
  return request<ApiJob>(`/jobs/${jobId}`);
}

export async function getJobSegments(jobId: string) {
  return request<ApiSegment[]>(`/jobs/${jobId}/segments`);
}

export async function patchJobSegments(
  jobId: string,
  patches: Array<{
    id: string;
    order_index?: number;
    start_sec?: number;
    end_sec?: number;
    text?: string;
  }>
) {
  return request<ApiSegment[]>(`/jobs/${jobId}/segments`, {
    method: "PATCH",
    body: { segments: patches },
  });
}

export async function regenerateJob(jobId: string, styleHint?: string) {
  return request<ApiSegment[]>(`/jobs/${jobId}/regenerate`, {
    method: "POST",
    body: { style_hint: styleHint ?? null },
  });
}

export async function createExport(jobId: string, format: "SRT" | "VTT" | "TXT" | "AUDIO" | "VIDEO") {
  return request<ApiExport>(`/jobs/${jobId}/export`, {
    method: "POST",
    body: { format },
  });
}
