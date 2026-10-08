HoangWER Get Key System - LootLabs/Lootdest Postback

1. GitHub repo root must contain package.json, server.js, public/.
2. Render Build Command: npm install
3. Render Start Command: npm start
4. LootLabs/Lootdest Postback URL:
   https://hoangwer-getkeysystem.onrender.com/api/postback?click_id={CLICK_ID}
5. The GET KEY flow adds puid=<click_id> to the Lootdest URL. LootLabs returns that value as click_id in the postback.
6. The key is generated only after /api/postback confirms completion.

Important: This version uses in-memory storage. A Render restart clears active sessions/keys. For a permanent production key system, use a database.
