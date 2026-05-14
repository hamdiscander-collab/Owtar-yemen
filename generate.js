import http from 'http';
import fetch from 'node-fetch';
import fs from 'fs';

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile('index.html', (err, data) => {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(data);
        });
        return;
    }

    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const { prompt, auth_token } = JSON.parse(body);

                // التحقق من توكن Pi Network في الخلفية
                const piVerify = await fetch("https://api.minepi.com/v2/me", {
                    headers: { "Authorization": `Bearer ${auth_token}` }
                });

                if (!piVerify.ok) {
                    res.writeHead(401);
                    res.end(JSON.stringify({ error: "Unauthorized Pi User" }));
                    return;
                }

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

                const buffer = await response.arrayBuffer();
                res.writeHead(200, { 'Content-Type': 'audio/mpeg' });
                res.end(Buffer.from(buffer));
            } catch (e) {
                res.writeHead(500); res.end("Server Error");
            }
        });
    }
});

server.listen(process.env.PORT || 10000, '0.0.0.0');
