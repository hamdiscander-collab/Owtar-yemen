// api/generate.js
export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { prompt } = req.body;
    
    // التعديل هنا: سحب الرمز باستخدام الاسم الجديد الذي اخترته (Good)
    const HF_SECRET_KEY = process.env.Good; 

    if (!HF_SECRET_KEY) {
        return res.status(500).json({ error: "النظام لا يجد رمزاً باسم Good في Vercel" });
    }

    try {
        const response = await fetch(
            "https://api-inference.huggingface.co/models/facebook/musicgen-small",
            {
                headers: { 
                    "Authorization": `Bearer ${HF_SECRET_KEY}`,
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({ "inputs": "Yemeni traditional music, Oud, " + prompt }),
            }
        );

        if (response.status === 503) {
            return res.status(503).json({ error: "السيرفر يستيقظ حالياً" });
        }

        if (!response.ok) throw new Error("فشل الاتصال بمصنع الألحان");

        const arrayBuffer = await response.arrayBuffer();
        res.setHeader('Content-Type', 'audio/mpeg');
        res.send(Buffer.from(arrayBuffer));

    } catch (error) {
        res.status(500).json({ error: "حدث خطأ في الجسر البرمجي" });
    }
}
