import { v4 as uuidv4 } from "uuid";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const MAX_CONCURRENT_JOBS = parseInt(process.env.MAX_CONCURRENT_JOBS, 10) || 2;
const JOB_TTL_MS = 30 * 60 * 1000; // 30 minutes — auto-prune completed/failed

// ---------------------------------------------------------------------------
// In-Memory Store
// ---------------------------------------------------------------------------

/** @type {Map<string, object>} */
const jobs = new Map();

/** @type {Array<{jobId: string, processFn: Function}>} */
const queue = [];

let running = 0;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Creates a new job entry.
 * @returns {{ jobId: string }}
 */
export function createJob() {
    const jobId = uuidv4();
    const job = {
        jobId,
        status: "queued",
        progress: 0,
        progressMessage: "Waiting in queue…",
        transcription: null,
        error: null,
        createdAt: Date.now(),
    };
    jobs.set(jobId, job);
    return { jobId };
}

/**
 * Returns the current state of a job, or null if not found.
 */
export function getJob(jobId) {
    return jobs.get(jobId) || null;
}

/**
 * Merges `fields` into the existing job object.
 */
export function updateJob(jobId, fields) {
    const job = jobs.get(jobId);
    if (!job) return;
    Object.assign(job, fields);
}

/**
 * Removes a job from the store.
 */
export function deleteJob(jobId) {
    jobs.delete(jobId);
}

/**
 * Enqueue a processing function for a job.
 * If under the concurrency limit, runs immediately.
 * Otherwise the job waits in a FIFO queue.
 *
 * @param {string}   jobId
 * @param {Function} processFn  – async function that does the heavy work
 */
export function enqueue(jobId, processFn) {
    queue.push({ jobId, processFn });
    _drain();
}

// ---------------------------------------------------------------------------
// Internal Queue Management
// ---------------------------------------------------------------------------

function _drain() {
    while (running < MAX_CONCURRENT_JOBS && queue.length > 0) {
        const { jobId, processFn } = queue.shift();
        running++;

        // Fire-and-forget — errors are recorded inside processFn
        processFn()
            .catch(() => { /* errors handled by the caller */ })
            .finally(() => {
                running--;
                _drain();
            });
    }
}

// ---------------------------------------------------------------------------
// Auto-Prune
// ---------------------------------------------------------------------------

setInterval(() => {
    const now = Date.now();
    for (const [id, job] of jobs) {
        if (
            (job.status === "completed" || job.status === "failed") &&
            now - job.createdAt > JOB_TTL_MS
        ) {
            jobs.delete(id);
        }
    }
}, 5 * 60 * 1000); // check every 5 minutes
