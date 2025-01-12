/// <reference types="node" />
import process from 'process';

export const config = {
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: 'gpt-4',
        maxTokens: 150
    },
    persistence: {
        type: 'file', // or 'database'
        path: './data/bot-state.json',
        saveInterval: 300000
    },
    security: {
        admins: ['admin1', 'admin2'],
        maxRequestsPerMinute: 50,
        moderationEnabled: true
    }
}; 
