import EventEmitter from 'events';

export interface QueueJob<T = any> {
  id: string;
  name: string;
  data: T;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  result?: any;
  error?: string;
  created_at: string;
}

class JobQueueService extends EventEmitter {
  private jobs: Map<string, QueueJob> = new Map();
  private isProcessing = false;

  async addJob<T>(name: string, data: T): Promise<QueueJob<T>> {
    const job: QueueJob<T> = {
      id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name,
      data,
      status: 'queued',
      created_at: new Date().toISOString(),
    };

    this.jobs.set(job.id, job);
    console.log(`[JobQueue] Queued job ${job.id} (${name})`);

    // Process asynchronously in background
    setTimeout(() => this.processNext(), 100);

    return job;
  }

  private async processNext() {
    if (this.isProcessing) return;

    const queuedJob = Array.from(this.jobs.values()).find((j) => j.status === 'queued');
    if (!queuedJob) return;

    this.isProcessing = true;
    queuedJob.status = 'processing';

    try {
      console.log(`[JobQueue] Processing job ${queuedJob.id} (${queuedJob.name})...`);
      
      // Simulate / perform background processing
      if (queuedJob.name === 'parse_resume') {
        // Asynchronous background NLP / resume embedding
        await new Promise((resolve) => setTimeout(resolve, 800));
        queuedJob.result = { processed: true, message: 'Resume embeddings generated' };
      } else if (queuedJob.name === 'generate_report_async') {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        queuedJob.result = { processed: true, message: 'Report cached to Redis' };
      }

      queuedJob.status = 'completed';
      this.emit('completed', queuedJob);
    } catch (err: any) {
      queuedJob.status = 'failed';
      queuedJob.error = err.message;
      this.emit('failed', queuedJob);
    } finally {
      this.isProcessing = false;
      this.processNext();
    }
  }

  getJob(id: string): QueueJob | undefined {
    return this.jobs.get(id);
  }
}

export const jobQueue = new JobQueueService();

