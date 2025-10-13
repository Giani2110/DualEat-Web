import cron, { ScheduledTask } from "node-cron";
import { prisma } from "../prisma/prisma";

export class CleanupJob {
  private isRunning: boolean;
  private task: ScheduledTask | null;

  constructor() {
    this.isRunning = false;
    this.task = null;
  }

  start() {
    this.task = cron.schedule(
      "0 0 * * *",
      async () => {
        console.log("Ejecutando tarea de limpieza diaria...");
        await this.NotificationCleanup();
      },
      { timezone: "America/Argentina/Buenos_Aires" }
    );
  }

  async NotificationCleanup() {
    if (this.isRunning) {
      console.log("La tarea de limpieza ya está en ejecución.");
      return;
    }
    this.isRunning = true;
    try {
      const date = new Date();
      date.setDate(date.getDate() - 30);

      const result = await prisma.notification.deleteMany({
        where: {
          created_at: { lt: date },
          deleted: true,
        },
      });

      console.log(`🧹 Se eliminaron ${result.count} notificaciones antiguas.`);
    } catch (error) {
      console.error("Error durante la limpieza:", error);
    } finally {
      this.isRunning = false;
    }
  }

  async ManualNotificationCleanup() {
    console.log("Ejecutando limpieza manual...");
    await this.NotificationCleanup();
  }

  stop() {
    if (this.task) {
      this.task.stop();
      console.log("Tarea de limpieza detenida.");
    }
  }
}
