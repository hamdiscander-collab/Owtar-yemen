// api/generate.js
export default async function handler(req, res) {
    const { prompt } = req.body;
    const HF_TOKEN = process.env.HF_TOKEN; // هنا يسحب المفتاح المخفي من Vercel

    try {
        const response = await fetch(
            "https://api-inference.huggingface.co/models/facebook/musicgen-small",
            {
                headers: { Authorization: `Bearer ${HF_TOKEN}` },
                method: "POST",
                body: JSON.stringify({ inputs: "Yemeni Oud music, " + prompt }),
            }
        );

        if (!response.ok) throw new Error("السيرفر مشغول");

        const arrayBuffer = await response.arrayBuffer();
        res.setHeader('Content-Type', 'audio/mpeg');
        res.send(Buffer.from(arrayBuffer));

    } catch (error) {
        res.status(500).json({ error: "خطأ في التوليد" });
    }
}
