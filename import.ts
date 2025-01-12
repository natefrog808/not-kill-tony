import { OpenAI } from 'openai';

export class RoastBot {
    private readonly openai: OpenAI;
    
    constructor(config: { openai: { apiKey: string } }) {
        this.openai = new OpenAI({ apiKey: config.openai.apiKey });
    }

    async handleMessage(message: { content: string; userId: string; userName: string; mentions: string[] }) {
        // Basic implementation
        return `Hello ${message.userName}!`;
    }
} 
