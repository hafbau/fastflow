export const appConfig = {
    apiKeys: {
        storageType: process.env.APIKEY_STORAGE_TYPE ? process.env.APIKEY_STORAGE_TYPE.toLowerCase() : 'json'
    },
    showCommunityNodes: process.env.SHOW_COMMUNITY_NODES ? process.env.SHOW_COMMUNITY_NODES.toLowerCase() === 'true' : false,
    // Redis configuration
    redis: {
        enabled: process.env.REDIS_ENABLED ? process.env.REDIS_ENABLED.toLowerCase() === 'true' : false,
        url: process.env.REDIS_URL || 'redis://localhost:6379'
    }
    // todo: add more config options here like database, log, storage, credential and allow modification from UI
}
