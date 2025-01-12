/// <reference types="node" />
import process from 'process';
import { z } from 'zod';
import winston from 'winston';
import { Redis } from 'ioredis';
import { OpenAI } from 'openai';

// Input validation schema
const MessageSchema = z.object({
    content: z.string().min(1).max(1000),
    userId: z.string(),
    userName: z.string(),
});

// Logger configuration
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

export class RoastBot {
    private redis: Redis;
    private state: any = {};
    private openai: OpenAI;

    constructor() {
        this.redis = new Redis({
            url: process.env.REDIS_URL,
            password: process.env.REDIS_PASSWORD
        });
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }

    async handleMessage(message: unknown): Promise<string> {
        try {
            const validatedMessage = MessageSchema.parse(message);
            
            // Log incoming message
            logger.info('Received message', { 
                userId: validatedMessage.userId,
                messageLength: validatedMessage.content.length 
            });

            // Generate AI response
            const response = await this.generateResponse(validatedMessage.content, validatedMessage.userId);
            
            // Store in history
            await this.updateHistory(validatedMessage.userId, {
                input: validatedMessage.content,
                response
            });

            return response;

        } catch (error) {
            logger.error('Error processing message', { error });
            if (error instanceof z.ZodError) {
                return 'Invalid message format';
            }
            return 'An error occurred';
        }
    }

    async loadState(): Promise<void> {
        try {
            const savedState = await this.redis.get('bot:state');
            if (savedState) {
                this.state = JSON.parse(savedState);
            }
        } catch (error) {
            logger.error('Failed to load state:', error);
        }
    }

    async disconnect(): Promise<void> {
        await this.redis.quit();
        logger.info('Bot disconnected');
    }

    async generateResponse(message: string, userId: string): Promise<string> {
        try {
            const history = await this.getHistory(userId);
            const recentContext = history
                .slice(0, 3)
                .map(h => `User: ${h.input}\nAI: ${h.response}`)
                .join('\n');

            const completion = await this.openai.chat.completions.create({
                messages: [
                    { 
                        role: "system", 
                        content: "You are a helpful AI assistant. Previous conversation:\n" + recentContext 
                    },
                    { role: "user", content: message }
                ],
                model: "gpt-4",
                max_tokens: 150,
            });

            return completion.choices[0].message.content || 'No response generated';
        } catch (error) {
            logger.error('OpenAI API error:', error);
            return 'Sorry, I encountered an error processing your message.';
        }
    }

    private async updateHistory(userId: string, chat: { input: string; response: string }) {
        try {
            const key = `history:${userId}`;
            await this.redis.lpush(key, JSON.stringify({
                ...chat,
                timestamp: new Date()
            }));
            await this.redis.ltrim(key, 0, 9); // Keep last 10 messages
        } catch (error) {
            logger.error('Failed to update history:', error);
        }
    }

    private async getHistory(userId: string): Promise<Array<{ input: string; response: string }>> {
        try {
            const key = `history:${userId}`;
            const history = await this.redis.lrange(key, 0, -1);
            return history.map(item => JSON.parse(item));
        } catch (error) {
            logger.error('Failed to get history:', error);
            return [];
        }
    }
} 
