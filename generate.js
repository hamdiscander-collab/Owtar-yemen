// api/generate.js
export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { prompt } = req.body;
    
    // التعديل هنا: سحب المفتاح من الاسم الجديد الذي اخترته في Vercel
    const HF_SECRET_KEY = process.env.HF_Log; 

    if (!HF_SECRET_KEY) {
        return res.status(500).json({ error: "لم يتم العثور على مفتاح HF_Log في إعدادات Vercel" });
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
            return res.status(503).json({ error: "السيرفر قيد التحميل" });
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "فشل الاتصال");
        }

        const arrayBuffer = await response.arrayBuffer();
        res.setHeader('Content-Type', 'audio/mpeg');
        res.send(Buffer.from(arrayBuffer));

    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ error: "حدث خطأ أثناء معالجة الطلب" });
    }
}
