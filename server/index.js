const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// --- IMPORT ACTIVE SERVICES ---
const services = {
    tiktok: require('./services/tiktokService'),
    youtube: require('./services/youtubeService'),
    snapchat: require('./services/snapchatService'),
    twitter: require('./services/twitterService'),
    spotify: require('./services/spotifyService'),
    instagram: require('./services/instagramService'),
    facebook: require('./services/facebookService'),
    soundcloud: require('./services/soundcloudService'),
    linkedin: require('./services/linkedinService'),
    pinterest: require('./services/pinterestService'),
    tumblr: require('./services/tumblrService'),
    douyin: require('./services/douyinService'),
    kuaishou: require('./services/kuaishouService'),
    capcut: require('./services/capcutService'),
    dailymotion: require('./services/dailymotionService'),
    bluesky: require('./services/blueskyService'),
    
    // Facebook, Reddit, Threads have been removed as requested
};

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// --- UNIVERSAL ROUTE (AUTOMATIC) ---
app.post('/api/:platform', async (req, res) => {
    const { platform } = req.params; 
    const { url } = req.body;

    console.log(`[SERVER] Request received for: ${platform}`);

    // 1. Check Service
    const serviceModule = services[platform];
    if (!serviceModule) {
        console.log(`[ERROR] Service '${platform}' not found/not active.`);
        return res.status(404).json({ error: `Service '${platform}' is not available on the server.` });
    }

    try {
        // 2. Find Fetch Function (Automatic)
        const functionName = Object.keys(serviceModule).find(key => typeof serviceModule[key] === 'function');

        if (!functionName) {
            throw new Error(`No exported function in ${platform}Service.js file`);
        }

        console.log(`[SERVER] Executing function '${functionName}'...`);
        
        // 3. Execute
        const data = await serviceModule[functionName](url);
        res.json(data);

    } catch (error) {
        console.error(`[ERROR]`, error.message);
        // Send error details to frontend to appear in alert
        res.status(500).json({ error: "Failed to process.", details: error.message });
    }
});

// Server Status Check
app.get('/', (req, res) => {
    res.send('BMB TECH ENGINE READY 🚀');
});

// --- IMPORTANT: PORT CONFIGURATION ---
// This code ensures app.listen ONLY runs on Localhost.
// On Vercel, app.listen should not be executed directly.
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`>> SERVER RUNNING AT: http://localhost:${PORT}`);
    });
}

// REQUIRED: Export app to be read by api/index.js
module.exports = app;