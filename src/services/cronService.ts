import cron, { ScheduledTask } from "node-cron";
import { postDaily, dailyReminder } from "../worker"


interface CronJob {
  name: string;
  schedule: string;
  task: ScheduledTask;
  timezone?: string;
}


class CronService {
  private jobs: Map<string, CronJob> = new Map();

  public async initializeCronService(): Promise<void> {
    try {
      // Schedule daily question posting
      this.scheduleJob(
        "daily-question",
        "45 12 * * *", // 12:45 PM daily
        postDaily,
        "America/Toronto"
      );

      // Schedule message reminder every 2 hours
      this.scheduleJob(
        "reminder-message",
        "0 */2 * * *", // Every 2 hours
        dailyReminder,
        "America/Toronto"
      );

      console.log("✅ Cron service initialized");
      this.logScheduledJobs();
    } catch (err) {
      console.error("❌ Failed to start cron service:", err);
      throw err;
    }
  }

  private scheduleJob(
    name: string, 
    schedule: string, 
    taskFunction: () => Promise<void>,
    timezone: string = "UTC"
  ): void {
    const task = cron.schedule(schedule, async () => {
      try {
        console.log(`⏰ Running scheduled job: ${name}`);
        await taskFunction();
        console.log(`✅ Completed scheduled job: ${name}`);
      } catch (error) {
        console.error(`❌ Error in scheduled job ${name}:`, error);
      }
    }, { 
      timezone
    });

    this.jobs.set(name, { name, schedule, task, timezone });
    console.log(`📅 Scheduled job "${name}" at ${schedule} (${timezone})`);
  }

  public stopJob(name: string): boolean {
    const job = this.jobs.get(name);
    if (job) {
      job.task.stop();
      console.log(`⏹️ Stopped job: ${name}`);
      return true;
    }
    return false;
  }

  public startJob(name: string): boolean {
    const job = this.jobs.get(name);
    if (job) {
      job.task.start();
      console.log(`▶️ Started job: ${name}`);
      return true;
    }
    return false;
  }

  public stopAllJobs(): void {
    for (const [name, job] of this.jobs) {
      job.task.stop();
      console.log(`⏹️ Stopped job: ${name}`);
    }
  }

  public async restartJob(name: string): Promise<boolean> {
    const job = this.jobs.get(name);
    if (!job) return false;
    await job.task.stop();
    await job.task.destroy();     // fully tear down
    this.jobs.delete(name);
    return true;
  }

  public async getJobStatus(): Promise<
    { name: string; schedule: string; status: string; nextRun: Date | null; timezone?: string }[]
  > {
    const jobs = Array.from(this.jobs.values());
    return Promise.all(jobs.map(async (job) => ({
      name: job.name,
      schedule: job.schedule,
      status: await job.task.getStatus(),  // 'running' | 'idle' | 'stopped' | 'destroyed'
      nextRun: job.task.getNextRun(),
      timezone: job.timezone
    })));
  }


  private async logScheduledJobs(): Promise<void> {
  console.log("\n📋 Scheduled Jobs:");
  const statuses = await this.getJobStatus();
  for (const job of statuses) {
    const badge =
      job.status === "running"  ? "🟢 RUNNING"  :
      job.status === "idle"     ? "🟡 IDLE"     :
      job.status === "stopped"  ? "🔴 STOPPED"  : "⚫ DESTROYED";
    const next = job.nextRun ? ` next: ${job.nextRun.toISOString()}` : "";
    console.log(`  ${badge} ${job.name}: ${job.schedule} (${job.timezone})${next}`);
  }
  console.log("");
}


  public destroy(): void {
    this.stopAllJobs();
    this.jobs.clear();
    console.log("🗑️ Cron service destroyed");
  }
}

// Export singleton instance
export const cronService = new CronService();

// Export convenience functions
export const initializeCronService = () => cronService.initializeCronService();
export const stopCronService = () => cronService.stopAllJobs();
export const restartCronService = async () => {
  cronService.stopAllJobs();
  await cronService.initializeCronService();
};

// Graceful shutdown handlers
process.on('SIGTERM', () => {
  console.log("SIGTERM received - stopping cron service");
  cronService.destroy();
});

process.on('SIGINT', () => {
  console.log("SIGINT received - stopping cron service");
  cronService.destroy();
  process.exit(0);
});