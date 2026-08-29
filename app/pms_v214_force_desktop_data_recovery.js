(function(){
  "use strict";

  var VERSION = "pms_v214_force_desktop_data_recovery";
  var KEYS = [
    "orders", "offers", "products", "contacts", "intermediations", "trattativeInCorso",
    "documents", "payments", "contracts", "contractTemplates", "tasks", "accountant",
    "agents", "communications", "foreignEmployees", "foreignRecruiting", "priceHistory",
    "supplierPriceConfirmations", "operationalAgenda", "companyFleet"
  ];

  function arr(value){ return Array.isArray(value) ? value : []; }
  function getState(){
    try {
      if (typeof state !== "undefined" && state && typeof state === "object") return state;
    } catch(error) {}
    window.state = window.state || {};
    return window.state;
  }
  function setState(data){
    var next = data && typeof data === "object" ? data : {};
    try {
      if (typeof normalizeState === "function") next = normalizeState(next);
    } catch(error) {}
    try { state = next; } catch(error) {}
    window.state = next;
    return next;
  }
  function count(data){
    return KEYS.reduce(function(total, key){
      return total + arr(data && data[key]).length;
    }, 0);
  }
  function ordersCount(data){ return arr(data && data.orders).length; }
  function storageKey(){
    try { if (typeof STORAGE_KEY !== "undefined") return STORAGE_KEY; } catch(error) {}
    return "parmitalia_management_system_v4_database_print";
  }
  function saveLocal(data){
    try { localStorage.setItem(storageKey(), JSON.stringify(data)); } catch(error) {}
    ["parmitalia_desktop_state_latest","parmitalia_management_state_latest","pms_hardened_autosave_latest"].forEach(function(key){
      try { localStorage.setItem(key, JSON.stringify(data)); } catch(error) {}
    });
  }
  function renderAgain(){
    try { if (typeof renderNav === "function") renderNav(); } catch(error) {}
    try { if (typeof render === "function") render(); } catch(error) {}
  }
  async function recover(){
    if (!window.parmitaliaStorage || typeof window.parmitaliaStorage.load !== "function") return;
    try {
      var desktop = await window.parmitaliaStorage.load();
      if (!desktop || typeof desktop !== "object") return;
      var current = getState();
      var desktopOrders = ordersCount(desktop);
      var currentOrders = ordersCount(current);
      var desktopCount = count(desktop);
      var currentCount = count(current);
      if (desktopOrders > currentOrders || desktopCount >= currentCount + 2) {
        var restored = setState(desktop);
        saveLocal(restored);
        renderAgain();
        setTimeout(renderAgain, 120);
        try {
          if (typeof save === "function") save();
          else if (window.parmitaliaStorage.save) window.parmitaliaStorage.save(restored);
        } catch(error) {}
        console.info(VERSION + " restored desktop data", {
          orders: desktopOrders,
          records: desktopCount
        });
      }
    } catch(error) {
      console.warn(VERSION + " failed", error);
    }
  }
  function boot(){
    recover();
    setTimeout(recover, 500);
    setTimeout(recover, 1800);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  window.PMS_V214_FORCE_DESKTOP_DATA_RECOVERY = {version: VERSION, recover: recover};
})();
