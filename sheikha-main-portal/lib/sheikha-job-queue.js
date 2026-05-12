const fs = require('node:fs');
const path = require('node:path');
const { sheikhaRealtimeHub } = require('./sheikha-realtime-hub');

class SheikhaJobQueue {
    constructor(rootDir) {
        const baseDir = typeof rootDir === 'string' && rootDir.trim() ? rootDir : path.join(__dirname, '..');
        this.rootDir = baseDir;
        this.queueFile = path.join(baseDir, 'data', 'job-queue.json');
        this.maxRetries = {
            normal: 3,
            high: 5
        };
        this.queue = this.load();
    }

    now() {
        return new Date().toISOString();
    }

    refresh() {
        this.queue = this.load();
    }

    load() {
        try {
            if (!fs.existsSync(this.queueFile)) return [];
            const raw = fs.readFileSync(this.queueFile, 'utf8');
            return JSON.parse(raw || '[]');
        } catch {
            return [];
        }
    }

    persist() {
        fs.mkdirSync(path.dirname(this.queueFile), { recursive: true });
        fs.writeFileSync(this.queueFile, JSON.stringify(this.queue, null, 2), 'utf8');
    }

    createJob(payload = {}) {
        this.refresh();

        const job = {
            id: `JOB-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
            type: payload.type || 'visual',
            mode: payload.mode || 'image',
            priority: payload.priority || 'normal',
            status: 'queued',
            retries: 0,
            maxRetries: payload.priority === 'high' ? this.maxRetries.high : this.maxRetries.normal,
            payload,
            createdAt: this.now(),
            updatedAt: this.now()
        };

        this.queue.push(job);
        this.sortQueue();
        this.persist();

        sheikhaRealtimeHub.emitEvent('job.queued', {
            jobId: job.id,
            type: job.type,
            mode: job.mode,
            priority: job.priority,
            status: job.status,
            createdAt: job.createdAt
        });

        return { success: true, job };
    }

    sortQueue() {
        const priorityWeight = { high: 0, normal: 1, low: 2 };
        this.queue.sort((a, b) => {
            const pa = priorityWeight[a.priority] ?? 9;
            const pb = priorityWeight[b.priority] ?? 9;
            if (pa !== pb) return pa - pb;
            return new Date(a.createdAt) - new Date(b.createdAt);
        });
    }

    list(status = null) {
        this.refresh();
        if (!status) return { success: true, jobs: this.queue };
        return { success: true, jobs: this.queue.filter(j => j.status === status) };
    }

    getNext() {
        this.refresh();
        const next = this.queue.find(j => j.status === 'queued');
        return { success: true, job: next || null };
    }

    markRunning(jobId) {
        this.refresh();
        const job = this.queue.find(j => j.id === jobId);
        if (!job) return { success: false, error: 'job_not_found' };
        job.status = 'running';
        job.updatedAt = this.now();
        this.persist();

        sheikhaRealtimeHub.emitEvent('job.started', {
            jobId: job.id,
            type: job.type,
            mode: job.mode,
            priority: job.priority,
            status: job.status,
            retries: job.retries,
            updatedAt: job.updatedAt
        });

        return { success: true, job };
    }

    markDone(jobId, result = {}) {
        this.refresh();
        const job = this.queue.find(j => j.id === jobId);
        if (!job) return { success: false, error: 'job_not_found' };
        job.status = 'completed';
        job.result = result;
        job.updatedAt = this.now();
        this.persist();

        sheikhaRealtimeHub.emitEvent('job.completed', {
            jobId: job.id,
            type: job.type,
            mode: job.mode,
            priority: job.priority,
            status: job.status,
            result,
            updatedAt: job.updatedAt
        });

        return { success: true, job };
    }

    markFailed(jobId, error = 'unknown_error') {
        this.refresh();
        const job = this.queue.find(j => j.id === jobId);
        if (!job) return { success: false, error: 'job_not_found' };

        job.retries += 1;
        job.updatedAt = this.now();
        job.lastError = error;

        const noRetryErrors = new Set([
            'no_harm_violation',
            'policy_blocked',
            'security_blocked',
            'forbidden'
        ]);

        if (noRetryErrors.has(String(error || '').trim())) {
            job.status = 'failed';
            this.persist();

            sheikhaRealtimeHub.emitEvent('job.failed', {
                jobId: job.id,
                type: job.type,
                mode: job.mode,
                priority: job.priority,
                status: job.status,
                retries: job.retries,
                error,
                updatedAt: job.updatedAt
            });

            return { success: true, job };
        }

        if (job.retries >= job.maxRetries) {
            job.status = 'failed';
        } else {
            job.status = 'queued';
        }

        this.persist();

        if (job.status === 'failed') {
            sheikhaRealtimeHub.emitEvent('job.failed', {
                jobId: job.id,
                type: job.type,
                mode: job.mode,
                priority: job.priority,
                status: job.status,
                retries: job.retries,
                error,
                updatedAt: job.updatedAt
            });
        }

        return { success: true, job };
    }

    stats() {
        this.refresh();
        const stats = {
            queued: 0,
            running: 0,
            completed: 0,
            failed: 0
        };

        for (const job of this.queue) {
            if (stats[job.status] !== undefined) stats[job.status] += 1;
        }

        return {
            success: true,
            stats,
            total: this.queue.length
        };
    }

    // توافق مع الاستخدامات القديمة
    getStats() {
        const snapshot = this.stats();
        return {
            total: snapshot.total,
            pending: snapshot.stats.queued,
            processing: snapshot.stats.running,
            completed: snapshot.stats.completed,
            failed: snapshot.stats.failed,
            retrying: 0,
            activeWorkers: 0
        };
    }

    getJob(jobId) {
        this.refresh();
        return this.queue.find(j => j.id === jobId);
    }

    getRecentJobs(limit = 20, type = null) {
        this.refresh();
        let recent = [...this.queue].reverse().slice(0, limit);
        if (type) {
            recent = recent.filter(j => j.type === type);
        }
        return recent;
    }

    enqueue(jobType, payload, options = {}) {
        const priorityMap = { 5: 'high', 4: 'high', 3: 'normal', 2: 'low', 1: 'low' };
        const priority = typeof options.priority === 'number'
            ? (priorityMap[options.priority] || 'normal')
            : (options.priority || 'normal');

        const response = this.createJob({
            type: String(jobType || 'visual').replace('-encode', ''),
            mode: payload?.mode || payload?.outputFormat || 'image',
            priority,
            payload
        });

        return response.job;
    }
}

const JOB_PRIORITY = {
    HIGH: 'high',
    NORMAL: 'normal',
    LOW: 'low'
};

module.exports = SheikhaJobQueue;
module.exports.SheikhaJobQueue = SheikhaJobQueue;
module.exports.JOB_PRIORITY = JOB_PRIORITY;
