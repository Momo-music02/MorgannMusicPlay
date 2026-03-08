(() => {
  const KEY = "mmcp_playback_v1";
  const path = (window.location.pathname || "").toLowerCase();
  if (path.endsWith("/index.html") || path === "/" || path.endsWith("/")) return;

  let state = null;
  try {
    state = JSON.parse(localStorage.getItem(KEY) || "null");
  } catch {
    state = null;
  }

  if (!state || !state.audioUrl) return;

  const audio = new Audio();
  audio.preload = "auto";
  audio.src = state.audioUrl;
  window.__mmcpBackgroundAudio = audio;

  let saveTimer = null;

  function saveState() {
    const next = {
      ...state,
      audioUrl: audio.currentSrc || state.audioUrl,
      currentTime: Number.isFinite(audio.currentTime) ? audio.currentTime : (Number(state.currentTime) || 0),
      isPlaying: !audio.paused,
      savedAt: Date.now()
    };
    state = next;
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  }

  function scheduleSave() {
    if (saveTimer) return;
    saveTimer = setTimeout(() => {
      saveTimer = null;
      saveState();
    }, 350);
  }

  audio.addEventListener("timeupdate", scheduleSave);
  audio.addEventListener("play", saveState);
  audio.addEventListener("pause", saveState);
  audio.addEventListener("ended", saveState);

  window.addEventListener("pagehide", saveState);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) saveState();
  });

  audio.addEventListener("loadedmetadata", () => {
    const seekTo = Number(state.currentTime || 0);
    if (Number.isFinite(seekTo) && seekTo > 0) {
      try {
        audio.currentTime = seekTo;
      } catch {}
    }

    if (state.isPlaying) {
      audio.play().catch(() => {});
    }
  });
})();
