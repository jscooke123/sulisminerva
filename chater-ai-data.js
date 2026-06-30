/* ============================================================
   CHATER AI — KNOWLEDGE BASE
   ------------------------------------------------------------
   This file holds everything Chater AI is allowed to talk about.
   It must be loaded BEFORE chater-ai.js, e.g.:

       <script src="chater-ai-data.js"></script>
       <script src="chater-ai.js"></script>

   Keeping this in its own file means you (or anyone managing the
   site) can edit, extend, or completely rewrite the knowledge base
   without ever touching the widget's actual code in chater-ai.js.

   ------------------------------------------------------------
   HOW TO ADD / EDIT AN ENTRY
   ------------------------------------------------------------
   Each entry in qaPairs needs:
     - triggers: an array of words or short phrases a visitor might
       type. Add LOTS of variations — synonyms, shorter/longer
       phrasings, common misspellings if you can think of obvious
       ones. The matching engine in chater-ai.js also does fuzzy
       (typo-tolerant) matching automatically, so you don't have to
       list every possible misspelling, but the more natural
       phrasings you include the more accurate it will be.
     - answer: the exact reply Chater AI gives, word for word.

   There's no limit on how many entries you add, and order doesn't
   matter — whichever entry matches best always wins.
   ============================================================ */

window.CHATER_AI_DATA = {

  siteName: "Sulis Minerva",

  greeting: "Hi! I'm Chater AI 🤖 — ask me anything about Sulis Minerva.",

  fallback:
    "I can only help with questions about Sulis Minerva and I don't have an answer for that one yet. " +
    "Try rephrasing, or contact us directly and we'll be happy to help.",

  qaPairs: [

    /* ── Greetings / small talk ───────────────────────────── */
    {
      triggers: ["hello", "hi", "hey", "hiya", "yo", "good morning", "good afternoon", "good evening", "morning", "afternoon"],
      answer: "Hi! I'm Chater AI 🤖 — ask me anything about Sulis Minerva."
    },
    {
      triggers: ["how are you", "how's it going", "you good", "you ok", "are you a bot", "are you human", "are you real", "are you ai"],
      answer: "I'm Chater AI, the assistant for Sulis Minerva — I'm doing great, thanks for asking! What would you like to know about the site or our products?"
    },
    {
      triggers: ["thank you", "thanks", "thx", "cheers", "appreciate it", "ta"],
      answer: "You're welcome! Let me know if there's anything else about Sulis Minerva I can help with."
    },
    {
      triggers: ["bye", "goodbye", "see you", "later", "that's all", "thats all", "no thanks"],
      answer: "Thanks for stopping by Sulis Minerva — come back any time!"
    },
    {
      triggers: ["who are you", "what are you", "your name", "what's your name", "whats your name"],
      answer: "I'm Chater AI, the built-in assistant here on the Sulis Minerva site — happy to answer questions about the brand, the product, and how to get in touch."
    },

    /* ── About the brand / product ────────────────────────── */
    {
      triggers: ["what is sulis minerva", "what is this site", "what is this", "what do you sell", "about sulis minerva", "tell me about sulis minerva", "what is the product", "what is sulis minerva about", "explain sulis minerva"],
      answer: "Sulis Minerva is \"Elixir of Life\" — water sourced from the ancient Mendip spring, presented as a premium, modern product inspired by centuries of reverence for the source."
    },
    {
      triggers: ["what does sulis minerva mean", "where does the name come from", "meaning of the name", "who is sulis minerva", "sulis minerva goddess"],
      answer: "The name draws on Sulis Minerva, the Romano-British goddess worshipped at the sacred spring in Bath — a fusion of the Celtic goddess Sulis and the Roman goddess Minerva, both associated with healing waters and wisdom."
    },
    {
      triggers: ["is it a real product", "is this real", "can i actually buy this", "is sulis minerva real"],
      answer: "Yes — Sulis Minerva is a real product currently being prepared for launch. Some features like checkout are still \"coming soon\" while we finish getting everything ready."
    },

    /* ── The source / water ───────────────────────────────── */
    {
      triggers: ["where does the water come from", "source", "mendip", "spring", "where is it from", "where is the water sourced", "water source", "where do you get your water"],
      answer: "Our water is drawn from the ancient Mendip spring — a source that has been revered for centuries and is now presented for today."
    },
    {
      triggers: ["is the water natural", "is it natural spring water", "natural water", "mineral water"],
      answer: "Yes, Sulis Minerva water comes from a natural spring source in the Mendip Hills, valued for generations before being bottled for Sulis Minerva."
    },
    {
      triggers: ["water quality", "is it tested", "is it safe to drink", "water safety"],
      answer: "Full water quality and testing details will be published alongside our official launch — please check back soon for the complete information."
    },

    /* ── Pricing / buying ──────────────────────────────────── */
    {
      triggers: ["price", "cost", "how much", "pricing", "how much does it cost", "what's the price", "whats the price"],
      answer: "Pricing details will be available once Sulis Minerva launches. Check back on the Shop page soon, or contact us for early information."
    },
    {
      triggers: ["buy", "where can i buy", "purchase", "order", "shop", "how do i buy it", "how to order", "buy now", "where to buy"],
      answer: "Sulis Minerva isn't available to purchase just yet — we're putting the finishing touches on launch. Click \"Coming Soon\" on the site and check back shortly!"
    },
    {
      triggers: ["when does it launch", "launch date", "when can i buy it", "when is it coming out", "release date", "when will it be available"],
      answer: "We don't have an exact launch date to share publicly yet, but Sulis Minerva is actively being prepared for release — keep an eye on the site for updates."
    },
    {
      triggers: ["subscription", "subscribe", "recurring order", "monthly delivery"],
      answer: "Subscription options haven't been announced yet, but they may be available at launch — check back soon for details."
    },
    {
      triggers: ["bundle", "discount", "bulk order", "wholesale", "multipack"],
      answer: "Bundle and bulk options will be detailed once Sulis Minerva officially launches. Please check back soon."
    },

    /* ── Shipping / returns ───────────────────────────────── */
    {
      triggers: ["shipping", "delivery", "how long does delivery take", "do you ship", "shipping cost", "delivery time", "how fast is shipping", "international shipping", "do you ship internationally", "do you deliver"],
      answer: "Shipping and delivery details will be published once Sulis Minerva officially launches. Please check back soon."
    },
    {
      triggers: ["returns", "refund", "can i return it", "return policy", "money back", "exchange"],
      answer: "Our returns policy will be published at launch. In the meantime, feel free to contact us with any questions."
    },

    /* ── Contact / support ────────────────────────────────── */
    {
      triggers: ["contact", "support", "help", "get in touch", "email", "phone number", "customer service", "contact details", "contact you", "speak to someone"],
      answer: "You can reach the Sulis Minerva team through the contact details on our site, or by replying here and a member of the team will follow up."
    },
    {
      triggers: ["social media", "instagram", "facebook", "twitter", "tiktok", "follow you"],
      answer: "Links to our social media pages will be added to the site soon — check the footer for updates."
    },

    /* ── Benefits / ingredients / usage ───────────────────── */
    {
      triggers: ["benefits", "why drink it", "what does it do", "health benefits", "why should i drink this", "what are the benefits"],
      answer: "Sulis Minerva is presented around the ideas of everlasting life, prosperity, health, and water itself — the four pillars woven through our branding and sourced from ancient symbolism."
    },
    {
      triggers: ["ingredients", "what's in it", "whats in it", "composition", "what is it made of"],
      answer: "Sulis Minerva's core ingredient is pure spring water drawn from the Mendip source. Full ingredient details will be listed at launch."
    },
    {
      triggers: ["allergens", "is it vegan", "is it gluten free", "allergy information", "dietary information"],
      answer: "Full allergen and dietary information will be published at launch. As a spring water product it's expected to suit most dietary needs, but please check the official listing once available."
    },
    {
      triggers: ["how do i store it", "storage", "shelf life", "how long does it last", "expiry", "best before"],
      answer: "Storage and shelf-life information will be provided on the packaging and product page once Sulis Minerva launches."
    },
    {
      triggers: ["dosage", "how much should i drink", "how often should i drink it", "serving size"],
      answer: "As a water-based product, Sulis Minerva can be enjoyed freely as part of your normal hydration — specific serving guidance will be shared at launch if relevant."
    },
    {
      triggers: ["who is it for", "is it for everyone", "can children drink it", "is it for kids"],
      answer: "Sulis Minerva is designed to be enjoyed by anyone who appreciates premium spring water — specific guidance for children or particular groups will be confirmed at launch."
    },
    {
      triggers: ["gift", "gifting", "can i gift this", "gift set", "present"],
      answer: "Gifting options haven't been announced yet, but Sulis Minerva's premium presentation would make a lovely gift — check back for gift set details at launch."
    },

    /* ── Sustainability / packaging ───────────────────────── */
    {
      triggers: ["sustainable", "sustainability", "eco friendly", "environment", "recyclable", "packaging material"],
      answer: "Sustainability details, including packaging materials and recyclability, will be published once Sulis Minerva officially launches."
    },
    {
      triggers: ["what does it come in", "bottle or can", "packaging", "what's the packaging like"],
      answer: "Sulis Minerva is presented in branded packaging inspired by ancient Egyptian and Romano-British symbolism — full packaging details will be shown at launch."
    }

  ]
};
