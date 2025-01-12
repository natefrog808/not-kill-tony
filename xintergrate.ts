/// <reference types="node" />
import * as process from 'process';
import { TwitterApi } from 'twitter-api-v2';
import { RoastBot } from './src/RoastBot';

const client = new TwitterApi({
    appKey: 'YOUR_APP_KEY',
    appSecret: 'YOUR_APP_SECRET',
    accessToken: 'YOUR_ACCESS_TOKEN',
    accessSecret: 'YOUR_ACCESS_SECRET',
});

const roastBot = new RoastBot(process.env.OPENAI_API_KEY, {
    url: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD
});

// Listen for mentions
async function startBot() {
    const rules = await client.v2.streamRules();
    if (rules.data?.length) {
        await client.v2.updateStreamRules({
            delete: { ids: rules.data.map(rule => rule.id) },
        });
    }

    // Add rule to track mentions
    await client.v2.updateStreamRules({
        add: [{ value: '@YourBotUsername' }],
    });

    const stream = await client.v2.searchStream({
        'tweet.fields': ['referenced_tweets', 'author_id'],
        'user.fields': ['username'],
    });

    stream.on('data', async tweet => {
        const message = {
            content: tweet.data.text,
            userId: tweet.data.author_id,
            userName: tweet.includes?.users?.[0]?.username || '',
            mentions: tweet.entities?.mentions?.map(m => m.username) || []
        };

        const response = await roastBot.handleMessage(message);
        if (response) {
            await client.v2.reply(response, tweet.data.id);
        }
    });
}

startBot().catch(console.error); 
