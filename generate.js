import http from 'http';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const server = http.createServer(async (req, res) => {
    // إعدادات CORS للسماح لمتصفح Pi بالاتصال بالسيرفر
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // 1. عرض الواجهة الرئيسية (index.html)
    if (req.url === '/' || req.url === '/index.html') {
        const filePath = path.join(process.cwd(), 'index.html');
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end("Error: index.html not found in root directory");
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(data);
        });
        return;
    }

    // 2. روابط التحقق والخصوصية المطلوبة من Pi Network
    if (req.url === '/validation-key.txt') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('5b85b9eed5547c48add59d675c9d18f44133f732d9b75ed8ed865148c9c7a505e6b01872d2c8a58b7918018b8f86bb9f1d49c0b3d9888dd8950bb4b35d3514bc');
        return;
    }

    if (req.url === '/privacy') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>سياسة الخصوصية</h1><p>تطبيق أوتار اليمن يحترم خصوصيتك تماماً.</p>');
        return;
    }

    if (req.url === '/terms') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>شروط الخدمة</h1><p>الاستخدام مخصص لأغراض فنية وإبداعية.</p>');
        return;
    }

    // 3. معالجة طلب إنتاج الصوت عبر OpenAI
    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const { prompt } = JSON.parse(body);
                
                // سحب المفتاح من إعدادات Render باسم Owtaryemen5
                const apiKey = process.env.Owtaryemen5; 

                if (!apiKey) {
                    res.writeHead(500);
                    res.end("خطأ: مفتاح Owtaryemen5 غير مضبوط في Render");
                    return;
                }

                const response = await fetch("https://api.openai.com/v1/audio/speech", {
                    headers: { 
                        "Authorization": `Bearer ${apiKey}`,
                        "Content-Type": "application/json"
                    },
                    method: "POST",
                    body: JSON.stringify({
                        model: "tts-1",
                        input: "بإيقاع يمني، " + prompt,
                        voice: "alloy"
                    }),
                });

                if (!response.ok) {
                    res.writeHead(response.status);
                    res.end("OpenAI API Error");
                    return;
                }

                const arrayBuffer = await response.arrayBuffer();
                res.writeHead(200, { 'Content-Type': 'audio/mpeg' });
                res.end(Buffer.from(arrayBuffer));

            } catch (error) {
                res.writeHead(500);
                res.end("Internal Server Error");
            }
        });
    }
});

// إعداد المنفذ ليتوافق مع Render (Port 10000)
const port = process.env.PORT || 10000;
server.listen(port, '0.0.0.0', () => {
    console.log(`سيرفر أوتار اليمن يعمل على المنفذ: ${port}`);
});
