(function(){
  "use strict";

  var VERSION = "pms_v245_remove_foreign_desktop_admin_modules";
  var HIDDEN = {
    foreignEmployees: true,
    foreignRecruiting: true,
    desktopCloudApp: true,
    desktopRoadmap: true,
    admin: true
  };
  var HIDDEN_IDS = Object.keys(HIDDEN);
  var STYLE_ID = "pms-v245-remove-foreign-desktop-admin-style";
  var MENU_TEXT = /(dipendenti\s+estero|recruiting\s+estero|app(?:licazione)?\s+desktop|app\s+desktop(?:\s+windows\s*\/\s*macos)?|piano\s+(?:applicazione\s+)?desktop|roadmap|gestione\s+utenti\s+e\s+ruoli)/i;
  var SETTINGS_TEXT = /(utenti\s+e\s+password|gestione\s+utenti|ruoli\s+e\s+permessi|login\s+reale,\s*ruoli|nuovo\s+utente)/i;
  var DESKTOP_TEXT = /(app\s+locale\s+windows|parmitalia\s+per\s+windows|versione\s+installabile|pacchetto\s+desktop|installer\s+nsis|roadmap\s+tecnica|windows\s+\/\s+outlook)/i;

  function arr(value){ return Array.isArray(value) ? value : []; }
  function clean(value){ return String(value == null ? "" : value).replace(/\s+/g, " ").trim(); }
  function isHidden(id){ return !!HIDDEN[clean(id)]; }
  function getTarget(node){
    if (!node || !node.getAttribute) return "";
    return clean(node.getAttribute("data-page") || node.getAttribute("data-nav") || node.getAttribute("data-pms227-page") || node.getAttribute("data-pms231-page") || node.getAttribute("value"));
  }
  function removeNode(node){
    if (node && node.parentNode) node.parentNode.removeChild(node);
  }
  function removeFromModules(){
    try {
      if (Array.isArray(window.modules)) {
        window.modules = window.modules.filter(function(module){ return module && !isHidden(module.id); });
      }
    } catch(error) {}
    try {
      if (Array.isArray(modules)) {
        for (var index = modules.length - 1; index >= 0; index -= 1) {
          if (modules[index] && isHidden(modules[index].id)) modules.splice(index, 1);
        }
      }
    } catch(error) {}
  }
  function redirectIfNeeded(){
    try {
      if (window.current && isHidden(current.page)) current.page = "dashboard";
    } catch(error) {}
  }
  function injectCss(){
    var style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = HIDDEN_IDS.map(function(id){
      return [
        '[data-page="' + id + '"]',
        '[data-nav="' + id + '"]',
        '[data-pms227-page="' + id + '"]',
        '[data-pms231-page="' + id + '"]',
        'option[value="' + id + '"]'
      ].join(",");
    }).join(",") + "{display:none!important;visibility:hidden!important}";
  }
  function cleanupTargets(){
    document.querySelectorAll("[data-page],[data-nav],[data-pms227-page],[data-pms231-page],option[value]").forEach(function(node){
      if (isHidden(getTarget(node))) removeNode(node);
    });
  }
  function cleanupMenuText(){
    document.querySelectorAll("button,a,[role='button'],.nav-button,.menu-item,.sidebar button,.sidebar a").forEach(function(node){
      var label = clean(node.textContent || node.getAttribute("aria-label") || node.title || "");
      if (MENU_TEXT.test(label)) removeNode(node);
    });
  }
  function cleanupSettingsUsers(){
    var content = document.getElementById("content");
    if (!content) return;
    var page = "";
    try { page = current && current.page; } catch(error) {}
    if (page && page !== "settings") return;
    content.querySelectorAll(".section-header,.card,.table-wrap,.database-note").forEach(function(node){
      var text = clean(node.textContent);
      if (!SETTINGS_TEXT.test(text)) return;
      var header = node.classList && node.classList.contains("section-header") ? node : node.closest(".card,.table-wrap,.database-note,.section-header") || node;
      if (header.classList && header.classList.contains("section-header")) {
        var next = header.nextElementSibling;
        while (next && !(next.classList && next.classList.contains("section-header"))) {
          var toRemove = next;
          next = next.nextElementSibling;
          if (SETTINGS_TEXT.test(clean(toRemove.textContent)) || toRemove.classList.contains("database-note") || toRemove.classList.contains("table-wrap")) removeNode(toRemove);
          else break;
        }
      }
      removeNode(header);
    });
  }
  function cleanupDesktopPanels(){
    var content = document.getElementById("content");
    if (!content) return;
    content.querySelectorAll(".card,.pms85-page,.pms85-panel").forEach(function(node){
      var text = clean(node.textContent);
      if (!DESKTOP_TEXT.test(text)) return;
      removeNode(node.closest(".card,.pms85-page,.pms85-panel") || node);
    });
  }
  function cleanup(){
    injectCss();
    removeFromModules();
    redirectIfNeeded();
    cleanupTargets();
    cleanupMenuText();
    cleanupSettingsUsers();
    cleanupDesktopPanels();
  }
  function wrapSetPage(){
    if (typeof window.setPage !== "function" || window.setPage.__pms245Wrapped) return;
    var base = window.setPage;
    var wrapped = function(page){
      if (isHidden(page)) page = "dashboard";
      var result = base.apply(this, arguments.length ? [page] : arguments);
      setTimeout(cleanup, 0);
      return result;
    };
    wrapped.__pms245Wrapped = true;
    window.setPage = wrapped;
    try { setPage = wrapped; } catch(error) {}
  }
  function wrapRender(){
    if (typeof window.render === "function" && !window.render.__pms245Wrapped) {
      var renderBase = window.render;
      var renderWrapped = function(){
        redirectIfNeeded();
        var result = renderBase.apply(this, arguments);
        setTimeout(cleanup, 0);
        return result;
      };
      renderWrapped.__pms245Wrapped = true;
      window.render = renderWrapped;
      try { render = renderWrapped; } catch(error) {}
    }
    if (typeof window.renderNav === "function" && !window.renderNav.__pms245Wrapped) {
      var navBase = window.renderNav;
      var navWrapped = function(){
        var result = navBase.apply(this, arguments);
        setTimeout(cleanup, 0);
        return result;
      };
      navWrapped.__pms245Wrapped = true;
      window.renderNav = navWrapped;
      try { renderNav = navWrapped; } catch(error) {}
    }
  }
  function installClickGuard(){
    if (window.__pms245ClickGuard) return;
    window.__pms245ClickGuard = true;
    document.addEventListener("click", function(event){
      var node = event.target && event.target.closest && event.target.closest("[data-page],[data-nav],[data-pms227-page],[data-pms231-page]");
      if (!node || !isHidden(getTarget(node))) return;
      event.preventDefault();
      event.stopPropagation();
      try {
        if (typeof window.setPage === "function") window.setPage("dashboard");
        else if (window.current) {
          current.page = "dashboard";
          if (typeof window.render === "function") window.render();
        }
      } catch(error) {}
      setTimeout(cleanup, 0);
    }, true);
  }
  function install(){
    removeFromModules();
    redirectIfNeeded();
    wrapSetPage();
    wrapRender();
    installClickGuard();
    cleanup();
    [80, 250, 700, 1500, 3000].forEach(function(ms){ setTimeout(cleanup, ms); });
    window.PMS_V245_REMOVE_FOREIGN_DESKTOP_ADMIN_MODULES = {
      version: VERSION,
      hiddenModules: HIDDEN_IDS.slice(),
      cleanup: cleanup
    };
    console.info(VERSION + " loaded");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})();
