import { scaleDeltaMs, scaleDuration } from "./timing.js";

function replaceSkillKeyLabel(text, keyLabel) {
  return String(text || "").replaceAll("SPACE", String(keyLabel || "").toLowerCase());
}

function setSkillHintContent(skillHint, { hintText = "", hintHtml = "" } = {}, keyLabel) {
  if (!skillHint) return;
  if (hintHtml) {
    skillHint.innerHTML = replaceSkillKeyLabel(hintHtml, keyLabel);
    return;
  }
  skillHint.innerText = replaceSkillKeyLabel(hintText, keyLabel);
}

function setSkillMarkers(skillMarkers, markerFractions = []) {
  if (!skillMarkers) return;
  const markers = Array.isArray(markerFractions)
    ? markerFractions.filter((value) => Number.isFinite(value) && value > 0 && value < 1)
    : [];
  skillMarkers.innerHTML = markers
    .map((value) => `<div class="skill-marker" style="left:${(value * 100).toFixed(2)}%"></div>`)
    .join("");
}

export function startSkillCheck(callback, options = {}) {
  let active = true;
  let chargePercent = 0;
  let direction = 1;
  let isHolding = false;
  let holdStartedAt = 0;
  let lastFrameTime = performance.now();

  const skillCheck = document.getElementById("skillCheck");
  const skillFill = document.getElementById("skillFill");
  const skillWindowGreen = document.getElementById("skillWindow");
  const skillWindowYellow = document.getElementById("skillWindowYellow");
  const skillWindowRed = document.getElementById("skillWindowRed");
  const skillMarkers = document.getElementById("skillMarkers");
  const skillHint = document.getElementById("skillHint");
  const inputTimeoutMs = scaleDuration(options.inputTimeoutMs ?? 3000);
  const maxHoldMs = scaleDuration(options.maxHoldMs ?? 15000);
  const inputDeadline = performance.now() + inputTimeoutMs;
  const greenWidth = options.greenWidth ?? 0.25;
  const yellowExtra = options.yellowExtra ?? 0.12;
  const yellowEnabled = options.yellowEnabled ?? false;
  const redExtra = options.redExtra ?? 0.18;
  const redEnabled = options.redEnabled ?? false;
  const innerRedEnabled = options.innerRedEnabled ?? false;
  const innerRedWidth = Math.max(0.01, Math.min(greenWidth, options.innerRedWidth ?? Math.max(0.02, greenWidth * 0.3)));
  const innerRedReason = options.innerRedReason ?? "red";
  const acceptedKeys = Array.isArray(options.acceptedKeys) && options.acceptedKeys.length
    ? options.acceptedKeys
    : ["Space"];
  const acceptedKeySet = new Set(acceptedKeys);
  const keyLabel = acceptedKeys.includes("Enter") && !acceptedKeys.includes("Space") ? "ENTER" : "SPACE";
  const hintText = options.hintText ?? `Release SPACE on green for bonus!`;
  const hintHtml = options.hintHtml ?? "";
  const holdFillDurationMs = scaleDuration(options.holdFillDurationMs ?? 900);

  if (!skillFill || !skillWindowGreen) {
    callback(false, 0, "missing_ui");
    return;
  }

  if (skillCheck) skillCheck.classList.remove("hidden");
  skillFill.style.width = "0%";
  setSkillMarkers(skillMarkers, []);
  setSkillHintContent(skillHint, { hintText, hintHtml }, keyLabel);

  const greenStart = Math.random() * (1 - greenWidth);
  const greenEnd = greenStart + greenWidth;
  const yellowStart = Math.max(0, greenStart - yellowExtra);
  const yellowEnd = Math.min(1, greenEnd + yellowExtra);
  const redBaseStart = yellowEnabled ? yellowStart : greenStart;
  const redBaseEnd = yellowEnabled ? yellowEnd : greenEnd;
  const outerRedStart = Math.max(0, redBaseStart - redExtra);
  const outerRedEnd = Math.min(1, redBaseEnd + redExtra);
  const innerRedStart = greenStart + Math.max(0, (greenWidth - innerRedWidth) * 0.5);
  const innerRedEnd = Math.min(greenEnd, innerRedStart + innerRedWidth);

  skillWindowGreen.style.display = greenWidth > 0 ? "block" : "none";
  skillWindowGreen.style.left = (greenStart * 100) + "%";
  skillWindowGreen.style.width = ((greenEnd - greenStart) * 100) + "%";

  if (skillWindowYellow) {
    skillWindowYellow.style.display = yellowEnabled ? "block" : "none";
    if (yellowEnabled) {
      skillWindowYellow.style.left = (yellowStart * 100) + "%";
      skillWindowYellow.style.width = ((yellowEnd - yellowStart) * 100) + "%";
    }
  }

  if (skillWindowRed) {
    skillWindowRed.style.display = redEnabled || innerRedEnabled ? "block" : "none";
    if (redEnabled || innerRedEnabled) {
      const activeRedStart = innerRedEnabled ? innerRedStart : outerRedStart;
      const activeRedEnd = innerRedEnabled ? innerRedEnd : outerRedEnd;
      skillWindowRed.style.left = (activeRedStart * 100) + "%";
      skillWindowRed.style.width = ((activeRedEnd - activeRedStart) * 100) + "%";
    }
  }

  function finish(success, reason) {
    if (!active) return;
    active = false;

    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("keyup", onKeyUp);
    if (skillCheck) skillCheck.classList.add("hidden");

    callback(success, chargePercent, reason);
  }

  function chargeLoop(now) {
    if (!active) return;
    const dt = scaleDeltaMs(now - lastFrameTime);
    lastFrameTime = now;

    if (!isHolding && now >= inputDeadline) {
      finish(false, "timeout");
      return;
    }

    if (isHolding) {
      chargePercent += direction * (dt / Math.max(1, holdFillDurationMs));
      if (chargePercent >= 1) {
        chargePercent = 1;
        direction = -1;
      } else if (chargePercent <= 0) {
        chargePercent = 0;
        direction = 1;
      }

      skillFill.style.width = (chargePercent * 100) + "%";

      if (now - holdStartedAt >= maxHoldMs) {
        finish(false, "overhold");
        return;
      }
    }

    requestAnimationFrame(chargeLoop);
  }

  function onKeyDown(e) {
    if (!acceptedKeySet.has(e.code)) return;
    e.preventDefault();
    if (!active) return;
    if (!isHolding) {
      isHolding = true;
      holdStartedAt = performance.now();
    }
  }

  function onKeyUp(e) {
    if (acceptedKeySet.has(e.code) && active && isHolding) {
      isHolding = false;
      const inGreen = chargePercent >= greenStart && chargePercent <= greenEnd;
      const inInnerRed = innerRedEnabled &&
        chargePercent >= innerRedStart &&
        chargePercent <= innerRedEnd;
      const inYellow = yellowEnabled &&
        chargePercent >= yellowStart &&
        chargePercent <= yellowEnd;
      const inRed = redEnabled &&
        chargePercent >= outerRedStart &&
        chargePercent <= outerRedEnd;

      if (inInnerRed) {
        finish(true, innerRedReason);
      } else if (inGreen) {
        finish(true, "green");
      } else if (inYellow) {
        finish(false, "yellow");
      } else if (inRed) {
        finish(false, "red");
      } else {
        finish(false, "miss");
      }
      return;
    }
    if (acceptedKeySet.has(e.code)) e.preventDefault();
  }

  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);

  requestAnimationFrame(chargeLoop);
}

