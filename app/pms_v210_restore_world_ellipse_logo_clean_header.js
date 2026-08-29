(function(){
  "use strict";

  var VERSION = "pms_v210_restore_world_ellipse_logo_clean_header";
  var LOGO = "assets/parmitalia_logo_background.jpeg";

  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(char){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char];
    });
  }
  function logoUrl(){
    try {
      if (window.state && state.settings && state.settings.logoUrl) return String(state.settings.logoUrl);
    } catch(error) {}
    return LOGO;
  }
  function ensureWorld(){
    var sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;
    var banner = document.getElementById("pms210-world-ellipse-logo");
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "pms210-world-ellipse-logo";
      banner.setAttribute("aria-label", "Parmitalia mondo");
    }
    banner.innerHTML = [
      '<div class="pms210-world">',
        '<div class="pms210-earth" aria-hidden="true">',
          '<span class="pms210-land pms210-land-a"></span>',
          '<span class="pms210-land pms210-land-b"></span>',
          '<span class="pms210-land pms210-land-c"></span>',
          '<span class="pms210-grid pms210-grid-a"></span>',
          '<span class="pms210-grid pms210-grid-b"></span>',
        '</div>',
        '<div class="pms210-ellipse pms210-ellipse-a" aria-hidden="true"></div>',
        '<div class="pms210-ellipse pms210-ellipse-b" aria-hidden="true"></div>',
        '<div class="pms210-logo-ellipse"><img src="' + esc(logoUrl()) + '" alt="Parmitalia Distribution"></div>',
      '</div>'
    ].join("");

    var old = document.getElementById("pms170-top-globe");
    var menu = document.getElementById("pms165-top-menu") || document.getElementById("pms143-menu") || document.getElementById("nav");
    if (old && old.parentElement === sidebar) sidebar.insertBefore(banner, old);
    else if (menu && menu.parentElement === sidebar) sidebar.insertBefore(banner, menu);
    else if (!banner.parentElement) sidebar.insertBefore(banner, sidebar.firstChild);
  }
  function hideOldBrandNoise(){
    var selectors = [
      ".sidebar-brand", ".brand-mark", "#pms170-top-globe", "#pms144-world-banner", ".pms144-world-banner",
      ".pms144-sign", ".pms106-hub", ".pms106-globe-label", ".pms106-wheel", ".pms109-world",
      ".pms109-hub", "#pms109-hub", ".pms113-led-sign", ".pms150-sign"
    ];
    document.querySelectorAll(selectors.join(",")).forEach(function(node){
      if (node.closest("#pms210-world-ellipse-logo")) return;
      node.setAttribute("data-pms210-hidden-noise", "1");
      node.setAttribute("aria-hidden", "true");
    });
    document.querySelectorAll(".sidebar *,.topbar *").forEach(function(node){
      if (node.closest("#pms210-world-ellipse-logo") || node.closest("#pms165-top-menu") || node.closest("#nav") || node.id === "logout-button") return;
      if (node.matches("button,select,input,textarea,a") || node.closest("button,select,input,textarea,a")) return;
      var text = String(node.textContent || "").replace(/\s+/g, "").trim();
      var style = window.getComputedStyle ? window.getComputedStyle(node) : null;
      var color = style ? String(style.color || "") : "";
      var blueish = /rgb\((\s*(0|1?\d?\d|2[0-4]\d|25[0-5])\s*,\s*(40|5\d|6\d|7\d|8\d|9\d|1[0-8]\d)\s*,\s*(90|1\d\d|2[0-5]\d)\s*)\)/.test(color);
      if (/^[A-Z]{2,6}$/.test(text) && (blueish || text === "ACLE" || text === "AEA")) {
        node.setAttribute("data-pms210-hidden-noise", "1");
        node.setAttribute("aria-hidden", "true");
      }
    });
  }
  function css(){
    var style = document.getElementById("pms-v210-world-ellipse-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v210-world-ellipse-style";
      document.head.appendChild(style);
    }
    style.textContent = [
      '[data-pms210-hidden-noise="1"]{display:none!important;visibility:hidden!important;width:0!important;height:0!important;min-width:0!important;min-height:0!important;max-width:0!important;max-height:0!important;margin:0!important;padding:0!important;border:0!important;overflow:hidden!important;opacity:0!important;pointer-events:none!important}',
      '#pms210-world-ellipse-logo{display:grid!important;place-items:center!important;width:100%!important;min-width:112px!important;min-height:118px!important;margin:0 0 8px!important;padding:8px 6px!important;border-radius:8px!important;border:1px solid rgba(20,113,63,.22)!important;background:linear-gradient(90deg,rgba(0,146,70,.10),rgba(255,255,255,.95),rgba(206,43,55,.09))!important;box-shadow:0 8px 22px rgba(15,35,56,.10)!important;overflow:visible!important}',
      '#pms210-world-ellipse-logo .pms210-world{position:relative!important;width:116px!important;height:92px!important;display:grid!important;place-items:center!important;overflow:visible!important}',
      '#pms210-world-ellipse-logo .pms210-earth{position:absolute!important;left:50%!important;top:50%!important;width:70px!important;height:70px!important;margin:-35px 0 0 -35px!important;border-radius:999px!important;overflow:hidden!important;background:radial-gradient(circle at 30% 22%,#ffffff 0 7%,transparent 8%),radial-gradient(circle at 35% 32%,#8fd2e6 0,#4aa3c5 42%,#1f6f9b 100%)!important;border:1px solid rgba(31,111,155,.42)!important;box-shadow:0 0 0 1px rgba(255,255,255,.85),0 12px 26px rgba(31,78,120,.22),inset -11px -13px 18px rgba(8,40,66,.26),inset 9px 8px 15px rgba(255,255,255,.25)!important;animation:pms210-earth-turn 18s linear infinite!important}',
      '#pms210-world-ellipse-logo .pms210-land{position:absolute!important;display:block!important;background:linear-gradient(135deg,#87bd70,#3f7c4d)!important;border-radius:55% 44% 57% 41%!important;box-shadow:inset -2px -2px 4px rgba(20,74,42,.22)!important}',
      '#pms210-world-ellipse-logo .pms210-land-a{width:20px!important;height:24px!important;left:15px!important;top:17px!important;transform:rotate(17deg)!important}',
      '#pms210-world-ellipse-logo .pms210-land-b{width:24px!important;height:17px!important;left:36px!important;top:17px!important;transform:rotate(-14deg)!important}',
      '#pms210-world-ellipse-logo .pms210-land-c{width:18px!important;height:22px!important;left:40px!important;top:42px!important;transform:rotate(24deg)!important}',
      '#pms210-world-ellipse-logo .pms210-grid{position:absolute!important;pointer-events:none!important;border:1px solid rgba(255,255,255,.27)!important;border-radius:999px!important}',
      '#pms210-world-ellipse-logo .pms210-grid-a{left:4px!important;right:4px!important;top:25px!important;height:16px!important;border-left:0!important;border-right:0!important}',
      '#pms210-world-ellipse-logo .pms210-grid-b{top:5px!important;bottom:5px!important;left:15px!important;width:40px!important;border-top:0!important;border-bottom:0!important;transform:rotate(18deg)!important}',
      '#pms210-world-ellipse-logo .pms210-ellipse{position:absolute!important;left:50%!important;top:50%!important;width:108px!important;height:42px!important;margin:-21px 0 0 -54px!important;border-radius:999px!important;border:2px solid rgba(255,255,255,.72)!important;box-shadow:0 0 0 1px rgba(20,113,63,.18),0 0 22px rgba(20,113,63,.18)!important;pointer-events:none!important}',
      '#pms210-world-ellipse-logo .pms210-ellipse-a{transform:rotate(-17deg)!important;border-top-color:rgba(0,146,70,.72)!important;border-right-color:rgba(255,255,255,.74)!important;border-bottom-color:rgba(206,43,55,.72)!important;border-left-color:rgba(255,255,255,.52)!important}',
      '#pms210-world-ellipse-logo .pms210-ellipse-b{width:112px!important;height:36px!important;margin:-18px 0 0 -56px!important;transform:rotate(22deg)!important;border-color:rgba(31,78,120,.24)!important;box-shadow:none!important}',
      '#pms210-world-ellipse-logo .pms210-logo-ellipse{position:absolute!important;left:50%!important;top:50%!important;width:72px!important;height:28px!important;margin:-14px 0 0 -36px!important;display:grid!important;place-items:center!important;border-radius:999px!important;overflow:hidden!important;background:#fff!important;border:2px solid rgba(255,255,255,.95)!important;box-shadow:0 6px 18px rgba(15,35,56,.22),0 0 0 1px rgba(20,113,63,.18)!important;z-index:4!important}',
      '#pms210-world-ellipse-logo .pms210-logo-ellipse img{display:block!important;width:100%!important;height:100%!important;object-fit:cover!important;object-position:center!important;filter:saturate(.98) contrast(1.02)!important}',
      'body.pms165-fixed-top-menu #pms210-world-ellipse-logo{flex:0 0 132px!important;width:132px!important;min-height:64px!important;max-height:64px!important;margin:0 6px 0 0!important;padding:4px!important;border-radius:8px!important}',
      'body.pms165-fixed-top-menu #pms210-world-ellipse-logo .pms210-world{width:92px!important;height:56px!important}',
      'body.pms165-fixed-top-menu #pms210-world-ellipse-logo .pms210-earth{width:48px!important;height:48px!important;margin:-24px 0 0 -24px!important}',
      'body.pms165-fixed-top-menu #pms210-world-ellipse-logo .pms210-ellipse{width:82px!important;height:30px!important;margin:-15px 0 0 -41px!important}',
      'body.pms165-fixed-top-menu #pms210-world-ellipse-logo .pms210-logo-ellipse{width:58px!important;height:22px!important;margin:-11px 0 0 -29px!important}',
      '@keyframes pms210-earth-turn{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}'
    ].join("\n");
  }
  function refresh(){
    css();
    ensureWorld();
    hideOldBrandNoise();
  }
  function wrap(){
    if (typeof render === "function" && !render.__pms210WorldWrapped) {
      var baseRender = render;
      render = function(){
        var result = baseRender.apply(this, arguments);
        setTimeout(refresh, 30);
        setTimeout(refresh, 220);
        return result;
      };
      render.__pms210WorldWrapped = true;
      try { window.render = render; } catch(error) {}
    }
    if (typeof renderNav === "function" && !renderNav.__pms210WorldWrapped) {
      var baseNav = renderNav;
      renderNav = function(){
        var result = baseNav.apply(this, arguments);
        setTimeout(refresh, 30);
        setTimeout(refresh, 220);
        return result;
      };
      renderNav.__pms210WorldWrapped = true;
      try { window.renderNav = renderNav; } catch(error) {}
    }
  }
  function boot(){
    wrap();
    refresh();
    [80, 240, 700, 1400].forEach(function(ms){ setTimeout(refresh, ms); });
    setInterval(refresh, 1800);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  window.PMS_V210_RESTORE_WORLD_ELLIPSE_LOGO_CLEAN_HEADER = {version:VERSION, refresh:refresh};
})();
