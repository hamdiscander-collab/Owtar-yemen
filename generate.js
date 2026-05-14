import http from 'http';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

    // تقديم واجهة التطبيق
    if (req.url === '/' || req.url === '/index.html') {
        const filePath = path.join(process.cwd(), 'index.html');
        fs.readFile(filePath, (err, data) => {
            if (err) { res.writeHead(500); res.end("Error"); return; }
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(data);
        });
        return;
    }

    // روابط التحقق لشبكة Pi
    if (req.url === '/validation-key.txt') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('5b85b9eed5547c48add59d675c9d18f44133f732d9b75ed8ed865148c9c7a505e6b01872d2c8a58b7918018b8f86bb9f1d49c0b3d9888dd8950bb4b35d3514bc');
        return;
    }

    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const { prompt } = JSON.parse(body);
                
                // سحب مفتاح OpenAI الخاص بك من Render
                const OPENAI_KEY = process.env.Owtaryemen5; 

                // المرحلة الأولى: تحسين الوصف عبر OpenAI ليصبح "يمنياً"
                const aiEnhance = await fetch("https://api.openai.com/v1/chat/completions", {
                    headers: { "Authorization": `Bearer ${OPENAI_KEY}`, "Content-Type": "application/json" },
                    method: "POST",
                    body: JSON.stringify({
                        model: "gpt-3.5-turbo",
                        messages: [{role: "user", content: `Transform this into a professional music prompt for Yemeni music (Oud, Rythm, Style): ${prompt}`}]
                    })
                });
                const aiData = await aiEnhance.json();
                const enhancedPrompt = aiData.choices[0].message.content;

                // المرحلة الثانية: توليد الأغنية/اللحن باستخدام MusicGen
                const musicResponse = await fetch("https://api-inference.huggingface.co/models/facebook/musicgen-small", {
                    headers: { "Authorization": "Bearer hf_REPLACE_WITH_YOUR_HF_TOKEN" }, // تأكد من وضع توكن HuggingFace هنا
                    method: "POST",
                    body: JSON.stringify({ "inputs": "Traditional Yemeni vibes, " + enhancedPrompt }),
                });

                const arrayBuffer = await musicResponse.arrayBuffer();
                res.writeHead(200, { 'Content-Type': 'audio/mpeg' });
                res.end(Buffer.from(arrayBuffer));

            } catch (error) {
                res.writeHead(500); res.end("Error processing request");
            }
        });
    }
});

const port = process.env.PORT || 3000;
server.listen(port);
