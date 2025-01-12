export const config = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
    RATE_LIMIT: parseInt(process.env.RATE_LIMIT || '50'),
    DEBUG_MODE: process.env.DEBUG_MODE === 'true'
}; 
