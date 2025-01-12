import { RoastBot } from './RoastBot';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
    const bot = new RoastBot();
    
    try {
        await bot.loadState();
        
        const response = await bot.handleMessage({
            content: "Hello, AI!",
            userId: "user123",
            userName: "TestUser"
        });
        
        console.log('Bot response:', response);
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await bot.disconnect();
    }
}

main(); 
