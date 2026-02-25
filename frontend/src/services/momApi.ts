const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface UploadResponse {
    success: boolean;
    jobId: string;
    message: string;
}

export interface JobStatusResponse {
    success: boolean;
    jobId: string;
    status: "queued" | "processing" | "completed" | "failed";
    progress: number;
    progressMessage: string;
    transcription: string | null;
    error: string | null;
}

export interface MoMGenerateRequest {
    transcriptText: string;
    templateId: string;
    meetingTitle?: string;
    length?: "normal" | "longer";
    currentContent?: string;
}

export interface MoMGenerateResponse {
    success: boolean;
    mom: string;
}

export interface Template {
    id: string;
    name: string;
    category: string;
    structure: string;
    content: string;
    type: "system" | "user";
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
}

// ---------------------------------------------------------------------------
// Upload → Poll → Transcription
// ---------------------------------------------------------------------------

/**
 * Uploads a media file. Returns a jobId (does NOT block until transcription).
 */
export async function uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_URL}/api/mom/upload-transcribe`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
    }

    const data: UploadResponse = await response.json();
    return data.jobId;
}

/**
 * Polls the job status endpoint until the job completes or fails.
 *
 * @param jobId      – the job to poll
 * @param onProgress – called with (progressMessage, progressPercent) on each tick
 * @param intervalMs – polling interval (default 2 000 ms)
 * @returns the final transcription string
 */
export function pollJobStatus(
    jobId: string,
    onProgress?: (message: string, percent: number) => void,
    intervalMs: number = 2000,
): Promise<string> {
    return new Promise((resolve, reject) => {
        const timer = setInterval(async () => {
            try {
                const res = await fetch(`${API_URL}/api/mom/jobs/${jobId}`);
                if (!res.ok) {
                    clearInterval(timer);
                    return reject(new Error("Failed to fetch job status"));
                }

                const data: JobStatusResponse = await res.json();

                if (onProgress) {
                    onProgress(data.progressMessage, data.progress);
                }

                if (data.status === "completed") {
                    clearInterval(timer);
                    resolve(data.transcription!);
                } else if (data.status === "failed") {
                    clearInterval(timer);
                    reject(new Error(data.error || "Transcription failed"));
                }
                // else still queued/processing — keep polling
            } catch (err: any) {
                clearInterval(timer);
                reject(err);
            }
        }, intervalMs);
    });
}

/**
 * Convenience wrapper: upload + poll until done.
 * Drop-in replacement for the old synchronous `uploadAndTranscribe`.
 */
export async function uploadAndTranscribe(
    file: File,
    onProgress?: (message: string, percent: number) => void,
): Promise<string> {
    const jobId = await uploadFile(file);
    return pollJobStatus(jobId, onProgress);
}

// ---------------------------------------------------------------------------
// MoM Generation
// ---------------------------------------------------------------------------

export async function generateMoM(params: MoMGenerateRequest): Promise<string> {
    const response = await fetch(`${API_URL}/api/mom/generate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to generate meeting minutes");
    }

    const data: MoMGenerateResponse = await response.json();
    return data.mom;
}

// ---------------------------------------------------------------------------
// Template CRUD
// ---------------------------------------------------------------------------

export async function getMoMTemplates(): Promise<Template[]> {
    const response = await fetch(`${API_URL}/api/mom/templates`);
    if (!response.ok) {
        throw new Error("Failed to fetch templates");
    }
    return response.json();
}

export async function createMoMTemplate(templateData: Partial<Template>): Promise<Template> {
    const response = await fetch(`${API_URL}/api/mom/templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templateData),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create template");
    }
    return response.json();
}

export async function updateMoMTemplate(id: string, templateData: Partial<Template>): Promise<Template> {
    const response = await fetch(`${API_URL}/api/mom/templates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templateData),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update template");
    }
    return response.json();
}

export async function deleteMoMTemplate(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/mom/templates/${id}`, {
        method: "DELETE",
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete template");
    }
}
