const express = require('express');
const router = express.Router();
const ytSearch = require('yt-search');

router.get('/webinars', async (req, res) => {
    try {
        const domain = req.query.domain || 'Tech';

        // yt-search usually limits single searches to the first page (around 15-20 results).
        // To get 100+ videos, we will run multiple related queries concurrently.
        const queries = [
            `${domain} full complete webinar 2024`,
            `${domain} tech talk conference`,
            `${domain} system design tutorial masterclass`,
            `${domain} crash course full tutorial`,
            `advanced ${domain} programming concepts`,
            `${domain} industry trends best practices`,
            `${domain} engineering deep dive`
        ];

        // Execute all searches in parallel
        const searchPromises = queries.map(q => ytSearch(q));
        const results = await Promise.all(searchPromises);

        // Flatten all video arrays into one massive list
        let allVideos = [];
        results.forEach(result => {
            if (result && result.videos) {
                allVideos = allVideos.concat(result.videos);
            }
        });

        // Deduplicate the massive list by video ID so we don't show the same video twice
        const uniqueVideosMap = new Map();
        allVideos.forEach(v => {
            if (!uniqueVideosMap.has(v.videoId)) {
                uniqueVideosMap.set(v.videoId, v);
            }
        });

        let uniqueVideos = Array.from(uniqueVideosMap.values());

        // Slice up to 120 unique videos
        uniqueVideos = uniqueVideos.slice(0, 120);

        // Map them into our standard `WEBINARS_DATA` structure
        const formattedWebinars = uniqueVideos.map((v, index) => {
            // Create some random variation for ui styling based on video length or index
            let level = "Beginner";
            if (v.seconds > 3600) level = "Advanced"; // Over 1 hour
            else if (v.seconds > 1800) level = "Intermediate"; // Over 30 mins

            return {
                id: v.videoId,
                title: v.title,
                domain: domain,
                description: v.description || `Watch this fantastic tech talk by ${v.author.name} about the hottest trends in the industry.`,
                level: level,
                status: "Recorded",
                duration: Math.round(v.seconds / 60),
                tags: [domain, "Engineering", "Webinar"],
                seatsLeft: 0,
                speaker: {
                    name: v.author.name,
                    company: "YouTube Creator",
                    image: v.author.url ? `https://ui-avatars.com/api/?name=${encodeURIComponent(v.author.name)}&background=random` : "https://i.pravatar.cc/150",
                    channelUrl: v.author.url
                },
                watchProgress: null,
                url: v.url,
                thumbnail: v.image
            };
        });

        res.json(formattedWebinars);
    } catch (error) {
        console.error("Error fetching webinars from YouTube:", error);
        res.status(500).json({ error: "Failed to fetch live webinar data." });
    }
});

module.exports = router;
