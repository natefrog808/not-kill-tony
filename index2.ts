/// <reference types="node" />
import { process } from 'process';
import { RoastBot } from './src/RoastBot';
import { config } from './config';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function startBot() {
    try {
        // Initialize the bot
        const bot = new RoastBot();
        
        // Load previous state if it exists
        await bot.loadState();

        // Example usage in a chat platform (Discord, Slack, etc.)
        // You would need to add your specific platform integration here
        const exampleMessage = {
            content: "Hello bot!",
            userId: "123",
            userName: "TestUser",
            mentions: []
        };

        const response = await bot.handleMessage(exampleMessage);
        console.log('Bot Response:', response);

        // When shutting down:
        await bot.disconnect();

    } catch (error) {
        console.error('Failed to start bot:', error);
        process.exit(1);
    }
}

startBot(); 
