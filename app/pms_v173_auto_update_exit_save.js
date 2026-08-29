(function(){
  "use strict";

  const VERSION = "PMS-V173-AUTO-UPDATE-EXIT-SAVE";
  const SAVE_DEBOUNCE_MS = 700;
  const AUTO_SAVE_MS = 15000;

  let saveTimer = null;
  let saving = null;
  let lastSavedJson = "";
  let hydrated = false;

  function now(){ return new Date().toISOString(); }
  function appState(){
    try {
      if (typeof state !== "undefined" && state && typeof state === "object") {
        window.state = state;
        return state;
      }
    } catch(error) {}
    window.state = window.state || {};
    return window.state;
  }
  function storageKey(){ return typeof STORAGE_KEY !== "undefined" ? STORAGE_KEY : "parmitalia_management_state_v1"; }
  function normalize(data){
    try {
      if (typeof normalizeState === "function") return normalizeState(data);
    } catch(error) {
      console.warn(VERSION + " normalize failed", error);
    }
    return data || {};
  }
  function payloadData(payload){
    if (!payload) return null;
    if (payload.data && typeof payload.data === "object") return payload.data;
    return payload;
  }
  function stampOf(data){
    return String(data && data._pmsAutosave && data._pmsAutosave.updatedAt || "");
  }
  function safeJson(data){
    try { return JSON.stringify(data || {}); } catch(error) { console.warn(VERSION + " JSON failed", error); return ""; }
  }
  function localSave(data){
    try {
      localStorage.setItem(storageKey(), JSON.stringify(data));
      return true;
    } catch(error) {
      console.warn(VERSION + " localStorage save failed", error);
      return false;
    }
  }
  function markState(reason){
    const data = appState();
    data._pmsAutosave = Object.assign({}, data._pmsAutosave || {}, {
      version: VERSION,
      updatedAt: now(),
      reason: reason || "auto"
    });
    return data;
  }
  async function desktopSave(data){
    if (!window.parmitaliaStorage || typeof window.parmitaliaStorage.save !== "function") return { ok:false, skipped:true };
    return window.parmitaliaStorage.save(data);
  }
  async function saveNow(reason){
    const data = markState(reason || "manual");
    const json = safeJson(data);
    localSave(data);
    if (window.PMS_V195_HARDENED_AUTOSAVE && typeof window.PMS_V195_HARDENED_AUTOSAVE.saveNow === "function" && reason !== "v195-delegate") {
      return window.PMS_V195_HARDENED_AUTOSAVE.saveNow("v195-delegate");
    }
    if (!json || json === lastSavedJson && reason !== "electron-close" && reason !== "beforeunload") return { ok:true, unchanged:true };
    lastSavedJson = json;
    saving = desktopSave(data).catch(function(error){
      console.warn(VERSION + " desktop save failed", error);
      return { ok:false, error:String(error && error.message || error) };
    });
    return saving;
  }
  function scheduleSave(reason){
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(function(){ saveTimer = null; saveNow(reason || "debounced"); }, SAVE_DEBOUNCE_MS);
  }
  async function hydrateFromDesktop(){
    if (hydrated) return;
    hydrated = true;
    if (!window.parmitaliaStorage || typeof window.parmitaliaStorage.load !== "function") return;
    try {
      const saved = await window.parmitaliaStorage.load();
      const remote = payloadData(saved);
      if (!remote || typeof remote !== "object") return;
      const current = appState();
      const remoteStamp = stampOf(remote);
      const currentStamp = stampOf(current);
      const currentLooksEmpty = !currentStamp && safeJson(current).length < 5000;
      if (currentLooksEmpty || remoteStamp && (!currentStamp || remoteStamp > currentStamp)) {
        window.state = normalize(remote);
        localSave(window.state);
        if (typeof renderNav === "function") renderNav();
        if (typeof render === "function") render();
      }
    } catch(error) {
      console.warn(VERSION + " desktop load failed", error);
    }
  }
  function wrapSave(){
    if (typeof window.save !== "function" || window.save.__pms173Wrapped) return;
    const base = window.save;
    window.save = function(){
      const result = base.apply(this, arguments);
      scheduleSave("save-wrapper");
      return result;
    };
    window.save.__pms173Wrapped = true;
    try { save = window.save; } catch(error) {}
  }
  function installListeners(){
    document.addEventListener("input", function(){ scheduleSave("input"); }, true);
    document.addEventListener("change", function(){ scheduleSave("change"); }, true);
    document.addEventListener("click", function(event){
      if (event.target && event.target.closest && event.target.closest("button,[data-nav],select,input,textarea")) scheduleSave("click");
    }, true);
    window.addEventListener("blur", function(){ saveNow("window-blur"); });
    window.addEventListener("pagehide", function(){ saveNow("pagehide"); });
    window.addEventListener("beforeunload", function(){ saveNow("beforeunload"); });
    document.addEventListener("visibilitychange", function(){ if (document.visibilityState === "hidden") saveNow("hidden"); });
    setInterval(function(){ saveNow("interval"); }, AUTO_SAVE_MS);
  }
  function install(){
    wrapSave();
    hydrateFromDesktop().finally(function(){ saveNow("startup"); });
    installListeners();
    window.PMS_V173_AUTO_SAVE_UPDATE = {
      version: VERSION,
      saveNow: saveNow,
      scheduleSave: scheduleSave,
      hydrateFromDesktop: hydrateFromDesktop
    };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();
})();
