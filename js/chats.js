const DIALOGUE_SPEECH_SRC = "sounds/speech.mp3";
const DIALOGUE_HINT_TEXT = "Press anywhere to continue.";
const DIALOGUE_CONFIRM_KEYS = new Set(["Space", "Enter", "NumpadEnter"]);
const DIALOGUE_CHAR_REVEAL_MS = 18;
const DIALOGUE_DOT_PAUSE_MS = 350;
const DIALOGUE_SPEECH_CUTOFF_MS = 450;
const DIALOGUE_SPEECH_VOLUME = 0.12;
const DIALOGUE_SPEECH_MIN_INTERVAL_MS = 70;
let lastDialogueSpeechAt = 0;

function getChatBubbleElement(id) {
  return document.getElementById(id);
}

function getDialogueOverlayElements() {
  const overlay = document.createElement("div");
  overlay.className = "story-dialogue-overlay";

  const panel = document.createElement("div");
  panel.className = "story-dialogue-panel";
  overlay.appendChild(panel);

  const portrait = document.createElement("img");
  portrait.className = "story-dialogue-portrait";
  portrait.alt = "";
  panel.appendChild(portrait);

  const body = document.createElement("div");
  body.className = "story-dialogue-body";
  panel.appendChild(body);

  const speaker = document.createElement("div");
  speaker.className = "story-dialogue-speaker";
  body.appendChild(speaker);

  const text = document.createElement("div");
  text.className = "story-dialogue-text";
  body.appendChild(text);

  const hint = document.createElement("div");
  hint.className = "story-dialogue-hint";
  hint.innerText = DIALOGUE_HINT_TEXT;
  body.appendChild(hint);

  return { overlay, panel, portrait, body, speaker, text };
}

function dialogueSpeechPlaybackRate(entry) {
  const speakerName = String(entry?.speaker || "").trim();
  if (speakerName === "Burger Overlord") return 0.8;
  if (speakerName === "Patrick") return 0.88;
  if (speakerName === "Kostya") return 0.94;
  if (speakerName === "Jacob") return 0.98;
  return 0.96;
}

function playDialogueTypingSound(entry, char) {
  if (!entry || !char || /\s/.test(char)) return;
  const now = performance.now();
  if (now - lastDialogueSpeechAt < DIALOGUE_SPEECH_MIN_INTERVAL_MS) return;
  lastDialogueSpeechAt = now;

  const audio = new Audio(DIALOGUE_SPEECH_SRC);
  audio.volume = DIALOGUE_SPEECH_VOLUME;
  audio.playbackRate = dialogueSpeechPlaybackRate(entry);
  let stopTimer = null;
  const stopPlayback = () => {
    if (stopTimer) {
      clearTimeout(stopTimer);
      stopTimer = null;
    }
    audio.pause();
    audio.currentTime = 0;
  };
  const scheduleCutoffStop = () => {
    if (stopTimer) {
      clearTimeout(stopTimer);
      stopTimer = null;
    }
    const realTimeMs = DIALOGUE_SPEECH_CUTOFF_MS / Math.max(0.01, audio.playbackRate || 1);
    stopTimer = window.setTimeout(stopPlayback, realTimeMs);
  };

  try {
    void audio.play().catch(() => {});
    scheduleCutoffStop();
  } catch (err) {
    void err;
  }
}

function revealDelayMs(chars, charIdx) {
  return chars[charIdx] === "."
    ? DIALOGUE_DOT_PAUSE_MS
    : DIALOGUE_CHAR_REVEAL_MS;
}

function isDialogueConfirmKey(code) {
  return DIALOGUE_CONFIRM_KEYS.has(code);
}

export function chatBubbleHtml(id) {
  return `<div id="${id}" class="chat-bubble hidden"></div>`;
}

export function chatBubbleHtmlForEnemy(enemyId) {
  return chatBubbleHtml(`enemy-chat-${enemyId}`);
}

export function chatBubbleHtmlForAlly(baseId) {
  return chatBubbleHtml(`${baseId}ChatBubble`);
}

export function getChatInputElements() {
  return {
    wrap: document.getElementById("chatInputWrap"),
    input: document.getElementById("chatInput")
  };
}

export function showChatInput(show = true) {
  const { wrap } = getChatInputElements();
  if (!wrap) return;
  wrap.classList.toggle("hidden", !show);
}

