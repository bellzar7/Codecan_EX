import dotenv from "dotenv";
import { Redis } from "ioredis";

dotenv.config();

export class RedisSingleton {
  private static instance: Redis;

  private constructor() {}

  public static getInstance(): Redis {
    const host = process.env.REDIS_HOST || "localhost";
    const port = Number.parseInt(process.env.REDIS_PORT || "6379", 10);
    const password = process.env.REDIS_PASSWORD || undefined;

    if (!RedisSingleton.instance) {
      RedisSingleton.instance = new Redis({
        host,
        port,
        password,
      });
    }
    return RedisSingleton.instance;
  }
}
