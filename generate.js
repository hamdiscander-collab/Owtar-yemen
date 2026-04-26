// api/generate.js
export default async function handler(req, res) {
    // التأكد من أن الطلب قادم من تطبيقك حصراً
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { prompt } = req.body;
    
    // سحب المفتاح باستخدام الاسم الدقيق الذي نسخته: HF_Log
    const HF_SECRET_KEY = process.env.HF_Log; 

    // فحص أمني: هل المفتاح موجود فعلاً في Vercel؟
    if (!HF_SECRET_KEY) {
        return res.status(500).json({ 
            error: "النظام لا يرى مفتاحاً باسم HF_Log. يرجى إضافته في إعدادات Vercel ثم عمل Redeploy." 
        });
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

        // التعامل مع وضع الاستعداد (السيرفر يحمل النموذج)
        if (response.status === 503) {
            return res.status(503).json({ error: "السيرفر قيد التحميل" });
        }

        if (!response.ok) {
            throw new Error("فشل الاتصال بمصنع الألحان العالمي");
        }

        // تحويل البيانات الصوتية المستلمة إلى ملف قابل للتشغيل
        const arrayBuffer = await response.arrayBuffer();
        res.setHeader('Content-Type', 'audio/mpeg');
        res.send(Buffer.from(arrayBuffer));

    } catch (error) {
        res.status(500).json({ error: "حدث خطأ في الجسر البرمجي: " + error.message });
    }
}
