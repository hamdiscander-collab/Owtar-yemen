// server.js (أضف endpoint جديد)

import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// تحقق من Pi Token
app.post("/auth", async (req, res) => {
  try {
    const { accessToken } = req.body;

    const response = await fetch("https://api.minepi.com/v2/me", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      return res.status(401).json({ error: "Invalid Pi Token" });
    }

    const user = await response.json();

    // إنشاء جلسة (مبدئي)
    res.json({
      username: user.username,
      uid: user.uid
    });

  } catch (err) {
    res.status(500).json({ error: "Auth failed" });
  }
});

app.listen(3000, () => {
  console.log("🚀 Server running");
});
