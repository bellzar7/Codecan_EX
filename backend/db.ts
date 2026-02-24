import { isMainThread } from "node:worker_threads";
import { initModels, type Models } from "@db/init";
import { Sequelize } from "sequelize";

export class SequelizeSingleton {
  private static instance: SequelizeSingleton;
  private readonly sequelize: Sequelize;
  public models: Models;

  private constructor() {
    this.sequelize = new Sequelize(
      process.env.DB_NAME as string,
      process.env.DB_USER as string,
      process.env.DB_PASSWORD as string,
      {
        host: process.env.DB_HOST,
        dialect: "mysql",
        port: Number(process.env.DB_PORT),
        logging: false,
        dialectOptions: {
          charset: "utf8mb4",
        },
        define: {
          charset: "utf8mb4",
          collate: "utf8mb4_unicode_ci",
        },
      }
    );
    this.models = this.initModels();

    // PRODUCTION FIX: Disable auto-sync to prevent ER_LOCK_DEADLOCK
    // Multiple PM2 processes (backend, eco-ws) were running sync concurrently
    // causing DDL conflicts. Use migrations instead via entrypoint.sh
    // For development only, set ENABLE_SEQUELIZE_SYNC=true in .env
    if (process.env.ENABLE_SEQUELIZE_SYNC === "true" && isMainThread) {
      this.syncDatabase();
      console.log(
        "\x1b[36mMain Thread: Database synced successfully...\x1b[0m"
      );
    } else {
      console.log(
        "\x1b[33mSequelize sync disabled. Using migrations for schema management.\x1b[0m"
      );
    }
  }

  public static getInstance(): SequelizeSingleton {
    if (!SequelizeSingleton.instance) {
      SequelizeSingleton.instance = new SequelizeSingleton();
    }
    return SequelizeSingleton.instance;
  }

  public getSequelize(): Sequelize {
    return this.sequelize;
  }

  private initModels() {
    const models = initModels(this.sequelize);
    return models;
  }

  private async syncDatabase() {
    try {
      await this.sequelize.sync({ alter: true });
    } catch (error) {
      console.error("Database sync failed:", error);
      throw error;
    }
  }
}

export const db = SequelizeSingleton.getInstance();
export const sequelize = db.getSequelize();
export const models = db.models;
export default db;
