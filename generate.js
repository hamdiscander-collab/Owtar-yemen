import http from 'http';
import fetch from 'node-fetch';

const handler = async (req, res) => {
    // إعدادات CORS للسماح لصفحة index.html بالاتصال بالسيرفر
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
                const parsedBody = JSON.parse(body);
                const prompt = parsedBody.prompt;
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
                res.end(JSON.stringify({ error: "خطأ في السيرفر الداخلي" }));
            }
        });
    } else {
        // في حال تم فتح الرابط مباشرة من المتصفح
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>سيرفر أوتار اليمن يعمل بنجاح! ✅</h1>');
    }
};

const server = http.createServer(handler);
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
