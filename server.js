require('dotenv').config(); 
const express = require('express');
const cors = require('cors'); 

const app = express();

app.use(cors()); 
app.use(express.json());

// ROUTE 1: Gets the Token (Already working)
app.get('/api/fatsecret-token', async (req, res) => {
    try {
        const credentials = Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64');
        const response = await fetch('https://oauth.fatsecret.com/connect/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials&scope=basic'
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error_description);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Middleman for Searching Food
app.get('/api/search-food', async (req, res) => {
    // grab the query ( likeGreek Yogurt) and the token from React's request
    const searchQuery = req.query.q;
    const token = req.headers.authorization;

    try {
        const searchUrl = `https://platform.fatsecret.com/rest/foods/search/v1?search_expression=${encodeURIComponent(searchQuery)}&format=json&max_results=5`;
        
        // Request sent to FatSecret (Undercover lol)
        const response = await fetch(searchUrl, {
            method: 'GET',
            headers: {
                'Authorization': token 
            }
        });

        const data = await response.json();
        // The Proxy gives raw food data back to React
        res.json(data);

    } catch (error) {
        console.error("Search Error:", error);
        res.status(500).json({ error: 'Failed to fetch food data' });
    }
});

const PORT = process.env.PORT || 5000; 
app.listen(PORT, () => {
    console.log(`BVLTRA Proxy Engine running on port ${PORT}`);
});

// gets full nutrient profile by ID
app.get('/api/get-food', async (req, res) => {
    const foodId = req.query.id;
    const token = req.headers.authorization;

    try {
        // singular 'food/v1' endpoint
        const url = `https://platform.fatsecret.com/rest/food/v1?food_id=${foodId}&format=json`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': token 
            }
        });

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error("Deep Dive Error:", error);
        res.status(500).json({ error: 'Failed to fetch detailed food data' });
    }
});