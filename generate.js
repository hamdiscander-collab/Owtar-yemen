import http from 'http';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

    // عرض الواجهة
    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile('index.html', (err, data) => {
            if (err) { res.writeHead(500); res.end("Error loading UI"); return; }
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(data);
        });
        return;
    }

    // معالجة الصوت
    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const { prompt } = JSON.parse(body);
                const apiKey = process.env.Owtaryemen5; 

                const response = await fetch("https://api.openai.com/v1/audio/speech", {
                    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
                    method: "POST",
                    body: JSON.stringify({
                        model: "tts-1",
                        input: prompt,
                        voice: "alloy"
                    }),
                });

                if (!response.ok) {
                    res.writeHead(500);
                    res.end("OpenAI Error");
                    return;
                }

                const buffer = await response.arrayBuffer();
                res.writeHead(200, { 'Content-Type': 'audio/mpeg', 'Content-Length': buffer.byteLength });
                res.end(Buffer.from(buffer));
            } catch (e) {
                res.writeHead(500); res.end("Server Error");
            }
        });
    }
});

const port = process.env.PORT || 10000;
server.listen(port, '0.0.0.0', () => console.log(`Server running on port ${port}`));