export function setChatInputEnabled(enabled = true) {
  const { input } = getChatInputElements();
  if (!input) return;
  input.disabled = !enabled;
}

export function setChatBubbleText(id, text = "") {
  const bubble = getChatBubbleElement(id);
  if (!bubble) return;
  bubble.innerText = text;
  bubble.classList.toggle("hidden", !text);
}

export function runDialogueScene({ steps = [] } = {}) {
  if (!Array.isArray(steps) || !steps.length) return Promise.resolve();

  return new Promise((resolve) => {
    const bodyEl = document.body;
    const { overlay, panel, portrait, body, speaker, text } = getDialogueOverlayElements();

    let idx = 0;
    let done = false;
    let charTimer = null;
    let currentChars = [];
    let typingComplete = false;
    let activeEntry = null;

    const stopTyping = () => {
      if (!charTimer) return;
      clearTimeout(charTimer);
      charTimer = null;
    };

    const revealAllChars = () => {
      currentChars.forEach((charEl) => charEl.classList.add("visible"));
      typingComplete = true;
      stopTyping();
    };

    const startTyping = (value) => {
      stopTyping();
      typingComplete = false;
      text.innerHTML = "";
      currentChars = [];

      const chars = Array.from(String(value || ""));
      if (!chars.length) {
        typingComplete = true;
        return;
      }

      chars.forEach((char) => {
        const charEl = document.createElement("span");
        charEl.className = "story-dialogue-char";
        charEl.textContent = char;
        text.appendChild(charEl);
        currentChars.push(charEl);
      });

      let revealIdx = 0;
      const revealNextChar = () => {
        if (revealIdx >= currentChars.length) {
          typingComplete = true;
          stopTyping();
          return;
        }

        currentChars[revealIdx].classList.add("visible");
        playDialogueTypingSound(activeEntry, chars[revealIdx]);
        revealIdx += 1;

        if (revealIdx >= currentChars.length) {
          typingComplete = true;
          stopTyping();
          return;
        }

        charTimer = setTimeout(revealNextChar, revealDelayMs(chars, revealIdx));
      };

      charTimer = setTimeout(revealNextChar, revealDelayMs(chars, 0));
    };

    const renderStep = () => {
      const entry = steps[idx] || {};
      activeEntry = entry;
      portrait.src = entry.portrait || "";
      portrait.classList.toggle("hidden", !entry.portrait);
      portrait.alt = entry.speaker || "";
      const isBurgerOverlord = String(entry.speaker || "").trim() === "Burger Overlord";
      panel.classList.toggle("story-dialogue-panel-right", isBurgerOverlord);
      panel.classList.toggle("story-dialogue-panel-left", !isBurgerOverlord);
      portrait.classList.toggle("story-dialogue-portrait-right", isBurgerOverlord);
      portrait.classList.toggle("story-dialogue-portrait-left", !isBurgerOverlord);
      body.classList.toggle("story-dialogue-body-right", isBurgerOverlord);
      body.classList.toggle("story-dialogue-body-left", !isBurgerOverlord);
      speaker.innerText = entry.speaker || "";
      startTyping(entry.text || "");
    };

    const cleanup = () => {
      if (done) return;
      done = true;
      stopTyping();
      document.removeEventListener("keydown", onKeyDown);
      overlay.removeEventListener("mousedown", onMouseDown, true);
      bodyEl?.classList.remove("story-dialogue-active");
      if (overlay.isConnected) overlay.remove();
      globalThis.requestImmediatePlayerTurnUiResume?.();
      resolve();
    };

    const advance = () => {
      if (done) return;
      if (!typingComplete) {
        revealAllChars();
        return;
      }

      idx += 1;
      if (idx >= steps.length) {
        cleanup();
        return;
      }

      renderStep();
    };

    const onKeyDown = (e) => {
      if (!isDialogueConfirmKey(e.code)) return;
      e.preventDefault();
      advance();
    };

    const onMouseDown = (e) => {
      e.preventDefault();
      advance();
    };

    renderStep();
    bodyEl?.classList.add("story-dialogue-active");
    document.body.appendChild(overlay);
    document.addEventListener("keydown", onKeyDown);
    overlay.addEventListener("mousedown", onMouseDown, true);
  });
}
