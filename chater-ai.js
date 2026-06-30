/* ============================================================
   CHATER AI — drop-in site chat widget
   ------------------------------------------------------------
   Usage: add this one line near the end of your page's <body>
       <script src="chater-ai.js"></script>
   That's it. No other markup, CSS, or JS needed on the host page.

   Everything (HTML, CSS, behaviour) is self-contained and gets
   injected into the page automatically when this file loads.
   ============================================================ */

(function () {
  "use strict";

  /* ============================================================
     1. SITE KNOWLEDGE  (EDIT THIS SECTION)
     ------------------------------------------------------------
     Put whatever information you want Chater AI to know about
     YOUR site here. This is the only thing it is allowed to talk
     about — it will politely decline anything unrelated.
     Plain text is fine, write it like you're briefing a new
     member of staff.
     ============================================================ */
  const SITE_NAME = "Sulis Minerva";

  const SITE_KNOWLEDGE = `
Site name: Sulis Minerva
Product: "Elixir of Life"

--- Replace everything below with real site details ---
- What the product is and what it does
- Ingredients / ingredient highlights
- Pricing and where/how to buy
- Shipping, returns, and delivery times
- FAQs (storage, dosage, who it's for, allergens, etc.)
- Contact details / support hours
- Any promotions or bundles currently running
`.trim();

  /* Optional: a short opening line Chater AI uses when first opened */
  const GREETING = `Hi! I'm Chater AI 🤖 — ask me anything about ${SITE_NAME}.`;

  /* ============================================================
     2. CONNECTION SETTINGS  (EDIT THIS SECTION)
     ------------------------------------------------------------
     Chater AI calls OpenRouter's chat completion endpoint.
     The key is split into two raw-text files hosted on GitHub
     (KEY1_URL + KEY2_URL, joined together at runtime) so the full
     key never sits in one place in plain text. Update those two
     files whenever you need to rotate the key — every site
     embedding this one chater-ai.js file picks up the change
     automatically. You can also just paste a full key directly
     into OPENROUTER_API_KEY below and skip the URLs entirely.
     ============================================================ */
  const OPENROUTER_API_KEY = ""; // <-- paste a key here directly, or leave blank to use the URLs below

  // Key is split across two raw-text files and joined together at runtime.
  const KEY1_URL = "https://raw.githubusercontent.com/21cookej/21cookej.github.io/refs/heads/main/key1.txt";
  const KEY2_URL = "https://raw.githubusercontent.com/21cookej/21cookej.github.io/refs/heads/main/key2.txt";

  const MODEL = "openai/gpt-oss-120b:free";

  /* ============================================================
     Everything below this line is the widget engine.
     You shouldn't need to touch it.
     ============================================================ */

  /* Chat is intentionally NOT persisted — every page load / re-open starts fresh. */

  const css = `
  .cha-root{position:fixed;bottom:20px;right:20px;z-index:999999;font-family:'DM Sans',Arial,sans-serif;}
  .cha-bubble{width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#f7c948,#caa018);box-shadow:0 6px 20px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;cursor:pointer;border:2px solid #fff3cf;transition:transform .18s ease;}
  .cha-bubble:hover{transform:scale(1.07);}
  .cha-bubble svg{width:32px;height:32px;}
  .cha-panel{position:absolute;bottom:74px;right:0;width:320px;height:430px;background:#fffaf0;border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.28);display:none;flex-direction:column;overflow:hidden;border:1px solid #ecd9a0;}
  .cha-panel.open{display:flex;}
  .cha-head{background:linear-gradient(135deg,#f7c948,#caa018);padding:12px 14px;display:flex;align-items:center;gap:10px;color:#3a2c05;}
  .cha-head-avatar{width:30px;height:30px;border-radius:50%;background:#fffaf0;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
  .cha-head-avatar svg{width:18px;height:18px;}
  .cha-head-text{flex:1;}
  .cha-head-title{font-weight:700;font-size:13.5px;line-height:1.2;}
  .cha-head-sub{font-size:10.5px;opacity:.75;}
  .cha-close{background:none;border:none;cursor:pointer;color:#3a2c05;font-size:18px;line-height:1;padding:2px 4px;}
  .cha-body{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:10px;background:#fffdf6;}
  .cha-body::-webkit-scrollbar{width:4px;}
  .cha-body::-webkit-scrollbar-thumb{background:#ecd9a0;border-radius:4px;}
  .cha-msg{max-width:84%;padding:9px 12px;border-radius:14px;font-size:13px;line-height:1.45;word-wrap:break-word;white-space:pre-wrap;}
  .cha-msg.user{align-self:flex-end;background:linear-gradient(135deg,#f7c948,#caa018);color:#2c2205;border-bottom-right-radius:4px;}
  .cha-msg.bot{align-self:flex-start;background:#fff;border:1px solid #ecd9a0;color:#2c2205;border-bottom-left-radius:4px;}
  .cha-typing{align-self:flex-start;display:flex;gap:4px;padding:9px 12px;}
  .cha-typing span{width:6px;height:6px;background:#caa018;border-radius:50%;animation:cha-bounce 1.2s infinite ease-in-out both;}
  .cha-typing span:nth-child(2){animation-delay:.15s;}
  .cha-typing span:nth-child(3){animation-delay:.3s;}
  @keyframes cha-bounce{0%,80%,100%{transform:scale(.4);opacity:.5;}40%{transform:scale(1);opacity:1;}}
  .cha-input-row{display:flex;gap:6px;padding:10px;border-top:1px solid #ecd9a0;background:#fffaf0;}
  .cha-input-row input{flex:1;border:1px solid #ecd9a0;border-radius:10px;padding:8px 10px;font-size:13px;outline:none;font-family:inherit;background:#fff;}
  .cha-input-row input:focus{border-color:#caa018;}
  .cha-send{background:linear-gradient(135deg,#f7c948,#caa018);border:none;color:#2c2205;border-radius:10px;padding:0 14px;font-size:12.5px;font-weight:600;cursor:pointer;}
  .cha-send:disabled{opacity:.5;cursor:not-allowed;}
  `;

  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  }

  const robotSVG = `
    <svg viewBox="0 0 24 24" fill="none" stroke="#3a2c05" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
      <rect x="5" y="9" width="14" height="10" rx="2"></rect>
      <circle cx="9" cy="14" r="1.3" fill="#3a2c05"></circle>
      <circle cx="15" cy="14" r="1.3" fill="#3a2c05"></circle>
      <path d="M9 17h6"></path>
      <path d="M12 9V5"></path>
      <circle cx="12" cy="3.5" r="1.4" fill="#3a2c05"></circle>
      <path d="M2 13h3"></path>
      <path d="M19 13h3"></path>
    </svg>`;

  function buildDom() {
    const root = document.createElement("div");
    root.className = "cha-root";
    root.innerHTML = `
      <div class="cha-panel" id="chaPanel">
        <div class="cha-head">
          <div class="cha-head-avatar">${robotSVG}</div>
          <div class="cha-head-text">
            <div class="cha-head-title">Chater AI</div>
            <div class="cha-head-sub">${SITE_NAME} assistant</div>
          </div>
          <button class="cha-close" id="chaClose">✕</button>
        </div>
        <div class="cha-body" id="chaBody"></div>
        <div class="cha-input-row">
          <input id="chaInput" type="text" placeholder="Ask about ${SITE_NAME}…" />
          <button class="cha-send" id="chaSend">Send</button>
        </div>
      </div>
      <div class="cha-bubble" id="chaBubble" title="Chat with Chater AI">${robotSVG.replace(/width="14"/, 'width="14"')}</div>
    `;
    document.body.appendChild(root);
    return root;
  }

  /* History lives only in memory for the current page view — never saved. */

  function appendMessage(body, text, role) {
    const div = document.createElement("div");
    div.className = "cha-msg " + (role === "user" ? "user" : "bot");
    div.textContent = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
    return div;
  }

  function showTyping(body) {
    const div = document.createElement("div");
    div.className = "cha-typing";
    div.id = "chaTypingIndicator";
    div.innerHTML = "<span></span><span></span><span></span>";
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }
  function hideTyping() {
    const el = document.getElementById("chaTypingIndicator");
    if (el) el.remove();
  }

  async function resolveApiKey() {
    if (OPENROUTER_API_KEY) return OPENROUTER_API_KEY;
    const cached = sessionStorage.getItem("chater_ai_key");
    if (cached) return cached;
    if (!KEY1_URL || !KEY2_URL) return "";
    try {
      const [res1, res2] = await Promise.all([fetch(KEY1_URL), fetch(KEY2_URL)]);
      if (!res1.ok || !res2.ok) return "";
      const key1 = (await res1.text()).trim();
      const key2 = (await res2.text()).trim();
      const key = key1 + key2;
      if (key.length > 10) {
        sessionStorage.setItem("chater_ai_key", key);
        return key;
      }
    } catch (e) {}
    return "";
  }

  function buildSystemPrompt() {
    return `You are "Chater AI", a friendly help-desk assistant embedded on the website "${SITE_NAME}".

You may ONLY answer questions that relate to this website, its products, content, policies, or the information below. This includes greetings and basic small talk about the site itself.

If a visitor asks something unrelated to ${SITE_NAME} (e.g. general trivia, coding help, world news, topics outside this site), politely decline and steer them back, for example: "I can only help with questions about ${SITE_NAME} — is there something about the site or our products I can help with?" Do not answer the unrelated question even partially.

Here is everything you are allowed to know about the site. Treat it as ground truth. If the answer isn't covered here, say you don't have that information and suggest the visitor contact support, rather than guessing:

----- SITE INFORMATION -----
${SITE_KNOWLEDGE}
----- END SITE INFORMATION -----

Keep replies concise, warm, and easy to read in a small chat window (a few sentences at most unless detail is genuinely needed).`;
  }

  async function getReply(history) {
    const apiKey = await resolveApiKey();
    if (!apiKey) {
      return "Chater AI isn't fully set up yet — no API key has been configured for this site.";
    }
    const messages = [{ role: "system", content: buildSystemPrompt() }].concat(
      history.map((m) => ({ role: m.role === "bot" ? "assistant" : "user", content: m.text }))
    );
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + apiKey,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "Chater AI",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: messages,
          temperature: 0.4,
        }),
      });
      const data = await res.json();
      if (data.choices && data.choices[0]) return data.choices[0].message.content;
      if (data.error) return "Sorry, something went wrong: " + data.error.message;
      return "Sorry, I didn't get a usable response. Please try again.";
    } catch (e) {
      return "Sorry, I couldn't connect right now. Please try again in a moment.";
    }
  }

  function init() {
    injectStyles();
    const root = buildDom();
    const bubble = root.querySelector("#chaBubble");
    const panel = root.querySelector("#chaPanel");
    const closeBtn = root.querySelector("#chaClose");
    const body = root.querySelector("#chaBody");
    const input = root.querySelector("#chaInput");
    const sendBtn = root.querySelector("#chaSend");

    let history = [{ role: "bot", text: GREETING }];
    appendMessage(body, GREETING, "bot");

    function resetChat() {
      history = [{ role: "bot", text: GREETING }];
      body.innerHTML = "";
      appendMessage(body, GREETING, "bot");
    }

    let open = false;
    function togglePanel(force) {
      open = typeof force === "boolean" ? force : !open;
      panel.classList.toggle("open", open);
      if (open) {
        // Quietly make sure the key is ready before the visitor types anything —
        // resolveApiKey() caches the result, so this costs nothing if already fetched.
        resolveApiKey();
        setTimeout(() => input.focus(), 50);
      } else {
        // Every time the widget is closed, wipe the conversation so it's fresh next time.
        resetChat();
      }
    }
    bubble.addEventListener("click", () => togglePanel());
    closeBtn.addEventListener("click", () => togglePanel(false));

    let busy = false;
    async function send() {
      const text = input.value.trim();
      if (!text || busy) return;
      input.value = "";
      history.push({ role: "user", text });
      appendMessage(body, text, "user");

      busy = true;
      sendBtn.disabled = true;
      showTyping(body);
      const reply = await getReply(history);
      hideTyping();
      busy = false;
      sendBtn.disabled = false;

      history.push({ role: "bot", text: reply });
      appendMessage(body, reply, "bot");
    }

    sendBtn.addEventListener("click", send);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        send();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
