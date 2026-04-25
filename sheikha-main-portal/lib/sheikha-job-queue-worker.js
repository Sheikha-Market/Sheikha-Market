const path = require('node:path');
const SheikhaJobQueue = require('./sheikha-job-queue');
const SheikhaVisualEngine = require('./sheikha-visual-generation-engine');
const { sheikhaRealtimeHub } = require('./sheikha-realtime-hub');

class SheikhaJobQueueWorker {
    constructor(options = {}) {
        this.rootDir = options.rootDir || path.join(__dirname, '..');
        this.intervalMs = Number(options.intervalMs) || 1500;
        this.queue = new SheikhaJobQueue(this.rootDir);
        this.visualEngine = new SheikhaVisualEngine();
        this.timer = null;
        this.running = false;
        this.processing = false;
    }

    start() {
        if (this.running) return;
        this.running = true;

        this.timer = setInterval(() => {
            this.tick().catch((error) => {
                console.error('[JobWorker] tick failed:', error.message);
            });
        }, this.intervalMs);

        this.tick().catch((error) => {
            console.error('[JobWorker] initial tick failed:', error.message);
        });
    }

    stop() {
        this.running = false;
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    async tick() {
        if (!this.running || this.processing) return;

        const next = this.queue.getNext();
        if (!next.success || !next.job) return;

        const { job } = next;
        this.processing = true;

        this.queue.markRunning(job.id);
        sheikhaRealtimeHub.emitEvent('visual.job.started', {
            queueJobId: job.id,
            type: job.type,
            mode: job.mode,
            priority: job.priority,
            retries: job.retries
        });

        try {
            const result = await this.execute(job);
            this.queue.markDone(job.id, result);

            sheikhaRealtimeHub.emitEvent('visual.job.completed', {
                queueJobId: job.id,
                type: job.type,
                mode: job.mode,
                result
            });
        } catch (error) {
            const failed = this.queue.markFailed(job.id, error.message || 'unknown_error');
            const current = failed.job || null;

            sheikhaRealtimeHub.emitEvent('visual.job.failed', {
                queueJobId: job.id,
                type: job.type,
                mode: job.mode,
                error: error.message || 'unknown_error',
                retries: current?.retries || 0,
                status: current?.status || 'failed'
            });
        } finally {
            this.processing = false;
        }
    }

    async execute(job) {
        if (job.type === 'visual' || job.type === 'video') {
            return this.executeVisual(job);
        }

        if (job.type === 'encoding') {
            return {
                engine: 'queue-worker',
                status: 'accepted',
                note: 'encoding handler will be wired in next phase',
                payload: job.payload
            };
        }

        return {
            engine: 'queue-worker',
            status: 'skipped',
            note: `no specific handler for job type ${job.type}`,
            payload: job.payload
        };
    }

    async executeVisual(job) {
        const rawPayload = job.payload?.payload || job.payload || {};
        const prompt = rawPayload.prompt || rawPayload.command || 'إنتاج بصري تلقائي لشيخة';

        const plan = this.visualEngine.planVisual(prompt, {
            type: rawPayload.type || job.mode || 'image',
            intent: rawPayload.intent,
            aspectRatio: rawPayload.aspectRatio,
            resolution: rawPayload.resolution,
            quality: rawPayload.quality
        });

        const visualJob = this.visualEngine.createVisualJob({
            ...plan,
            type: rawPayload.type || plan.type,
            intent: rawPayload.intent || plan.intent,
            palette: rawPayload.palette || plan.palette,
            adapterChain: rawPayload.adapterChain || plan.adapterChain,
            prompt
        });

        this.visualEngine.executeVisualJob(visualJob.id);

        await new Promise((resolve) => {
            setTimeout(resolve, 6200);
        });

        const latest = this.visualEngine.visualJobs.find((item) => item.id === visualJob.id) || visualJob;

        return {
            engine: 'sheikha_visual_generation_v1',
            queueJobId: job.id,
            visualJobId: latest.id,
            status: latest.status,
            qualityScore: latest.metadata?.quality_score || 0,
            assets: latest.assets || {},
            completedAt: latest.timestamps?.completed || new Date().toISOString()
        };
    }
}

module.exports = SheikhaJobQueueWorker;
