/* ============================================================
   CHATER AI — drop-in site chat widget
   ------------------------------------------------------------
   Usage: add these two lines near the end of your page's <body>,
   in this order:

       <script src="chater-ai-data.js"></script>
       <script src="chater-ai.js"></script>

   chater-ai-data.js holds all the questions/answers Chater AI
   knows (see that file to edit or extend the knowledge base).
   chater-ai.js (this file) is just the widget engine — you
   shouldn't need to edit anything below.

   This is a fully self-contained, offline "inbuilt" AI — there is
   no external API call, no API key, and no rate limit. It works
   by matching whatever the visitor types against the knowledge
   base, including typo-tolerant ("fuzzy") matching so close
   misspellings still find the right answer.
   ============================================================ */
(function () {
  "use strict";

  const DATA = window.CHATER_AI_DATA || {};
  const SITE_NAME = DATA.siteName || "this site";
  const GREETING = DATA.greeting || `Hi! I'm Sulis Minerva AI — ask me anything about ${SITE_NAME}.`;
  const FALLBACK_REPLY =
    DATA.fallback ||
    `I can only help with questions about ${SITE_NAME} and I don't have an answer for that one yet. Try rephrasing, or contact us directly.`;
  const QA_PAIRS = Array.isArray(DATA.qaPairs) ? DATA.qaPairs : [];

  if (QA_PAIRS.length === 0) {
    console.warn(
      "Sulis Minerva AI: no knowledge base found. Make sure chater-ai-data.js is loaded BEFORE chater-ai.js."
    );
  }

  /* ============================================================
     STYLES + MARKUP
     ============================================================ */
  const css = `
  .cha-root{position:fixed;bottom:20px;right:20px;z-index:999999;font-family:'DM Sans',Arial,sans-serif;}
  .cha-bubble{width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#c9a455,#a9842f);box-shadow:0 6px 20px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;cursor:pointer;border:2px solid #fff3cf;transition:transform .18s ease;}
  .cha-bubble:hover{transform:scale(1.07);}
  .cha-bubble svg{width:32px;height:32px;}
  .cha-panel{position:absolute;bottom:74px;right:0;width:320px;height:430px;background:#fffaf0;border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.28);display:none;flex-direction:column;overflow:hidden;border:1px solid #ecd9a0;}
  .cha-panel.open{display:flex;}
  .cha-head{background:linear-gradient(135deg,#f7c948,#a9842f);padding:12px 14px;display:flex;align-items:center;gap:10px;color:#3a2c05;}
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
            <div class="cha-head-title">Sulis Minerva AI</div>
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
      <div class="cha-bubble" id="chaBubble" title="Chat with Sulis Minerva AI">${robotSVG}</div>
    `;
    document.body.appendChild(root);
    return root;
  }

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

  /* ============================================================
     MATCHING ENGINE
     ------------------------------------------------------------
     A small, fast, dependency-free matcher with two layers:

     1. EXACT layer — if a whole trigger phrase appears verbatim in
        what the visitor typed, that's the strongest possible signal.
     2. FUZZY layer — every word the visitor typed is compared
        against every trigger word using Levenshtein ("edit")
        distance, so close misspellings ("recieve", "deliverry",
        "pric") still match the right trigger word. The shorter the
        word, the less typo tolerance it gets (to avoid false
        matches between short unrelated words).

     Scores from both layers are combined per knowledge-base entry,
     and the entry with the highest combined score wins — as long
     as it clears CONFIDENCE_THRESHOLD. Below that, Chater AI
     admits it doesn't know rather than guessing.
     ============================================================ */
  function normalize(str) {
    return str
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  // Classic Levenshtein edit-distance between two strings.
  function levenshtein(a, b) {
    if (a === b) return 0;
    const al = a.length, bl = b.length;
    if (al === 0) return bl;
    if (bl === 0) return al;
    let prev = new Array(bl + 1);
    let curr = new Array(bl + 1);
    for (let j = 0; j <= bl; j++) prev[j] = j;
    for (let i = 1; i <= al; i++) {
      curr[0] = i;
      for (let j = 1; j <= bl; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        curr[j] = Math.min(
          prev[j] + 1,      // deletion
          curr[j - 1] + 1,  // insertion
          prev[j - 1] + cost // substitution
        );
      }
      const tmp = prev; prev = curr; curr = tmp;
    }
    return prev[bl];
  }

  // How many typo "edits" we tolerate for a word of a given length.
  function toleranceFor(len) {
    if (len <= 3) return 0;   // very short words must match exactly
    if (len <= 5) return 1;
    if (len <= 8) return 2;
    return 3;
  }

  // Does userWord fuzzy-match triggerWord within tolerance?
  function fuzzyWordMatch(userWord, triggerWord) {
    if (userWord === triggerWord) return true;
    const tol = toleranceFor(Math.min(userWord.length, triggerWord.length));
    if (tol === 0) return false;
    if (Math.abs(userWord.length - triggerWord.length) > tol) return false;
    return levenshtein(userWord, triggerWord) <= tol;
  }

  function scoreEntry(userWords, normUserPadded, entry) {
    let best = 0;
    entry.triggers.forEach((trigger) => {
      const t = normalize(trigger);
      if (!t) return;

      // Layer 1 — exact phrase match (strongest signal).
      if (normUserPadded.includes(" " + t + " ")) {
        best = Math.max(best, 10 + t.split(" ").length);
        return;
      }

      // Layer 2 — per-word fuzzy match (typo tolerant).
      const triggerWords = t.split(" ").filter(Boolean);
      let hits = 0;
      triggerWords.forEach((tw) => {
        const matched = userWords.some((uw) => fuzzyWordMatch(uw, tw));
        if (matched) hits++;
      });
      if (hits > 0) {
        best = Math.max(best, (hits / triggerWords.length) * 6);
      }
    });
    return best;
  }

  function findReply(userText) {
    const normUser = normalize(userText);
    const normUserPadded = " " + normUser + " ";
    const userWords = normUser.split(" ").filter(Boolean);

    let bestScore = 0;
    let bestAnswer = null;
    QA_PAIRS.forEach((entry) => {
      const score = scoreEntry(userWords, normUserPadded, entry);
      if (score > bestScore) {
        bestScore = score;
        bestAnswer = entry.answer;
      }
    });

    const CONFIDENCE_THRESHOLD = 3; // tune if it feels too strict/loose
    return bestScore >= CONFIDENCE_THRESHOLD ? bestAnswer : FALLBACK_REPLY;
  }

  /* ============================================================
     WIDGET BEHAVIOUR
     ============================================================ */
  function init() {
    injectStyles();
    const root = buildDom();
    const bubble = root.querySelector("#chaBubble");
    const panel = root.querySelector("#chaPanel");
    const closeBtn = root.querySelector("#chaClose");
    const body = root.querySelector("#chaBody");
    const input = root.querySelector("#chaInput");
    const sendBtn = root.querySelector("#chaSend");

    function resetChat() {
      body.innerHTML = "";
      appendMessage(body, GREETING, "bot");
    }
    resetChat();

    let open = false;
    function togglePanel(force) {
      open = typeof force === "boolean" ? force : !open;
      panel.classList.toggle("open", open);
      if (open) {
        setTimeout(() => input.focus(), 50);
      } else {
        // Every time the widget is closed, wipe the conversation so it's fresh next time.
        resetChat();
      }
    }
    bubble.addEventListener("click", () => togglePanel());
    closeBtn.addEventListener("click", () => togglePanel(false));

    let busy = false;
    function send() {
      const text = input.value.trim();
      if (!text || busy) return;
      input.value = "";
      appendMessage(body, text, "user");

      busy = true;
      sendBtn.disabled = true;
      showTyping(body);

      // Tiny artificial delay so it feels like a considered response rather
      // than an instant lookup — the matching itself is instant either way.
      setTimeout(() => {
        hideTyping();
        busy = false;
        sendBtn.disabled = false;
        const reply = findReply(text);
        appendMessage(body, reply, "bot");
      }, 350);
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
