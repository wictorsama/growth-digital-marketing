import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
    private rateLimiter: RateLimiterRedis;

    constructor() {
        const redisClient = new Redis({
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
        });

        this.rateLimiter = new RateLimiterRedis({
            storeClient: redisClient,
            points: 1000, // Number of requests
            duration: 1, // Per second
        });
    }

    async use(req: Request, res: Response, next: NextFunction) {
        try {
            await this.rateLimiter.consume(req.ip);
            next();
        } catch {
            res.status(429).json({ error: 'Too Many Requests' });
        }
    }
}