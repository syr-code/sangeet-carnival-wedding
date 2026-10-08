(function () {
  if (window.__sangeetInviteInit) return;
  window.__sangeetInviteInit = true;

  const TARGET = new Date("2026-10-30T20:00:00+05:30").getTime();

  // Initialize your custom audio
  const backgroundPath = new Audio('audio/Path.mp3');
  backgroundPath.loop = true;
  
  // Track if music is currently supposed to be playing
  let isMusicPlaying = false; 

  function init() {
    makePetals();
    startCountdown();
    bindMusic();
    bindStartOver();
    bindSplashScreen();
    handleTabVisibility();
    bindScrollPrompt();
  }

  // --- SPLASH SCREEN LOGIC ---
  function bindSplashScreen() {
    const splash = document.getElementById("splash");
    const splashBtn = document.getElementById("splash-btn");
    if (!splash) return;

    // Lock scrolling while splash screen is visible
    document.body.style.overflow = "hidden";

    function enterInvitation() {
      if (splash.classList.contains("hidden")) return;
      
      // Hide splash and restore scrolling
      splash.classList.add("hidden");
      document.body.style.overflow = "";
      
      // Start music
      playMusic();

      // Show the scroll prompt immediately on the cover page
      const prompt = document.getElementById("scroll-prompt");
      if (prompt) prompt.classList.remove("hidden");
    }

    // Only enter via button click
    if (splashBtn) {
      splashBtn.addEventListener("click", enterInvitation);
    }
  }

  // --- TAB VISIBILITY LOGIC (Stops audio when leaving site) ---
  function handleTabVisibility() {
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        // Tab is hidden, pause audio
        backgroundPath.pause();
      } else {
        // Tab is active again, resume audio ONLY IF it was playing before
        if (isMusicPlaying) {
          backgroundPath.play().catch(() => {});
        }
      }
    });
  }

  // --- MUSIC CONTROLS ---
  function playMusic() {
    const btn = document.querySelector("[data-music]");
    backgroundPath.play().then(() => {
      isMusicPlaying = true;
      if (btn) {
        btn.classList.add("is-on");
        btn.setAttribute("aria-pressed", "true");
        btn.setAttribute("aria-label", "Mute invitation music");
      }
    }).catch((err) => {
      console.warn("Autoplay blocked by browser.", err);
    });
  }

  function bindMusic() {
    const btn = document.querySelector("[data-music]");
    if (!btn) return;

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (isMusicPlaying) {
        // Mute
        backgroundPath.pause();
        isMusicPlaying = false;
        btn.classList.remove("is-on");
        btn.setAttribute("aria-pressed", "false");
        btn.setAttribute("aria-label", "Play invitation music");
      } else {
        // Play
        playMusic();
      }
    });
  }

  // --- VISUAL & COUNTDOWN FUNCTIONS ---
  function makePetals() {
    const root = document.querySelector("[data-petals]");
    if (!root || root.childElementCount) return;
    for (let i = 0; i < 16; i += 1) {
      const el = document.createElement("span");
      el.className = "petal";
      el.style.left = `${(i * 19 + 7) % 94}%`;
      el.style.setProperty("--delay", `${(i * 0.85) % 11}s`);
      el.style.setProperty("--dur", `${10 + (i % 6)}s`);
      el.style.setProperty("--drift", `${i % 2 === 0 ? 28 : -22}px`);
      el.style.transform = `scale(${0.7 + (i % 5) * 0.12})`;
      root.appendChild(el);
    }
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function renderCountdown() {
    const remain = Math.max(0, TARGET - Date.now());
    const days = Math.floor(remain / 86_400_000);
    const hours = Math.floor((remain % 86_400_000) / 3_600_000);
    const minutes = Math.floor((remain % 3_600_000) / 60_000);
    const seconds = Math.floor((remain % 60_000) / 1000);
    const set = (unit, value) => {
      const node = document.querySelector(`[data-unit="${unit}"]`);
      if (node) node.textContent = pad(value);
    };
    set("days", days);
    set("hours", hours);
    set("minutes", minutes);
    set("seconds", seconds);
  }

  // --- INACTIVITY SCROLL PROMPT ---
  function bindScrollPrompt() {
    const prompt = document.getElementById("scroll-prompt");
    if (!prompt) return;

    let scrollTimeout;

    function showPrompt() {
      // Don't show the prompt if they've reached the very bottom of the invite
      const isAtBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100;
      
      // Also don't show it if the splash screen is still visible
      const splash = document.getElementById("splash");
      const isSplashVisible = splash && !splash.classList.contains("hidden");

      if (!isAtBottom && !isSplashVisible) {
        prompt.classList.remove("hidden");
      }
    }

    // Hide prompt immediately when they start scrolling
    window.addEventListener("scroll", () => {
      prompt.classList.add("hidden");
      
      // Reset the 5-second timer
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(showPrompt, 5000);
    });
  }

  function startCountdown() {
    renderCountdown();
    window.setInterval(renderCountdown, 1000);
  }

  function bindStartOver() {
    const btn = document.querySelector("[data-start-over]");
    if (!btn) return;
    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();