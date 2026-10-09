const express = require('express');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;app.use((req, res, next) => {
  if (req.path === '/api/start' || req.path === '/api/postback') {
    console.log(
      `[REQUEST] ${req.method} ${req.originalUrl}`
    );
  }
  next();
});
const LOOT_URL = 'https://loot-link.com/s?hPWDeu13';
const KEY_TTL = 24 * 60 * 60 * 1000;

const KEY_POOL = [
  'HoangWERkeysytem1-2-3-4-5-6-7-8-9-10',
  'HoangWERkeysystem2-2-3-4-5-6-7-8-9-10',
  'HoangWERkeysytem3-1-5-6-72-4',
  'HoangWERkeysystem7-2-5-6-2-6-3-2',
  'HoangWERkeysytem5-3-7-1-8-3-0-4'
];

// Demo storage. For production, use a database because Render can restart services.
const sessions = new Map();
const issued = new Map();

app.use(express.json());
app.use(express.static('public'));

function newId() {
  return crypto.randomBytes(18).toString('hex');
}

function randomKey() {
  return KEY_POOL[crypto.randomInt(KEY_POOL.length)];
}

// Create a click/session BEFORE sending the visitor to Lootdest.
app.get('/api/start', (req, res) => {
  const clickId = newId();
  sessions.set(clickId, {
    completed: false,
    createdAt: Date.now(),
    completedAt: null,
    key: null
  });

  // LootLabs docs: the value in puid is returned as click_id in the postback.
  const redirectUrl = `${LOOT_URL}&puid=${encodeURIComponent(clickId)}`;
  res.json({ success: true, clickId, redirectUrl });
});

// Lootdest/LootLabs calls this AFTER a task is completed.
app.get('/api/postback', (req, res) => {
  const clickId = String(req.query.click_id || '').trim();
  const uniqueId = String(req.query.unique_id || '').trim();

  if (!clickId) return res.status(400).send('missing click_id');

  const session = sessions.get(clickId);
  if (!session) return res.status(404).send('unknown click_id');

  // Ignore duplicate postbacks for the same session.
  if (!session.completed) {
    session.completed = true;
    session.completedAt = Date.now();
    session.uniqueId = uniqueId || null;
  }

  // LootLabs only needs a successful HTTP response; returning OK is enough for this handler.
  return res.status(200).send('OK');
});

// Frontend polls this endpoint after returning from Lootdest.
app.get('/api/status', (req, res) => {
  const clickId = String(req.query.click_id || '').trim();
  const session = sessions.get(clickId);

  if (!session) return res.status(404).json({ success: false, message: 'Phiên không tồn tại.' });

  if (!session.completed) {
    return res.json({ success: true, completed: false });
  }

  // Create the 24-hour key only after completion is confirmed.
  if (!session.key) {
    const key = randomKey();
    const expiresAt = Date.now() + KEY_TTL;
    session.key = key;
    issued.set(key, { expiresAt, clickId });
  }

  const record = issued.get(session.key);
  if (!record || Date.now() >= record.expiresAt) {
    return res.json({ success: true, completed: true, expired: true });
  }

  return res.json({
    success: true,
    completed: true,
    key: session.key,
    expiresAt: record.expiresAt
  });
});

app.post('/api/verify', (req, res) => {
  const key = String(req.body.key || '').trim();
  const item = issued.get(key);

  if (!item) return res.json({ success: false, message: 'Key không hợp lệ hoặc chưa được cấp.' });

  if (Date.now() >= item.expiresAt) {
    issued.delete(key);
    return res.json({ success: false, message: 'Key đã hết hạn sau 24 giờ.' });
  }

  res.json({ success: true, message: 'Key hợp lệ.', expiresAt: item.expiresAt });
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`HoangWER Get Key System running on port ${PORT}`));
