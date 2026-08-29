(function(){
  "use strict";

  var VERSION = "pms_v252_real_save_price_confirmations_fix";
  var STYLE_ID = "pms-v252-real-save-style";
  var BUTTON_ID = "pms252-real-save-button";
  var STATUS_ID = "pms252-real-save-status";
  var saveTimer = null;
  var saveQueue = Promise.resolve();

  function now(){ return new Date().toISOString(); }
  function storageKey(){ return typeof STORAGE_KEY !== "undefined" ? STORAGE_KEY : "parmitalia_management_state_v1"; }
  function getState(){
    try {
      if (typeof state !== "undefined" && state && typeof state === "object") {
        window.state = state;
        return state;
      }
    } catch (_) {}
    window.state = window.state && typeof window.state === "object" ? window.state : {};
    return window.state;
  }
  function setState(data){
    window.state = data && typeof data === "object" ? data : {};
    try { if (typeof state !== "undefined") state = window.state; } catch (_) {}
    return window.state;
  }
  function countRecords(data){
    var keys = [
      "orders", "offers", "products", "contacts", "documents", "payments",
      "contracts", "contractTemplates", "tasks", "communications",
      "officialCommunications", "supplierPriceConfirmations", "priceHistory",
      "companyFleet", "foreignRecruiting", "foreignEmployees"
    ];
    return keys.reduce(function(total, key){
      return total + (Array.isArray(data && data[key]) ? data[key].length : 0);
    }, 0);
  }
  function safeJson(data){
    try { return JSON.stringify(data || {}); }
    catch (error) {
      console.warn(VERSION + " json failed", error);
      return "";
    }
  }
  function mark(reason){
    var data = getState();
    data._pmsAutosave = Object.assign({}, data._pmsAutosave || {}, {
      version: VERSION,
      updatedAt: now(),
      reason: reason || "manual-real-save",
      records: countRecords(data)
    });
    return setState(data);
  }
  function localSave(data){
    var json = safeJson(data);
    if (!json) return false;
    try { localStorage.setItem(storageKey(), json); } catch (error) { console.warn(VERSION + " local save failed", error); }
    try { localStorage.setItem("parmitalia_desktop_state_latest", json); } catch (_) {}
    try { localStorage.setItem("parmitalia_management_state_latest", json); } catch (_) {}
    try { localStorage.setItem("pms_real_save_latest", json); } catch (_) {}
    return true;
  }
  async function desktopSave(data){
    if (!window.parmitaliaStorage || typeof window.parmitaliaStorage.save !== "function") {
      return { ok: false, skipped: true, reason: "desktop-storage-missing" };
    }
    return window.parmitaliaStorage.save(data);
  }
  function setButtonState(text, busy){
    var button = document.getElementById(BUTTON_ID);
    if (button) {
      button.textContent = text || "Salva reale";
      button.disabled = !!busy;
      button.classList.toggle("saving", !!busy);
    }
  }
  function showStatus(text, kind){
    var node = document.getElementById(STATUS_ID);
    if (!node) {
      node = document.createElement("div");
      node.id = STATUS_ID;
      document.body.appendChild(node);
    }
    node.textContent = text;
    node.dataset.kind = kind || "ok";
    node.classList.add("visible");
    clearTimeout(node._timer);
    node._timer = setTimeout(function(){ node.classList.remove("visible"); }, 3200);
  }
  async function saveNow(reason, options){
    options = options || {};
    saveQueue = saveQueue.catch(function(){}).then(async function(){
      var data = mark(reason || "real-save");
      localSave(data);
      if (!options.silent) setButtonState("Salvataggio...", true);
      try {
        var result = await desktopSave(data);
        if (!options.silent) {
          if (result && result.ok === false && result.skipped) {
            showStatus("Salvato nel browser. Storage desktop non disponibile.", "warn");
          } else {
            showStatus("Salvataggio reale completato: " + countRecords(data) + " record.", "ok");
          }
          setButtonState("Salva reale", false);
        }
        return result || { ok: true };
      } catch (error) {
        console.warn(VERSION + " desktop save failed", error);
        if (!options.silent) {
          showStatus("Salvato nel browser. Errore backup desktop: " + String(error && error.message || error), "error");
          setButtonState("Salva reale", false);
        }
        return { ok: false, error: String(error && error.message || error) };
      }
    });
    return saveQueue;
  }
  function scheduleSave(reason){
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function(){
      saveTimer = null;
      saveNow(reason || "scheduled", { silent: true });
    }, 650);
  }
  function css(){
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      "#" + BUTTON_ID + "{position:fixed;right:16px;bottom:16px;z-index:2147483400;border:0;border-radius:7px;background:#14532d;color:#fff;padding:11px 15px;font:800 13px Arial,sans-serif;box-shadow:0 12px 34px rgba(15,23,42,.26);cursor:pointer;min-width:116px}",
      "#" + BUTTON_ID + ":hover{background:#166534}",
      "#" + BUTTON_ID + ".saving{background:#475569;cursor:wait}",
      "#" + BUTTON_ID + ":disabled{opacity:.8}",
      "#" + STATUS_ID + "{position:fixed;right:16px;bottom:64px;z-index:2147483400;max-width:min(440px,calc(100vw - 32px));padding:10px 12px;border-radius:7px;background:#102a43;color:#fff;font:800 12px Arial,sans-serif;box-shadow:0 12px 34px rgba(15,23,42,.24);opacity:0;transform:translateY(8px);pointer-events:none;transition:opacity .15s ease,transform .15s ease}",
      "#" + STATUS_ID + ".visible{opacity:1;transform:translateY(0)}",
      "#" + STATUS_ID + "[data-kind='warn']{background:#854d0e}",
      "#" + STATUS_ID + "[data-kind='error']{background:#991b1b}",
      "@media print{#" + BUTTON_ID + ",#" + STATUS_ID + "{display:none!important}}"
    ].join("\n");
    document.head.appendChild(style);
  }
  function installButton(){
    css();
    if (document.getElementById(BUTTON_ID)) return;
    var button = document.createElement("button");
    button.id = BUTTON_ID;
    button.type = "button";
    button.textContent = "Salva reale";
    button.title = "Salva subito tutti i dati nel browser e nello storage desktop con backup.";
    button.addEventListener("click", function(event){
      event.preventDefault();
      event.stopPropagation();
      saveNow("manual-real-save");
    });
    document.body.appendChild(button);
  }
  function wrapGlobalSave(){
    var base = null;
    try { if (typeof save === "function") base = save; } catch (_) {}
    if (base && base.__pms252Wrapped) return;
    var wrapped = function(){
      var ok = true;
      try {
        if (base) ok = base.apply(this, arguments);
        else localSave(getState());
      } catch (error) {
        console.warn(VERSION + " base save failed", error);
        ok = false;
      }
      scheduleSave("global-save-wrapper");
      return ok;
    };
    wrapped.__pms252Wrapped = true;
    try { save = wrapped; } catch (_) {}
    window.save = wrapped;
  }
  function installAutoSaveHooks(){
    document.addEventListener("change", function(){ scheduleSave("change"); }, true);
    document.addEventListener("submit", function(){ saveNow("form-submit", { silent: true }); }, true);
    document.addEventListener("click", function(event){
      var target = event.target && event.target.closest && event.target.closest("button,[data-add],[data-edit],[data-delete],[data-save-settings]");
      if (target && target.id !== BUTTON_ID) scheduleSave("action-click");
    }, true);
    window.addEventListener("blur", function(){ saveNow("window-blur", { silent: true }); });
    window.addEventListener("beforeunload", function(){ saveNow("beforeunload", { silent: true }); });
  }
  function install(){
    try {
      installButton();
      wrapGlobalSave();
      installAutoSaveHooks();
      window.PMS_V252_REAL_SAVE = {
        version: VERSION,
        saveNow: saveNow,
        scheduleSave: scheduleSave,
        records: function(){ return countRecords(getState()); }
      };
      console.info(VERSION + " loaded");
    } catch (error) {
      console.warn(VERSION + " install failed", error);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})();
