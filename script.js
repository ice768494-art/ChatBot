const form = document.getElementById("chatForm");
const input = document.getElementById("prompt");
const sendBtn = document.getElementById("sendBtn");
const messages = document.getElementById("messages");
const welcome = document.getElementById("welcome");
const newChat = document.getElementById("newChat");
const clearBtn = document.getElementById("clearBtn");
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.querySelector(".sidebar");

let history = [];

function addMessage(role, content) {
  if (welcome) welcome.remove();

  const row = document.createElement("div");
  row.className = `msg ${role === "user" ? "user" : "ai"}`;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = role === "user" ? "You" : "✦";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = content;

  row.append(avatar, bubble);
  messages.appendChild(row);
  messages.scrollTop = messages.scrollHeight;
  return bubble;
}

function addTyping() {
  if (welcome) welcome.remove();
  const row = document.createElement("div");
  row.className = "msg ai";
  row.id = "typing";
  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = "✦";
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
  row.append(avatar, bubble);
  messages.appendChild(row);
  messages.scrollTop = messages.scrollHeight;
}

function removeTyping() {
  document.getElementById("typing")?.remove();
}

async function sendMessage(text) {
  text = text.trim();
  if (!text || sendBtn.disabled) return;

  addMessage("user", text);
  history.push({ role: "user", content: text });
  input.value = "";
  input.style.height = "auto";
  sendBtn.disabled = true;
  addTyping();

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history })
    });

    const data = await response.json();
    removeTyping();

    if (!response.ok) throw new Error(data.error || "Something went wrong.");

    addMessage("assistant", data.reply);
    history.push({ role: "assistant", content: data.reply });
  } catch (error) {
    removeTyping();
    addMessage("assistant", `⚠️ ${error.message}`);
  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
}

form.addEventListener("submit", e => {
  e.preventDefault();
  sendMessage(input.value);
});

input.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    form.requestSubmit();
  }
});

input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 160) + "px";
});

document.querySelectorAll(".suggestions button").forEach(btn => {
  btn.addEventListener("click", () => sendMessage(btn.textContent));
});

function resetChat() {
  history = [];
  messages.innerHTML = `
    <div id="welcome" class="welcome">
      <div class="welcome-icon">✦</div>
      <h2>How can I help?</h2>
      <p>Ask a question, learn something new, or get help with code.</p>
      <div class="suggestions">
        <button>Explain Python loops simply</button>
        <button>Give me a cool website project idea</button>
        <button>Help me debug my code</button>
        <button>Teach me HTML and CSS</button>
      </div>
    </div>`;
  messages.querySelectorAll(".suggestions button").forEach(btn =>
    btn.addEventListener("click", () => sendMessage(btn.textContent))
  );
}

newChat.addEventListener("click", resetChat);
clearBtn.addEventListener("click", resetChat);
menuBtn?.addEventListener("click", () => sidebar.classList.toggle("open"));
messages.addEventListener("click", () => sidebar.classList.remove("open"));
