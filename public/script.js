const LOOT_URL = "https://lootdest.org/s?zWYWojtG";
const KEY_STORAGE = "hoangwer_key_data";
let timerHandle = null;

const $ = id => document.getElementById(id);

function save(data) {
  localStorage.setItem(KEY_STORAGE, JSON.stringify(data));
}

function load() {
  try { return JSON.parse(localStorage.getItem(KEY_STORAGE)); }
  catch { return null; }
}

function showKey(data) {
  $("key").textContent = data.key;
  $("keyBox").classList.remove("hidden");
  updateTimer(data.expiresAt);
}

function updateTimer(expiresAt) {
  clearInterval(timerHandle);

  const tick = () => {
    const left = Math.max(0, expiresAt - Date.now());

    if (left <= 0) {
      $("timer").textContent = "KEY ĐÃ HẾT HẠN.";
      $("keyBox").classList.add("hidden");
      localStorage.removeItem(KEY_STORAGE);
      clearInterval(timerHandle);
      return;
    }

    const total = Math.floor(left / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;

    $("timer").textContent =
      `Thời gian còn lại: ${h}h ${String(m).padStart(2,"0")}m ${String(s).padStart(2,"0")}s`;
  };

  tick();
  timerHandle = setInterval(tick, 1000);
}

async function issueKey() {
  const response = await fetch("/api/get-key");
  const data = await response.json();

  if (!data.success) throw new Error("Không thể tạo key.");

  save(data);
  showKey(data);
  return data;
}

$("getKey").addEventListener("click", async () => {
  const button = $("getKey");
  button.disabled = true;
  button.textContent = "ĐANG CHUẨN BỊ...";

  try {
    await navigator.clipboard.writeText(LOOT_URL);

    // Save a marker so the page can recognize that the user started the flow.
    sessionStorage.setItem("loot_started", "1");

    $("status").textContent = "Đã sao chép link Lootdest. Đang mở...";
    window.open(LOOT_URL, "_blank", "noopener");

    // Demo return flow: if the user comes back, click GET KEY again
    // or use the automatic return handler below.
    setTimeout(async () => {
      if (sessionStorage.getItem("loot_started") === "1") {
        const data = await issueKey();
        $("status").textContent = "Đã tạo key 24 giờ.";
        sessionStorage.removeItem("loot_started");
        showKey(data);
      }
    }, 1200);

  } catch (e) {
    $("status").textContent = "Trình duyệt không cho phép sao chép tự động.";
  }

  button.disabled = false;
  button.textContent = "🔑 GET KEY";
});

$("copy").addEventListener("click", async () => {
  const key = $("key").textContent;
  await navigator.clipboard.writeText(key);
  $("copy").textContent = "COPIED";
  setTimeout(() => $("copy").textContent = "COPY", 1200);
});

$("verify").addEventListener("click", async () => {
  const key = $("verifyInput").value.trim();

  const r = await fetch("/api/verify", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({key})
  });

  const data = await r.json();
  $("verifyMsg").textContent = data.message;
  $("verifyMsg").style.color = data.success ? "#35e06f" : "#ff4444";
});

const existing = load();
if (existing && existing.expiresAt > Date.now()) {
  showKey(existing);
} else if (existing) {
  localStorage.removeItem(KEY_STORAGE);
}