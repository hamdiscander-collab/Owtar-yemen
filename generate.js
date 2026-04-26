// api/generate.js - الإصدار الاحترافي لستوديو أوتار اليمن
export default async function handler(req, res) {
    // 1. السماح فقط بطلبات POST (لحماية الخصوصية)
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "طريقة الطلب غير مسموح بها" });
    }

    const { prompt } = req.body;
    
    // 2. سحب المفتاح السري الجديد (HF_Log) من بيئة Vercel
    const HF_SECRET_KEY = process.env.HF_Log; 

    // 3. التحقق الأمني من وجود المفتاح
    if (!HF_SECRET_KEY) {
        console.error("خطأ أمني: مفتاح HF_Log غير معرف في إعدادات Vercel!");
        return res.status(500).json({ 
            error: "فشل في المصادقة الداخلية. يرجى التأكد من إعدادات البيئة في Vercel." 
        });
    }

    if (!prompt) {
        return res.status(400).json({ error: "وصف اللحن مفقود!" });
    }

    try {
        // 4. الاتصال بمحرك الذكاء الاصطناعي (MusicGen)
        const response = await fetch(
            "https://api-inference.huggingface.co/models/facebook/musicgen-small",
            {
                headers: { 
                    "Authorization": `Bearer ${HF_SECRET_KEY}`,
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({ 
                    "inputs": "Yemeni Oud music, authentic rhythm, " + prompt 
                }),
                // إضافة وقت انتظار أقصى (30 ثانية)
                signal: AbortSignal.timeout(30000) 
            }
        );

        // 5. معالجة حالة "السيرفر نائم" (Loading State)
        if (response.status === 503) {
            return res.status(503).json({ 
                error: "محرك الذكاء الاصطناعي يستيقظ حالياً.. جاري التحميل تلقائياً." 
            });
        }

        // 6. معالجة الأخطاء الأخرى (مثل انتهاء صلاحية التوكن)
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Hugging Face Error:", errorText);
            return res.status(response.status).json({ 
                error: "فشل السيرفر في توليد اللحن. ربما التوكن غير صالح أو السيرفر مزدحم." 
            });
        }

        // 7. تحويل النتيجة بنجاح إلى ملف صوتي
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // إعداد الترويسات لإرسال ملف صوتي حقيقي
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Length', buffer.length);
        return res.send(buffer);

    } catch (error) {
        console.error("Internal Server Error:", error);
        
        // التحقق إذا كان الخطأ بسبب الوقت المستغرق
        if (error.name === 'TimeoutError') {
            return res.status(504).json({ error: "استغرق السيرفر وقتاً طويلاً للرد. حاول مرة أخرى." });
        }

        return res.status(500).json({ error: "حدث خطأ غير متوقع في الجسر البرمي." });
    }
}
