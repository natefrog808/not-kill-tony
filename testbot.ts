import { RoastBot } from './RoastBot';
import readline from 'readline';
import dotenv from 'dotenv';

dotenv.config();
console.log('Environment loaded');
console.log('OpenAI Key exists:', !!process.env.OPENAI_API_KEY);
console.log('Redis URL:', process.env.REDIS_URL);

async function testBot() {
    console.log('Initializing bot...');
    const bot = new RoastBot();
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log('Bot initialized! Type your messages (type "exit" to quit)');

    try {
        await bot.loadState();

        const askQuestion = () => {
            rl.question('You: ', async (input) => {
                if (input.toLowerCase() === 'exit') {
                    await bot.disconnect();
                    rl.close();
                    return;
                }

                try {
                    const response = await bot.handleMessage({
                        content: input,
                        userId: 'test-user',
                        userName: 'TestUser'
                    });

                    console.log('Bot:', response);
                    askQuestion();
                } catch (error) {
                    console.error('Error:', error);
                    askQuestion();
                }
            });
        };

        askQuestion();

    } catch (error) {
        console.error('Startup error:', error);
        await bot.disconnect();
        rl.close();
    }
}

testBot();
