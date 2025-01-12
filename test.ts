/// <reference types="node" />
import * as process from 'process';
import dotenv from 'dotenv';
import { RoastBot } from './RoastBot';

dotenv.config();

async function test() {
    console.log('Starting test...');
    console.log('OpenAI Key:', process.env.OPENAI_API_KEY ? 'Present' : 'Missing');
    console.log('Redis URL:', process.env.REDIS_URL ? 'Present' : 'Missing');

    const bot = new RoastBot(process.env.OPENAI_API_KEY!, {
        url: process.env.REDIS_URL
    });

    try {
        // Test basic message handling
        const response = await bot.handleMessage({
            content: "Hello! What can you do?",
            userId: "test-user",
            userName: "Tester"
        });
        console.log('Bot Response:', response);

        // Test rate limiting
        console.log('Testing rate limiting...');
        for (let i = 0; i < 6; i++) {
            const resp = await bot.handleMessage({
                content: "Test message",
                userId: "test-user",
                userName: "Tester"
            });
            console.log(`Response ${i + 1}:`, resp.substring(0, 50) + '...');
        }

        await bot.disconnect();
        console.log('Test completed successfully!');

    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

test();
