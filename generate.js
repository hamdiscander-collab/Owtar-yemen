import http from 'http';
import fetch from 'node-fetch';

const handler = async (req, res) => {
    // إعدادات العناوين للسماح بالوصول (CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const { prompt } = JSON.parse(body);
                const HF_SECRET_KEY = process.env.Good;

                const response = await fetch(
                    "https://api-inference.huggingface.co/models/facebook/musicgen-small",
                    {
                        headers: { "Authorization": `Bearer ${HF_SECRET_KEY}` },
                        method: "POST",
                        body: JSON.stringify({ "inputs": "Yemeni Oud music, " + prompt }),
                    }
                );

                const arrayBuffer = await response.arrayBuffer();
                res.writeHead(200, { 'Content-Type': 'audio/mpeg' });
                res.end(Buffer.from(arrayBuffer));
            } catch (error) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: "خطأ في السيرفر" }));
            }
        });
    } else {
        res.writeHead(404);
        res.end();
    }
};

// تشغيل السيرفر على المنفذ الذي يطلبه Render
const server = http.createServer(handler);
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
