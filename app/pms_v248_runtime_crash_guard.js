(function(){
  "use strict";

  var VERSION = "pms_v248_runtime_crash_guard";
  if (window.PMS_V248_RUNTIME_CRASH_GUARD) return;

  var nativeSetTimeout = window.setTimeout.bind(window);
  var nativeClearTimeout = window.clearTimeout.bind(window);
  var nativeSetInterval = window.setInterval.bind(window);
  var nativeClearInterval = window.clearInterval.bind(window);
  var lastErrors = [];
  var renderQueued = false;
  var renderRunning = false;
  var lastRenderAt = 0;
  var saveTimer = 0;

  function now(){ return Date.now ? Date.now() : new Date().getTime(); }
  function text(value){ return String(value == null ? "" : value); }
  function shortError(error){
    if (!error) return "Errore non specificato";
    return text(error.message || error.reason && error.reason.message || error.reason || error).slice(0, 500);
  }
  function recordError(source, error){
    var item = { at: new Date().toISOString(), source: source || "runtime", message: shortError(error) };
    lastErrors.push(item);
    if (lastErrors.length > 25) lastErrors.shift();
    try { console.warn("Parmitalia stabilita:", item.source, item.message); } catch (_) {}
    return item;
  }
  function injectCss(){
    if (document.getElementById("pms-v248-runtime-crash-guard-style")) return;
    var style = document.createElement("style");
    style.id = "pms-v248-runtime-crash-guard-style";
    style.textContent = [
      "#pms248-stability-notice{position:fixed;right:14px;bottom:14px;z-index:2147483647;max-width:min(520px,calc(100vw - 28px));background:#111827;color:#fff;border-radius:8px;padding:10px 12px;box-shadow:0 14px 38px rgba(15,23,42,.32);font:12px/1.35 Arial,Helvetica,sans-serif}",
      "#pms248-stability-notice strong{display:block;margin-bottom:2px;color:#fff}",
      "#pms248-stability-notice button{margin-top:8px;border:0;border-radius:6px;background:#fff;color:#111827;padding:6px 8px;font-weight:700;cursor:pointer}",
      "html.pms248-stable-mode *,html.pms248-stable-mode *::before,html.pms248-stable-mode *::after{animation-duration:.001s!important;animation-iteration-count:1!important;scroll-behavior:auto!important}",
      "html.pms248-stable-mode .pms144-globe,html.pms248-stable-mode .pms106-globe,html.pms248-stable-mode .pms109-world,html.pms248-stable-mode .pms210-earth,html.pms248-stable-mode .pms170-earth{display:none!important}",
      "#print-root{contain:layout style!important}"
    ].join("\n");
    document.head.appendChild(style);
  }
  function showNotice(message){
    injectCss();
    var existing = document.getElementById("pms248-stability-notice");
    if (existing) existing.remove();
    var box = document.createElement("div");
    box.id = "pms248-stability-notice";
    box.innerHTML = "<strong>Gestionale stabilizzato</strong><div></div><button type=\"button\">Torna alla dashboard</button>";
    box.querySelector("div").textContent = message || "Ho bloccato un errore interno per evitare la chiusura dell'app.";
    box.querySelector("button").onclick = function(){
      try { safeDashboard(); } catch (_) {}
      box.remove();
    };
    document.body.appendChild(box);
    nativeSetTimeout(function(){ try { box.remove(); } catch (_) {} }, 9000);
  }
  function safeCall(name, fn, self, args, fallback){
    try {
      return fn && fn.apply ? fn.apply(self || window, args || []) : fallback;
    } catch (error) {
      recordError(name, error);
      document.documentElement.classList.add("pms248-stable-mode");
      showNotice("Errore bloccato in " + name + ". L'app resta aperta.");
      return fallback;
    }
  }
  function safeDashboard(){
    try {
      if (window.current && typeof current === "object") current.page = "dashboard";
    } catch (_) {}
    if (typeof window.render === "function") window.render();
  }
  function installGlobalErrorGuard(){
    window.addEventListener("error", function(event){
      recordError("window.error", event.error || event.message);
      document.documentElement.classList.add("pms248-stable-mode");
      if (event && typeof event.preventDefault === "function") event.preventDefault();
      return true;
    }, true);
    window.addEventListener("unhandledrejection", function(event){
      recordError("promise", event.reason);
      document.documentElement.classList.add("pms248-stable-mode");
      if (event && typeof event.preventDefault === "function") event.preventDefault();
      return true;
    }, true);
  }
  function installTimerGuard(){
    window.setTimeout = function(handler, delay){
      var args = Array.prototype.slice.call(arguments, 2);
      var ms = Number(delay || 0);
      if (ms > 0 && ms < 16) ms = 16;
      return nativeSetTimeout(function(){
        if (typeof handler === "function") return safeCall("timer", handler, window, args);
        return safeCall("timer-string", function(){ return new Function(text(handler))(); }, window, []);
      }, ms);
    };
    window.clearTimeout = function(id){ return nativeClearTimeout(id); };
    window.setInterval = function(handler, delay){
      var args = Array.prototype.slice.call(arguments, 2);
      var ms = Number(delay || 0);
      if (ms > 0 && ms < 5000) ms = 5000;
      return nativeSetInterval(function(){
        if (typeof handler === "function") return safeCall("interval", handler, window, args);
        return safeCall("interval-string", function(){ return new Function(text(handler))(); }, window, []);
      }, ms || delay);
    };
    window.clearInterval = function(id){ return nativeClearInterval(id); };
  }
  function wrapNamed(name, options){
    var original = window[name];
    if (typeof original !== "function" || original.__pms248Guarded) return;
    var wait = options && options.wait || 0;
    var fallback = options && Object.prototype.hasOwnProperty.call(options, "fallback") ? options.fallback : undefined;
    var wrapped = function(){
      var self = this;
      var args = arguments;
      if (name === "render") {
        var t = now();
        if (renderRunning) {
          renderQueued = true;
          return fallback;
        }
        if (t - lastRenderAt < wait) {
          if (!renderQueued) {
            renderQueued = true;
            nativeSetTimeout(function(){
              renderQueued = false;
              wrapped.apply(self, args);
            }, wait);
          }
          return fallback;
        }
        renderRunning = true;
        lastRenderAt = t;
        try {
          return safeCall(name, original, self, args, fallback);
        } finally {
          renderRunning = false;
          if (renderQueued) {
            renderQueued = false;
            nativeSetTimeout(function(){ wrapped.apply(self, args); }, wait);
          }
        }
      }
      return safeCall(name, original, self, args, fallback);
    };
    wrapped.__pms248Guarded = true;
    wrapped.__pms248Original = original;
    window[name] = wrapped;
    try { eval(name + " = window[name]"); } catch (_) {}
  }
  function installSaveDebounce(){
    var original = window.save;
    if (typeof original !== "function" || original.__pms248Debounced) return;
    var wrapped = function(){
      var self = this;
      var args = arguments;
      nativeClearTimeout(saveTimer);
      saveTimer = nativeSetTimeout(function(){
        safeCall("save", original, self, args);
      }, 350);
      return true;
    };
    wrapped.__pms248Debounced = true;
    wrapped.__pms248Original = original;
    window.save = wrapped;
    try { save = wrapped; } catch (_) {}
  }
  function installDomSafety(){
    document.addEventListener("click", function(event){
      var target = event.target && event.target.closest ? event.target.closest("button,[data-nav],[data-page],a,input,select,textarea") : null;
      if (!target) return;
      if (target.dataset && target.dataset.pms248Busy === "1") {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (target.tagName === "BUTTON" || target.hasAttribute("data-nav") || target.hasAttribute("data-page")) {
        if (target.dataset) target.dataset.pms248Busy = "1";
        nativeSetTimeout(function(){ try { if (target.dataset) delete target.dataset.pms248Busy; } catch (_) {} }, 550);
      }
    }, true);
    nativeSetInterval(function(){
      safeCall("dom-cleanup", function(){
        document.querySelectorAll("#print-root").forEach(function(node, index){ if (index > 0) node.remove(); });
        var root = document.getElementById("print-root");
        if (root && root.dataset && !root.dataset.pms248SeenAt) root.dataset.pms248SeenAt = String(now());
        if (root && root.dataset && now() - Number(root.dataset.pms248SeenAt || 0) > 20000) root.remove();
      }, window, []);
    }, 10000);
  }
  function installGuards(){
    wrapNamed("render", { wait: 280 });
    wrapNamed("renderNav", { wait: 500 });
    wrapNamed("bindPageActions", { wait: 200 });
    wrapNamed("openModal", { wait: 200 });
    wrapNamed("closeModal", { wait: 100 });
    wrapNamed("setPage", { wait: 250 });
    wrapNamed("openPrint", { wait: 300 });
    installSaveDebounce();
  }
  function validateCurrentPage(){
    safeCall("validate-page", function(){
      if (!window.current || !current.page) return;
      if (!Array.isArray(window.modules)) return;
      var ok = modules.some(function(item){ return item && item.id === current.page; }) || current.page === "dashboard";
      if (!ok) current.page = "dashboard";
    }, window, []);
  }
  function install(){
    injectCss();
    installGlobalErrorGuard();
    installTimerGuard();
    installDomSafety();
    installGuards();
    validateCurrentPage();
    nativeSetTimeout(installGuards, 500);
    nativeSetTimeout(installGuards, 1500);
    nativeSetTimeout(function(){
      if (typeof window.render === "function") safeCall("initial-stable-render", window.render, window, []);
    }, 250);
    window.PMS_V248_RUNTIME_CRASH_GUARD = {
      version: VERSION,
      errors: lastErrors,
      reinstall: installGuards,
      dashboard: safeDashboard
    };
    console.info(VERSION + " loaded");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})();
