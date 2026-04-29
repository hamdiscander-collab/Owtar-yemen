import http from 'http';
import fetch from 'node-fetch';

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 1. رابط التحقق من الدومين
    if (req.url === '/validation-key.txt') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('5b85b9eed5547c48add59d675c9d18f44133f732d9b75ed8ed865148c9c7a505e6b01872d2c8a58b7918018b8f86bb9f1d49c0b3d9888dd8950bb4b35d3514bc');
        return;
    }

    // 2. رابط سياسة الخصوصية (Privacy Policy)
    if (req.url === '/privacy') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>سياسة الخصوصية</h1><p>نحن في أوتار اليمن نحترم خصوصيتك ولا نجمع بياناتك الشخصية.</p>');
        return;
    }

    // 3. رابط شروط الخدمة (Terms)
    if (req.url === '/terms') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>شروط الخدمة</h1><p>جميع الألحان المولدة هي ملك للمستخدم للاستخدام الشخصي ضمن شبكة Pi.</p>');
        return;
    }

    if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const { prompt } = JSON.parse(body);
                const TOKEN = process.env.HF_TOKEN || process.env.Good || process.env.API_KEY;
                const response = await fetch("https://api-inference.huggingface.co/models/facebook/musicgen-small", {
                    headers: { "Authorization": `Bearer ${TOKEN}` },
                    method: "POST",
                    body: JSON.stringify({ "inputs": "Yemeni Oud music, " + prompt }),
                });
                const arrayBuffer = await response.arrayBuffer();
                res.writeHead(200, { 'Content-Type': 'audio/mpeg' });
                res.end(Buffer.from(arrayBuffer));
            } catch (e) { res.writeHead(500); res.end(); }
        });
    } else {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>استوديو أوتار اليمن نشط ✅</h1>');
    }
});

const port = process.env.PORT || 3000;
server.listen(port, () => { console.log(`Server running on ${port}`); });
