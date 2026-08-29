(function(){
  "use strict";

  const VERSION = "pms_v195_hardened_persistent_autosave";
  const SAVE_DEBOUNCE_MS = 900;
  const AUTO_SAVE_MS = 60000;
  const LOCAL_MIRROR_KEYS = [
    "parmitalia_desktop_state_latest",
    "parmitalia_management_state_latest",
    "pms_hardened_autosave_latest"
  ];
  const ARRAY_KEYS = [
    "orders", "offers", "products", "contacts", "intermediations", "documents",
    "payments", "contracts", "contractTemplates", "tasks", "accountant",
    "agents", "communications", "foreignEmployees", "priceHistory",
    "supplierPriceConfirmations", "operationalAgenda", "trattativeInCorso",
    "companyFleet", "foreignRecruiting"
  ];

  let saveTimer = null;
  let saving = null;
  let lastSavedJson = "";
  let lastSavedContentJson = "";
  let hydrated = false;
  let lastToastAt = 0;

  function now(){ return new Date().toISOString(); }
  function key(){ return typeof STORAGE_KEY !== "undefined" ? STORAGE_KEY : "parmitalia_management_state_v1"; }
  function hasLexicalState(){ try { return typeof state !== "undefined" && state && typeof state === "object"; } catch(error) { return false; } }
  function getState(){
    if (hasLexicalState()) return state;
    window.state = window.state || {};
    return window.state;
  }
  function setState(data){
    const normalized = normalize(data);
    try { if (typeof state !== "undefined") state = normalized; } catch(error) {}
    window.state = normalized;
    return normalized;
  }
  function normalize(data){
    try {
      if (typeof normalizeState === "function") return normalizeState(data || {});
    } catch(error) {
      console.warn(VERSION + " normalize failed", error);
    }
    return data || {};
  }
  function countRecords(data){
    if (!data || typeof data !== "object") return 0;
    return ARRAY_KEYS.reduce(function(total, name){
      return total + (Array.isArray(data[name]) ? data[name].length : 0);
    }, 0);
  }
  function stamp(data){ return String(data && data._pmsAutosave && data._pmsAutosave.updatedAt || ""); }
  function safeJson(data){
    try { return JSON.stringify(data || {}); } catch(error) { console.warn(VERSION + " JSON failed", error); return ""; }
  }
  function contentJson(data){
    try { return JSON.stringify(data || {}, function(name, value){ return name === "_pmsAutosave" ? undefined : value; }); }
    catch(error) { console.warn(VERSION + " content JSON failed", error); return ""; }
  }
  function localSave(data){
    const json = safeJson(data);
    if (!json) return false;
    try { localStorage.setItem(key(), json); } catch(error) { console.warn(VERSION + " main localStorage save failed", error); }
    LOCAL_MIRROR_KEYS.forEach(function(name){
      try { localStorage.setItem(name, json); } catch(error) {}
    });
    try {
      localStorage.setItem("pms_hardened_autosave_meta", JSON.stringify({
        version: VERSION,
        updatedAt: now(),
        records: countRecords(data),
        bytes: json.length
      }));
    } catch(error) {}
    return true;
  }
  function localCandidates(){
    const names = [key()].concat(LOCAL_MIRROR_KEYS);
    const out = [];
    names.forEach(function(name){
      try {
        const raw = localStorage.getItem(name);
        if (!raw) return;
        const data = JSON.parse(raw);
        out.push({ source: name, data: data, stamp: stamp(data), records: countRecords(data), bytes: raw.length });
      } catch(error) {}
    });
    return out;
  }
  function better(a, b){
    if (!a) return b;
    if (!b) return a;
    if (Math.abs((a.records || 0) - (b.records || 0)) >= 2) return (a.records || 0) > (b.records || 0) ? a : b;
    if (a.stamp && b.stamp && a.stamp !== b.stamp) return a.stamp > b.stamp ? a : b;
    return (a.bytes || 0) >= (b.bytes || 0) ? a : b;
  }
  function bestLocal(){
    return localCandidates().reduce(function(best, item){ return better(best, item); }, null);
  }
  function mark(reason){
    const data = getState();
    data._pmsAutosave = Object.assign({}, data._pmsAutosave || {}, {
      version: VERSION,
      updatedAt: now(),
      reason: reason || "auto",
      records: countRecords(data)
    });
    window.state = data;
    return data;
  }
  async function desktopLoad(){
    if (!window.parmitaliaStorage || typeof window.parmitaliaStorage.load !== "function") return null;
    return window.parmitaliaStorage.load();
  }
  async function desktopSave(data){
    if (!window.parmitaliaStorage || typeof window.parmitaliaStorage.save !== "function") return { ok:false, skipped:true };
    return window.parmitaliaStorage.save(data);
  }
  async function saveNow(reason){
    const data = mark(reason || "manual");
    const json = safeJson(data);
    const content = contentJson(data);
    localSave(data);
    if (!json) return { ok:false, error:"json-failed" };
    if (
      content &&
      content === lastSavedContentJson &&
      reason !== "electron-close" &&
      reason !== "beforeunload" &&
      reason !== "manual" &&
      reason !== "startup-hardened"
    ) {
      return { ok:true, unchanged:true };
    }
    lastSavedContentJson = content;
    if (json === lastSavedJson && reason !== "electron-close" && reason !== "beforeunload" && reason !== "manual") {
      return { ok:true, unchanged:true };
    }
    lastSavedJson = json;
    saving = desktopSave(data).then(function(result){
      if (result && result.rejected) console.warn(VERSION + " desktop save rejected to protect existing archive", result);
      return result;
    }).catch(function(error){
      console.warn(VERSION + " desktop save failed", error);
      return { ok:false, error:String(error && error.message || error) };
    });
    return saving;
  }
  function scheduleSave(reason){
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(function(){
      saveTimer = null;
      saveNow(reason || "debounced");
    }, SAVE_DEBOUNCE_MS);
  }
  async function hydrate(){
    if (hydrated) return;
    hydrated = true;
    let best = {
      source: "current",
      data: getState(),
      stamp: stamp(getState()),
      records: countRecords(getState()),
      bytes: safeJson(getState()).length
    };
    const local = bestLocal();
    best = better(best, local);
    try {
      const remote = await desktopLoad();
      if (remote && typeof remote === "object") {
        best = better(best, {
          source: "desktop",
          data: remote,
          stamp: stamp(remote),
          records: countRecords(remote),
          bytes: safeJson(remote).length
        });
      }
    } catch(error) {
      console.warn(VERSION + " desktop load failed", error);
    }
    if (best && best.data && best.source !== "current") {
      setState(best.data);
      localSave(getState());
      if (typeof renderNav === "function") renderNav();
      if (typeof render === "function") render();
      showStatus("Archivio ripristinato da " + best.source + " (" + (best.records || 0) + " record)");
    }
    saveNow("startup-hardened");
  }
  function wrapGlobalSave(){
    if (typeof save !== "function" || save.__pms195Wrapped) return;
    const base = save;
    const wrapped = function(){
      const result = base.apply(this, arguments);
      scheduleSave("save-wrapper");
      return result;
    };
    wrapped.__pms195Wrapped = true;
    try { save = wrapped; } catch(error) {}
    window.save = wrapped;
  }
  function wrapSubmitModal(){
    if (typeof submitModal !== "function" || submitModal.__pms195Wrapped) return;
    const base = submitModal;
    const wrapped = function(){
      const result = base.apply(this, arguments);
      setTimeout(function(){ saveNow("submit-modal"); }, 40);
      return result;
    };
    wrapped.__pms195Wrapped = true;
    try { submitModal = wrapped; } catch(error) {}
  }
  function showStatus(text){
    const time = Date.now();
    if (time - lastToastAt < 1200) return;
    lastToastAt = time;
    let node = document.getElementById("pms195-autosave-status");
    if (!node) {
      node = document.createElement("div");
      node.id = "pms195-autosave-status";
      document.body.appendChild(node);
    }
    node.textContent = text;
    node.classList.add("visible");
    clearTimeout(node._pms195Timer);
    node._pms195Timer = setTimeout(function(){ node.classList.remove("visible"); }, 2600);
  }
  function css(){
    if (document.getElementById("pms-v195-autosave-style")) return;
    const style = document.createElement("style");
    style.id = "pms-v195-autosave-style";
    style.textContent = `
      #pms195-autosave-status{
        position:fixed!important;
        right:16px!important;
        bottom:16px!important;
        z-index:200000!important;
        max-width:min(420px,calc(100vw - 32px))!important;
        padding:10px 13px!important;
        border-radius:7px!important;
        background:rgba(18,53,36,.94)!important;
        color:#fff!important;
        font-size:12px!important;
        font-weight:800!important;
        box-shadow:0 14px 36px rgba(15,23,42,.22)!important;
        opacity:0!important;
        transform:translateY(10px)!important;
        pointer-events:none!important;
        transition:opacity .16s ease,transform .16s ease!important;
      }
      #pms195-autosave-status.visible{opacity:1!important;transform:translateY(0)!important}
    `;
    document.head.appendChild(style);
  }
  function installListeners(){
    ["input", "change", "drop", "dragend", "keyup"].forEach(function(name){
      document.addEventListener(name, function(){ scheduleSave(name); }, true);
    });
    document.addEventListener("click", function(event){
      if (event.target && event.target.closest && event.target.closest("button,[data-add],[data-edit],[data-delete],[data-save-settings],[data-nav],select,input,textarea")) {
        scheduleSave("click");
      }
    }, true);
    document.addEventListener("submit", function(){ saveNow("form-submit"); }, true);
    window.addEventListener("blur", function(){ saveNow("window-blur"); });
    window.addEventListener("pagehide", function(){ saveNow("pagehide"); });
    window.addEventListener("beforeunload", function(){ saveNow("beforeunload"); });
    document.addEventListener("visibilitychange", function(){
      if (document.visibilityState === "hidden") saveNow("hidden");
    });
    setInterval(function(){ saveNow("interval"); }, AUTO_SAVE_MS);
  }
  function install(){
    css();
    wrapGlobalSave();
    wrapSubmitModal();
    installListeners();
    hydrate();
    window.PMS_V195_HARDENED_AUTOSAVE = {
      version: VERSION,
      saveNow: saveNow,
      scheduleSave: scheduleSave,
      hydrate: hydrate,
      records: function(){ return countRecords(getState()); }
    };
    setInterval(function(){
      if (hasLexicalState()) window.state = state;
    }, 1000);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();
})();