export function startMashSkillCheck(callback, options = {}) {
  let active = true;
  let chargePercent = 0;
  let lastFrameTime = performance.now();
  const startedAt = performance.now();

  const skillCheck = document.getElementById("skillCheck");
  const skillFill = document.getElementById("skillFill");
  const skillWindowGreen = document.getElementById("skillWindow");
  const skillWindowYellow = document.getElementById("skillWindowYellow");
  const skillWindowRed = document.getElementById("skillWindowRed");
  const skillMarkers = document.getElementById("skillMarkers");
  const skillHint = document.getElementById("skillHint");

  const durationMs = scaleDuration(options.durationMs ?? 3000);
  const pressGain = options.pressGain ?? 0.08;
  const decayPerSecond = options.decayPerSecond ?? 0.23;
  const completeOnFull = options.completeOnFull ?? false;
  const acceptedKeys = Array.isArray(options.acceptedKeys) && options.acceptedKeys.length
    ? options.acceptedKeys
    : ["Space"];
  const acceptedKeySet = new Set(acceptedKeys);
  const keyLabel = acceptedKeys.includes("Enter") && !acceptedKeys.includes("Space") ? "ENTER" : "SPACE";
  const hintText = options.hintText ?? `Mash SPACE for bonus!`;
  const hintHtml = options.hintHtml ?? "";
  const markerFractions = options.markerFractions ?? [];

  if (!skillFill) {
    callback(false, 0, "missing_ui");
    return;
  }

  if (skillCheck) skillCheck.classList.remove("hidden");
  skillFill.style.width = "0%";
  setSkillMarkers(skillMarkers, markerFractions);
  setSkillHintContent(skillHint, { hintText, hintHtml }, keyLabel);
  if (skillWindowGreen) skillWindowGreen.style.display = "none";
  if (skillWindowYellow) skillWindowYellow.style.display = "none";
  if (skillWindowRed) skillWindowRed.style.display = "none";

  function finish(success, reason) {
    if (!active) return;
    active = false;
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("keyup", onKeyUp);
    if (skillCheck) skillCheck.classList.add("hidden");

    if (skillWindowGreen) skillWindowGreen.style.display = "block";
    if (skillWindowYellow) skillWindowYellow.style.display = "block";
    if (skillWindowRed) skillWindowRed.style.display = "block";

    callback(success, chargePercent, reason);
  }

  function loop(now) {
    if (!active) return;
    const dt = scaleDeltaMs(now - lastFrameTime) / 1000;
    lastFrameTime = now;

    chargePercent = Math.max(0, chargePercent - decayPerSecond * dt);
    skillFill.style.width = `${Math.round(chargePercent * 100)}%`;

    if (now - startedAt >= durationMs) {
      finish(true, "complete");
      return;
    }

    requestAnimationFrame(loop);
  }

  function onKeyDown(e) {
    if (!acceptedKeySet.has(e.code)) return;
    e.preventDefault();
    if (!active) return;
    if (e.repeat) return;
    chargePercent = Math.min(1, chargePercent + pressGain);
    skillFill.style.width = `${Math.round(chargePercent * 100)}%`;
    if (completeOnFull && chargePercent >= 1) {
      finish(true, "full");
    }
  }

  function onKeyUp(e) {
    if (acceptedKeySet.has(e.code)) e.preventDefault();
  }

  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);
  requestAnimationFrame(loop);
}
