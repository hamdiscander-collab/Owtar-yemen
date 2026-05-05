import http from 'http';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const server = http.createServer(async (req, res) => {
    // إعدادات الوصول CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

    // 1. عرض الواجهة الرئيسية
    if (req.url === '/' || req.url === '/index.html') {
        const filePath = path.join(process.cwd(), 'index.html');
        fs.readFile(filePath, (err, data) => {
            if (err) { res.writeHead(500); res.end("Error loading UI"); return; }
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(data);
        });
        return;
    }

    // 2. روابط التحقق (مهمة لـ Pi Network)
    if (req.url === '/validation-key.txt') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('5b85b9eed5547c48add59d675c9d18f44133f732d9b75ed8ed865148c9c7a505e6b01872d2c8a58b7918018b8f86bb9f1d49c0b3d9888dd8950bb4b35d3514bc');
        return;
    }

    // 3. معالجة الطلب عبر OpenAI (لتحويل النص إلى صوت TTS أو موسيقى)
    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const { prompt } = JSON.parse(body);
                
                // قراءة المفتاح بالاسم الجديد الذي وضعته في Render
                const OPENAI_KEY = process.env.Owtaryemen5; 

                if (!OPENAI_KEY) {
                    res.writeHead(500); res.end("API Key 'Owtaryemen5' missing in Render settings");
                    return;
                }

                // الاتصال بـ OpenAI (مثال باستخدام نموذج الصوت TTS)
                const response = await fetch("https://api.openai.com/v1/audio/speech", {
                    headers: { 
                        "Authorization": `Bearer ${OPENAI_KEY}`,
                        "Content-Type": "application/json"
                    },
                    method: "POST",
                    body: JSON.stringify({
                        model: "tts-1",
                        input: prompt,
                        voice: "alloy" // يمكنك تغيير الصوت هنا
                    }),
                });

                if (!response.ok) {
                    const error = await response.json();
                    res.writeHead(response.status);
                    res.end(JSON.stringify(error));
                    return;
                }

                const arrayBuffer = await response.arrayBuffer();
                res.writeHead(200, { 'Content-Type': 'audio/mpeg' });
                res.end(Buffer.from(arrayBuffer));

            } catch (error) {
                res.writeHead(500); res.end("Internal Server Error");
            }
        });
    }
});

const port = process.env.PORT || 3000;
server.listen(port);
