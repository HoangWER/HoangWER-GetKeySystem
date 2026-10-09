const LOOT_URL = 'https://lootdest.org/s?zWYWojtG';
const KEY_STORAGE = 'hoangwer_key_data';
const CLICK_STORAGE = 'hoangwer_click_id';
let timerHandle = null;
let pollHandle = null;

const $ = id => document.getElementById(id);

function save(data) { localStorage.setItem(KEY_STORAGE, JSON.stringify(data)); }
function load() { try { return JSON.parse(localStorage.getItem(KEY_STORAGE)); } catch { return null; } }

function showKey(data) {
  $('key').textContent = data.key;
  $('keyBox').classList.remove('hidden');
  updateTimer(data.expiresAt);
}

function updateTimer(expiresAt) {
  clearInterval(timerHandle);
  const tick = () => {
    const left = Math.max(0, expiresAt - Date.now());
    if (left <= 0) {
      $('timer').textContent = 'KEY ĐÃ HẾT HẠN.';
      $('keyBox').classList.add('hidden');
      localStorage.removeItem(KEY_STORAGE);
      clearInterval(timerHandle);
      return;
    }
    const total = Math.floor(left / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    $('timer').textContent = `Thời gian còn lại: ${h}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`;
  };
  tick();
  timerHandle = setInterval(tick, 1000);
}

async function checkStatus(clickId) {
  const r = await fetch(`/api/status?click_id=${encodeURIComponent(clickId)}`);
  const data = await r.json();
  if (!data.success) throw new Error(data.message || 'Không kiểm tra được trạng thái.');

  if (data.completed && data.key && !data.expired) {
    save({ key: data.key, expiresAt: data.expiresAt });
    showKey({ key: data.key, expiresAt: data.expiresAt });
    $('status').textContent = '✅ Đã hoàn thành Lootdest. Key của bạn đã được kích hoạt trong 24 giờ.';
    clearInterval(pollHandle);
    localStorage.removeItem(CLICK_STORAGE);
    return true;
  }

  if (data.completed && data.expired) {
    $('status').textContent = 'Phiên đã hết hạn. Hãy tạo lượt GET KEY mới.';
    clearInterval(pollHandle);
    return false;
  }

  $('status').textContent = '⏳ Chưa nhận được xác nhận hoàn thành từ Lootdest...';
  return false;
try {
  await navigator.clipboard.writeText(data.redirectUrl);
} catch {}
window.open(data.redirectUrl, '_blank', 'noopener');
  $('status').textContent = 'Đã mở Lootdest. Hãy hoàn thành nhiệm vụ rồi quay lại trang này.';
  clearInterval(pollHandle);
  pollHandle = setInterval(() => checkStatus(data.clickId).catch(() => {}), 3000);
}

$('getKey').addEventListener('click', async () => {
  const button = $('getKey');
  button.disabled = true;
  button.textContent = 'ĐANG MỞ LOOTDEST...';
  try { await startLoot(); }
  catch (e) { $('status').textContent = e.message || 'Có lỗi xảy ra.'; }
  button.disabled = false;
  button.textContent = '🔑 GET KEY';
});

$('copy').addEventListener('click', async () => {
  await navigator.clipboard.writeText($('key').textContent);
  $('copy').textContent = 'COPIED';
  setTimeout(() => $('copy').textContent = 'COPY', 1200);
});

$('verify').addEventListener('click', async () => {
  const key = $('verifyInput').value.trim();
  const r = await fetch('/api/verify', {
    method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({key})
  });
  const data = await r.json();
  $('verifyMsg').textContent = data.message;
  $('verifyMsg').style.color = data.success ? '#35e06f' : '#ff4444';
});

const existing = load();
if (existing && existing.expiresAt > Date.now()) showKey(existing);
else if (existing) localStorage.removeItem(KEY_STORAGE);

const savedClick = localStorage.getItem(CLICK_STORAGE);
if (savedClick) {
  checkStatus(savedClick).catch(() => {});
  pollHandle = setInterval(() => checkStatus(savedClick).catch(() => {}), 3000);
}
