(function () {
  "use strict";

  if (window.PMS_V200_GLOBAL_STABILITY_FREEZE) return;
  window.PMS_V200_GLOBAL_STABILITY_FREEZE = { version: "v200-global-stability-freeze" };

  var nativeSetInterval = window.__pmsNativeSetInterval || window.setInterval.bind(window);
  var nativeClearInterval = window.__pmsNativeClearInterval || window.clearInterval.bind(window);
  var nativeSetTimeout = window.setTimeout.bind(window);
  window.__pmsNativeSetInterval = nativeSetInterval;
  window.__pmsNativeClearInterval = nativeClearInterval;

  function clearExistingIntervals() {
    var marker = nativeSetInterval(function () {}, 600000);
    for (var id = 1; id <= marker; id += 1) {
      try { nativeClearInterval(id); } catch (_) {}
    }
    try { nativeClearInterval(marker); } catch (_) {}
  }

  function looksCosmeticLoop(handler) {
    var text = "";
    try { text = Function.prototype.toString.call(handler || ""); } catch (_) {}
    return /render|renderNav|decorate|afterRender|refresh|enforce|clean|ensureMenu|bindCalendars|normalizeMenu|activate|world|globe|sidebar|calendar/i.test(text);
  }

  function installIntervalGuard() {
    window.setInterval = function (handler, delay) {
      var ms = Number(delay || 0);
      var args = Array.prototype.slice.call(arguments, 2);
      if (ms > 0 && ms < 30000 && looksCosmeticLoop(handler)) {
        return 0;
      }
      if (ms > 0 && ms < 10000) ms = 10000;
      return nativeSetInterval(function () {
        try {
          if (typeof handler === "function") return handler.apply(window, args);
          return new Function(String(handler))();
        } catch (error) {
          console.warn("Parmitalia: timer bloccato per stabilita", error);
        }
      }, ms || delay);
    };
    window.clearInterval = function (id) {
      if (!id) return;
      return nativeClearInterval(id);
    };
  }

  function installStableCss() {
    if (document.getElementById("pms200-global-stability-style")) return;
    var style = document.createElement("style");
    style.id = "pms200-global-stability-style";
    style.textContent = `
      html.pms200-global-stable, html.pms200-global-stable body{scroll-behavior:auto!important}
      .sidebar{overflow-y:auto!important;overflow-x:hidden!important;contain:layout style!important}
      #nav,.nav,.menu,.sidebar nav{transform:none!important;animation:none!important}
      .nav-button,.menu-item,[data-nav]{animation:none!important;transition:background-color .12s ease,color .12s ease,border-color .12s ease!important}
      #content{overflow-anchor:none!important;min-height:calc(100vh - 92px)!important}
      #pms210-world-ellipse-logo,#pms170-top-globe,.pms170-top-globe,#pms144-world-banner,.pms144-world-banner,
      .pms144-globe-wrap,.pms144-globe,.pms144-sign,#pms109-hub,.pms109-hub,.pms109-world,.pms109-world-label,
      .pms109-logo-orbit,.pms109-logo-sat,.pms113-led-sign,#pms106-hub,.pms106-hub,.pms106-globe,
      .pms106-globe-label,.pms106-globe-core,.pms106-wheel,.pms120-fallback-globe,.pms120-fallback-hub,.pms150-sign,
      .sidebar .pms100-code,.sidebar .pms52-nav-code,.sidebar .nav-button::before{display:none!important}
      .pms200-stable-hidden-letter{display:none!important}
    `;
    document.head.appendChild(style);
    document.documentElement.classList.add("pms200-global-stable");
  }

  function preserveViewport(fn) {
    var x = window.scrollX || 0;
    var y = window.scrollY || 0;
    var content = document.getElementById("content");
    var cx = content ? content.scrollLeft : 0;
    var cy = content ? content.scrollTop : 0;
    var result = fn();
    nativeSetTimeout(function () {
      try { window.scrollTo(x, y); } catch (_) {}
      if (content && document.body.contains(content)) {
        try { content.scrollLeft = cx; content.scrollTop = cy; } catch (_) {}
      }
    }, 0);
    return result;
  }

  function wrapRender(name, wait) {
    var original = window[name];
    if (typeof original !== "function" || original.__pms200GlobalStable) return;
    var running = false;
    var scheduled = false;
    var last = 0;
    var wrapped = function () {
      var self = this;
      var args = arguments;
      var now = Date.now();
      if (running) {
        scheduled = true;
        return;
      }
      if (now - last < wait) {
        if (!scheduled) {
          scheduled = true;
          nativeSetTimeout(function () {
            scheduled = false;
            wrapped.apply(self, args);
          }, wait);
        }
        return;
      }
      running = true;
      last = now;
      try {
        return preserveViewport(function () { return original.apply(self, args); });
      } finally {
        running = false;
      }
    };
    wrapped.__pms200GlobalStable = true;
    window[name] = wrapped;
    try { eval(name + " = window[name]"); } catch (_) {}
  }

  function cleanMenuOnce() {
    [
      "#pms210-world-ellipse-logo", "#pms170-top-globe", ".pms170-top-globe",
      "#pms144-world-banner", ".pms144-world-banner", ".pms144-globe-wrap",
      ".pms144-globe", ".pms144-sign", "#pms109-hub", ".pms109-hub",
      ".pms109-world", ".pms109-world-label", ".pms109-logo-orbit",
      ".pms109-logo-sat", ".pms113-led-sign", "#pms106-hub", ".pms106-hub",
      ".pms106-globe", ".pms106-globe-label", ".pms106-globe-core",
      ".pms106-wheel", ".pms120-fallback-globe", ".pms120-fallback-hub",
      ".pms150-sign", ".sidebar .pms100-code", ".sidebar .pms52-nav-code"
    ].forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (node) {
        try { node.remove(); } catch (_) { node.classList.add("pms200-stable-hidden-letter"); }
      });
    });
  }

  function saveQuietly(reason) {
    try {
      if (window.PMS_V195_HARDENED_AUTOSAVE && typeof window.PMS_V195_HARDENED_AUTOSAVE.saveNow === "function") {
        window.PMS_V195_HARDENED_AUTOSAVE.saveNow(reason || "global-stability");
        return;
      }
      if (window.PMS_V173_AUTO_SAVE_UPDATE && typeof window.PMS_V173_AUTO_SAVE_UPDATE.saveNow === "function") {
        window.PMS_V173_AUTO_SAVE_UPDATE.saveNow(reason || "global-stability");
        return;
      }
      if (typeof window.save === "function") window.save();
    } catch (error) {
      console.warn("Parmitalia: autosalvataggio stabile non completato", error);
    }
  }

  function installStableAutosave() {
    ["change", "input", "submit"].forEach(function (eventName) {
      document.addEventListener(eventName, function () {
        window.clearTimeout(window.__pms200StableSaveTimer);
        window.__pms200StableSaveTimer = nativeSetTimeout(function () { saveQuietly(eventName); }, 1200);
      }, true);
    });
    window.addEventListener("beforeunload", function () { saveQuietly("uscita"); });
    window.addEventListener("blur", function () { saveQuietly("pausa"); });
    nativeSetInterval(function () {
      cleanMenuOnce();
    }, 60000);
  }

  function install() {
    clearExistingIntervals();
    installIntervalGuard();
    installStableCss();
    cleanMenuOnce();
    wrapRender("render", 350);
    wrapRender("renderNav", 600);
    installStableAutosave();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})();

