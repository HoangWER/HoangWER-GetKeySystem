const express = require("express");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

// Keys are stored in memory for this simple version.
// For production, use a database.
const KEY_POOL = [
  "HoangWERkeysytem1-2-3-4-5-6-7-8-9-10",
  "HoangWERkeysystem2-2-3-4-5-6-7-8-9-10",
  "HoangWERkeysytem3-1-5-6-72-4",
  "HoangWERkeysystem7-2-5-6-2-6-3-2",
  "HoangWERkeysytem5-3-7-1-8-3-0-4"
];

const issued = new Map();

app.use(express.json());
app.use(express.static("public"));

function randomKey() {
  return KEY_POOL[crypto.randomInt(KEY_POOL.length)];
}

app.get("/api/get-key", (req, res) => {
  const key = randomKey();
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

  issued.set(key, { expiresAt });

  res.json({
    success: true,
    key,
    expiresAt
  });
});

app.post("/api/verify", (req, res) => {
  const key = String(req.body.key || "").trim();
  const item = issued.get(key);

  if (!item) {
    return res.json({ success: false, message: "Key không hợp lệ hoặc chưa được cấp." });
  }

  if (Date.now() >= item.expiresAt) {
    issued.delete(key);
    return res.json({ success: false, message: "Key đã hết hạn sau 24 giờ." });
  }

  res.json({
    success: true,
    message: "Key hợp lệ.",
    expiresAt: item.expiresAt
  });
});

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`HoangWER Get Key System: http://localhost:${PORT}`);
});