/* ============================================================
   CHATER AI — drop-in site chat widget
   ------------------------------------------------------------
   Usage: add this one line near the end of your page's <body>
       <script src="chater-ai.js"></script>
   That's it. No other markup, CSS, or JS needed on the host page.

   This version is a fully self-contained, offline "inbuilt" AI —
   there is no external API call, no API key, and no rate limit.
   It works by matching whatever the visitor types against a list
   of question/answer entries you define below, and only responds
   to things related to your site. Everything runs instantly in
   the visitor's browser for free, forever.
   ============================================================ */

(function () {
  "use strict";

  /* ============================================================
     1. SITE NAME + GREETING  (EDIT THIS SECTION)
     ============================================================ */
  const SITE_NAME = "Sulis Minerva";
  const GREETING = `Hi! I'm Chater AI 🤖 — ask me anything about ${SITE_NAME}.`;

  /* What Chater AI says when it can't find a good match for the question
     (either because it's off-topic, or just not covered below yet). */
  const FALLBACK_REPLY =
    `I can only help with questions about ${SITE_NAME} and I don't have an answer for that one yet. ` +
    `Try rephrasing, or contact us directly and we'll be happy to help.`;

  /* ============================================================
     2. KNOWLEDGE BASE  (EDIT THIS SECTION)
     ------------------------------------------------------------
     This is the whole "brain" of Chater AI. Add one entry per
     topic/question. Each entry has:
       - triggers: an array of words/short phrases a visitor might
         type that should lead to this answer. Add as many
         variations, synonyms, and misspellings as you can think of
         — the more you add, the smarter it feels.
       - answer: the exact reply Chater AI will give, word for word.

     There is no limit on how many entries you add. Order doesn't
     matter — the best-matching entry always wins.
     ============================================================ */
  const QA_PAIRS = [
    {
      triggers: ["what is sulis minerva", "what is this", "what do you sell", "about sulis minerva", "tell me about sulis minerva", "what is the product"],
      answer: `${SITE_NAME} is "Elixir of Life" — water sourced from the ancient Mendip spring, presented as a premium, modern product inspired by centuries of reverence for the source.`
    },
    {
      triggers: ["where does the water come from", "source", "mendip", "spring", "where is it from"],
      answer: `Our water is drawn from the ancient Mendip spring — a source that has been revered for centuries and is now presented for today.`
    },
    {
      triggers: ["price", "cost", "how much", "pricing"],
      answer: `Pricing details will be available once ${SITE_NAME} launches. Check back on the Shop page soon, or contact us for early information.`
    },
    {
      triggers: ["buy", "where can i buy", "purchase", "order", "shop"],
      answer: `${SITE_NAME} isn't available to purchase just yet — we're putting the finishing touches on launch. Click "Coming Soon" on the site and check back shortly!`
    },
    {
      triggers: ["shipping", "delivery", "how long does delivery take", "do you ship"],
      answer: `Shipping and delivery details will be published once ${SITE_NAME} officially launches. Please check back soon.`
    },
    {
      triggers: ["returns", "refund", "can i return it"],
      answer: `Our returns policy will be published at launch. In the meantime, feel free to contact us with any questions.`
    },
    {
      triggers: ["contact", "support", "help", "get in touch", "email", "phone number"],
      answer: `You can reach the ${SITE_NAME} team through the contact details on our site, or by replying here and a member of the team will follow up.`
    },
    {
      triggers: ["benefits", "why drink it", "what does it do", "health benefits"],
      answer: `${SITE_NAME} is presented around the ideas of everlasting life, prosperity, health, and water itself — the four pillars woven through our branding and sourced from ancient symbolism.`
    },
    {
      triggers: ["hello", "hi", "hey", "good morning", "good afternoon"],
      answer: GREETING
    },
    {
      triggers: ["thank you", "thanks", "cheers"],
      answer: `You're welcome! Let me know if there's anything else about ${SITE_NAME} I can help with.`
    }
  ];

  /* ============================================================
     Everything below this line is the widget engine.
     You shouldn't need to touch it.
     ============================================================ */

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
      <div class="cha-bubble" id="chaBubble" title="Chat with Chater AI">${robotSVG}</div>
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
     Very small, fast, dependency-free keyword matcher. Scores each
     QA_PAIRS entry by how many of its trigger words/phrases appear
     in what the visitor typed, then returns the best match if it
     clears a minimum confidence bar — otherwise FALLBACK_REPLY.
     ============================================================ */
  function normalize(str) {
    return str
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function scoreEntry(userText, entry) {
    const normUser = " " + normalize(userText) + " ";
    let best = 0;
    entry.triggers.forEach((trigger) => {
      const t = normalize(trigger);
      if (!t) return;
      if (normUser.includes(" " + t + " ")) {
        // Exact phrase match — strong signal, longer phrases score higher.
        best = Math.max(best, 10 + t.split(" ").length);
        return;
      }
      // Partial word-overlap fallback for looser matching.
      const words = t.split(" ").filter(Boolean);
      const hits = words.filter((w) => w.length > 2 && normUser.includes(" " + w + " ")).length;
      if (hits > 0) {
        best = Math.max(best, (hits / words.length) * 6);
      }
    });
    return best;
  }

  function findReply(userText) {
    let bestScore = 0;
    let bestAnswer = null;
    QA_PAIRS.forEach((entry) => {
      const score = scoreEntry(userText, entry);
      if (score > bestScore) {
        bestScore = score;
        bestAnswer = entry.answer;
      }
    });
    const CONFIDENCE_THRESHOLD = 3; // tune this if it feels too strict/loose
    return bestScore >= CONFIDENCE_THRESHOLD ? bestAnswer : FALLBACK_REPLY;
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

      // Tiny artificial delay so it feels like a response rather than an
      // instant lookup — purely cosmetic, the matching itself is instant.
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
