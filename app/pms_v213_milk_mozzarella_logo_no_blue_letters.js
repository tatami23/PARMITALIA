(function(){
  "use strict";

  var VERSION = "pms_v213_milk_mozzarella_logo_no_blue_letters";
  var LOGO_ID = "pms213-milk-mozzarella-logo";
  var STYLE_ID = "pms-v213-milk-mozzarella-logo-style";
  var LETTERS = /^(ACLE|AEA|AE4|AEL|AIA|DB|MKT|OP|BO|CRM|TRT|INT|OFF|ORD|PRD|FRM|LST|TEN|BRK|ANA|PRN|GEO|TRP|FLT|PKG|DOC|ACC|FAT|BNK|PAY|AG|REC|HR|ARO|SIN|LEG|CTR|TPL|SET|ADM|APP|DEV|MOD)$/i;

  function compact(value){
    return String(value == null ? "" : value).replace(/\s+/g, "").trim();
  }

  function isBlueLetterNoise(node){
    if (!node) return false;
    var value = compact(node.textContent || "");
    if (!value) return false;
    if (LETTERS.test(value)) return true;
    if (!/^[A-Z]{2,5}$/.test(value)) return false;
    try {
      var style = window.getComputedStyle(node);
      var color = String(style.color || "");
      var bg = String(style.backgroundColor || "");
      return /rgb\(\s*(0|1?\d?\d)\s*,\s*(40|5\d|6\d|7\d|8\d|9\d|1[0-8]\d)\s*,\s*(90|1\d\d|2[0-5]\d)\s*\)/.test(color + " " + bg) ||
        /pms100-code|pms52-nav-code|pms86-nav-code|brand-mark|code|badge|sigla/i.test(String(node.className || ""));
    } catch(error) {
      return /pms100-code|pms52-nav-code|pms86-nav-code|brand-mark|code|badge|sigla/i.test(String(node.className || ""));
    }
  }

  function hide(node){
    if (!node || node.closest("#" + LOGO_ID)) return;
    node.setAttribute("data-pms213-remove-blue-letters", "1");
    node.setAttribute("aria-hidden", "true");
    if (node.classList && (node.classList.contains("pms100-code") || node.classList.contains("pms52-nav-code") || node.classList.contains("pms86-nav-code"))) node.textContent = "";
  }

  function removeTextNodes(root){
    Array.prototype.slice.call(root.childNodes || []).forEach(function(child){
      if (child.nodeType === 3 && LETTERS.test(compact(child.nodeValue))) child.nodeValue = "";
    });
  }

  function cleanLetters(){
    var selectors = [
      ".pms100-code",
      ".pms52-nav-code",
      ".pms86-nav-code",
      ".brand-mark",
      ".brand-mark.small",
      "[class*='code']",
      "[class*='badge']",
      "[class*='sigla']",
      "#pms208-fleet-launcher span"
    ];
    document.querySelectorAll(selectors.join(",")).forEach(function(node){
      if (node.closest("#" + LOGO_ID)) return;
      if (isBlueLetterNoise(node) || node.matches(".pms100-code,.pms52-nav-code,.pms86-nav-code,.brand-mark,.brand-mark.small")) hide(node);
    });

    document.querySelectorAll(".sidebar *,.topbar *").forEach(function(node){
      if (node.closest("#" + LOGO_ID)) return;
      if (node.matches("input,textarea,select,option")) return;
      removeTextNodes(node);
      if (isBlueLetterNoise(node)) hide(node);
    });
  }

  function hideOldLogos(){
    var selectors = [
      "#pms210-world-ellipse-logo",
      "#pms170-top-globe",
      "#pms144-world-banner",
      "#pms109-hub",
      ".sidebar-brand",
      ".pms106-hub",
      ".pms106-globe",
      ".pms109-hub",
      ".pms109-world",
      ".pms113-led-sign",
      ".pms120-fallback-globe",
      ".pms144-world-banner",
      ".pms150-sign"
    ];
    document.querySelectorAll(selectors.join(",")).forEach(function(node){
      if (node.id === LOGO_ID || node.closest("#" + LOGO_ID)) return;
      node.setAttribute("data-pms213-old-logo-hidden", "1");
      node.setAttribute("aria-hidden", "true");
    });
  }

  function ensureLogo(){
    var host = document.querySelector(".sidebar") || document.querySelector(".topbar") || document.body;
    if (!host) return;

    var logo = document.getElementById(LOGO_ID);
    if (!logo) {
      logo = document.createElement("div");
      logo.id = LOGO_ID;
      logo.setAttribute("role", "img");
      logo.setAttribute("aria-label", "Parmitalia: latte che diventa mozzarella");
      logo.innerHTML = [
        '<div class="pms213-scene">',
          '<div class="pms213-orbit pms213-orbit-a"></div>',
          '<div class="pms213-orbit pms213-orbit-b"></div>',
          '<div class="pms213-pitcher">',
            '<div class="pms213-pitcher-neck"></div>',
            '<div class="pms213-pitcher-body"></div>',
          '</div>',
          '<div class="pms213-stream pms213-stream-a"></div>',
          '<div class="pms213-stream pms213-stream-b"></div>',
          '<div class="pms213-bowl">',
            '<div class="pms213-milk-surface"></div>',
            '<div class="pms213-mozzarella"></div>',
            '<div class="pms213-shine pms213-shine-a"></div>',
            '<div class="pms213-shine pms213-shine-b"></div>',
          '</div>',
        '</div>'
      ].join("");
    }

    var menu = document.getElementById("pms165-top-menu") || document.getElementById("pms143-menu") || document.getElementById("nav");
    if (menu && menu.parentElement) {
      if (logo.parentElement !== menu.parentElement || logo.nextElementSibling !== menu) {
        menu.parentElement.insertBefore(logo, menu);
      }
    } else if (logo.parentElement !== host) {
      host.insertBefore(logo, host.firstChild);
    }
  }

  function css(){
    var style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = [
      'body #nav.pms100-nav .pms100-code,body #nav .pms52-nav-code,body #nav.pms86-nav .pms52-nav-code,body #nav.pms86-nav .pms86-nav-code,body #pms165-top-menu .pms100-code,body #pms165-top-menu .pms52-nav-code,body .sidebar .pms100-code,body .sidebar .pms52-nav-code,body .sidebar .pms86-nav-code,body .topbar .pms100-code,body .topbar .pms52-nav-code,body .topbar .pms86-nav-code,body [data-pms213-remove-blue-letters="1"],body [data-pms213-old-logo-hidden="1"],body .brand-mark,body .brand-mark.small{display:none!important;visibility:hidden!important;width:0!important;height:0!important;min-width:0!important;min-height:0!important;max-width:0!important;max-height:0!important;margin:0!important;padding:0!important;border:0!important;overflow:hidden!important;opacity:0!important;pointer-events:none!important;font-size:0!important;line-height:0!important;color:transparent!important;background:transparent!important;box-shadow:none!important}',
      'body #nav.pms100-nav .nav-button.compact,body #nav .nav-button.compact,body #pms165-top-menu .nav-button.compact{grid-template-columns:minmax(0,1fr)!important;gap:0!important}',
      'body #nav .pms52-nav-label,body #nav .pms86-nav-label{grid-column:1!important}',
      '#nav.pms100-nav .pms100-label,#pms165-top-menu .pms100-label{grid-column:1!important}',
      '#' + LOGO_ID + '{display:grid!important;place-items:center!important;width:100%!important;min-width:126px!important;min-height:116px!important;margin:0 0 8px!important;padding:8px 6px!important;border-radius:8px!important;border:1px solid rgba(20,113,63,.20)!important;background:linear-gradient(90deg,rgba(0,146,70,.08),rgba(255,255,255,.96),rgba(206,43,55,.07))!important;box-shadow:0 9px 22px rgba(15,35,56,.10)!important;overflow:hidden!important;flex:0 0 auto!important}',
      '#' + LOGO_ID + ' *{box-sizing:border-box!important}',
      '#' + LOGO_ID + ' .pms213-scene{position:relative!important;width:132px!important;height:96px!important;overflow:visible!important}',
      '#' + LOGO_ID + ' .pms213-orbit{position:absolute!important;left:50%!important;top:52%!important;border-radius:999px!important;pointer-events:none!important;z-index:1!important}',
      '#' + LOGO_ID + ' .pms213-orbit-a{width:118px!important;height:44px!important;margin:-22px 0 0 -59px!important;border:2px solid rgba(20,113,63,.32)!important;border-top-color:rgba(0,146,70,.66)!important;border-bottom-color:rgba(206,43,55,.58)!important;animation:pms213-orbit-turn 5.8s linear infinite!important}',
      '#' + LOGO_ID + ' .pms213-orbit-b{width:122px!important;height:34px!important;margin:-17px 0 0 -61px!important;border:1px solid rgba(31,78,120,.22)!important;transform:rotate(-22deg)!important;animation:pms213-orbit-counter 7.4s linear infinite!important}',
      '#' + LOGO_ID + ' .pms213-pitcher{position:absolute!important;left:17px!important;top:8px!important;width:47px!important;height:44px!important;transform:rotate(-18deg)!important;transform-origin:42px 40px!important;animation:pms213-pour-tilt 3.2s ease-in-out infinite!important;z-index:5!important}',
      '#' + LOGO_ID + ' .pms213-pitcher-body{position:absolute!important;left:8px!important;top:8px!important;width:31px!important;height:31px!important;border-radius:8px 8px 12px 12px!important;background:linear-gradient(145deg,#ffffff,#dbeafe 52%,#b9d7ef)!important;border:2px solid rgba(31,78,120,.28)!important;box-shadow:inset 5px 4px 8px rgba(255,255,255,.88),0 6px 12px rgba(15,35,56,.14)!important}',
      '#' + LOGO_ID + ' .pms213-pitcher-neck{position:absolute!important;right:0!important;top:10px!important;width:19px!important;height:11px!important;border-radius:12px 12px 4px 4px!important;background:linear-gradient(90deg,#f8fbff,#dbeafe)!important;border:2px solid rgba(31,78,120,.25)!important;border-left:0!important;z-index:2!important}',
      '#' + LOGO_ID + ' .pms213-stream{position:absolute!important;left:62px!important;top:34px!important;width:8px!important;height:42px!important;border-radius:999px!important;background:linear-gradient(180deg,rgba(255,255,255,0),#fff 18%,#f8fbff 72%,rgba(255,255,255,0))!important;filter:drop-shadow(0 3px 5px rgba(31,78,120,.10))!important;transform:rotate(14deg)!important;transform-origin:top center!important;z-index:4!important;animation:pms213-milk-stream 1.15s ease-in-out infinite!important}',
      '#' + LOGO_ID + ' .pms213-stream-b{left:69px!important;top:39px!important;width:4px!important;height:32px!important;opacity:.72!important;animation-delay:.23s!important}',
      '#' + LOGO_ID + ' .pms213-bowl{position:absolute!important;left:43px!important;bottom:8px!important;width:73px!important;height:38px!important;border-radius:9px 9px 27px 27px!important;background:linear-gradient(180deg,#f8fbff,#dbeafe)!important;border:2px solid rgba(31,78,120,.25)!important;box-shadow:0 10px 16px rgba(15,35,56,.16),inset 0 -7px 12px rgba(31,78,120,.10)!important;z-index:3!important;overflow:visible!important}',
      '#' + LOGO_ID + ' .pms213-milk-surface{position:absolute!important;left:7px!important;right:7px!important;top:7px!important;height:11px!important;border-radius:999px!important;background:linear-gradient(90deg,#ffffff,#eef8ff,#ffffff)!important;box-shadow:0 0 9px rgba(255,255,255,.95)!important;animation:pms213-surface 1.45s ease-in-out infinite!important}',
      '#' + LOGO_ID + ' .pms213-mozzarella{position:absolute!important;left:24px!important;top:-13px!important;width:32px!important;height:32px!important;border-radius:999px!important;background:radial-gradient(circle at 30% 24%,#ffffff 0 16%,#fff8ee 42%,#eee3d2 100%)!important;border:1px solid rgba(220,210,190,.82)!important;box-shadow:0 9px 13px rgba(15,35,56,.18),inset -5px -7px 9px rgba(206,190,166,.24),inset 5px 4px 8px rgba(255,255,255,.94)!important;animation:pms213-mozzarella-form 3.2s ease-in-out infinite!important;z-index:4!important}',
      '#' + LOGO_ID + ' .pms213-shine{position:absolute!important;border-radius:999px!important;background:rgba(255,255,255,.92)!important;z-index:6!important;animation:pms213-shine 3.2s ease-in-out infinite!important}',
      '#' + LOGO_ID + ' .pms213-shine-a{left:34px!important;top:-5px!important;width:8px!important;height:4px!important;transform:rotate(-22deg)!important}',
      '#' + LOGO_ID + ' .pms213-shine-b{left:48px!important;top:5px!important;width:5px!important;height:3px!important;transform:rotate(18deg)!important;animation-delay:.18s!important}',
      'body.pms165-fixed-top-menu #' + LOGO_ID + '{width:132px!important;min-width:132px!important;min-height:64px!important;max-height:64px!important;margin:0 6px 0 0!important;padding:2px!important}',
      'body.pms165-fixed-top-menu #' + LOGO_ID + ' .pms213-scene{transform:scale(.72)!important;transform-origin:center!important}',
      '@keyframes pms213-orbit-turn{from{transform:rotate(-16deg)}to{transform:rotate(344deg)}}',
      '@keyframes pms213-orbit-counter{from{transform:rotate(22deg)}to{transform:rotate(-338deg)}}',
      '@keyframes pms213-pour-tilt{0%,100%{transform:rotate(-11deg)}40%,72%{transform:rotate(-28deg)}}',
      '@keyframes pms213-milk-stream{0%,100%{opacity:.38;transform:scaleY(.58) rotate(14deg)}35%,78%{opacity:1;transform:scaleY(1.04) rotate(14deg)}}',
      '@keyframes pms213-surface{0%,100%{transform:scaleX(.90);opacity:.78}45%,76%{transform:scaleX(1.05);opacity:1}}',
      '@keyframes pms213-mozzarella-form{0%{transform:translateY(8px) scale(.76);opacity:.70}38%{transform:translateY(1px) scale(.95);opacity:.95}68%{transform:translateY(-3px) scale(1.05);opacity:1}100%{transform:translateY(8px) scale(.76);opacity:.70}}',
      '@keyframes pms213-shine{0%,100%{opacity:.28;transform:translateY(4px) scale(.8)}50%,72%{opacity:1;transform:translateY(0) scale(1)}}'
    ].join("\n");
  }

  function refresh(){
    css();
    hideOldLogos();
    ensureLogo();
    cleanLetters();
  }

  function wrap(){
    if (typeof render === "function" && !render.__pms213Wrapped) {
      var baseRender = render;
      render = function(){
        var result = baseRender.apply(this, arguments);
        setTimeout(refresh, 20);
        setTimeout(refresh, 180);
        return result;
      };
      render.__pms213Wrapped = true;
      try { window.render = render; } catch(error) {}
    }
    if (typeof renderNav === "function" && !renderNav.__pms213Wrapped) {
      var baseNav = renderNav;
      renderNav = function(){
        var result = baseNav.apply(this, arguments);
        setTimeout(refresh, 20);
        setTimeout(refresh, 180);
        return result;
      };
      renderNav.__pms213Wrapped = true;
      try { window.renderNav = renderNav; } catch(error) {}
    }
  }

  function observe(){
    if (window.__pms213ObserverStarted) return;
    window.__pms213ObserverStarted = true;
    try {
      var observer = new MutationObserver(function(){
        clearTimeout(window.__pms213RefreshTimer);
        window.__pms213RefreshTimer = setTimeout(refresh, 40);
      });
      observer.observe(document.documentElement, {childList:true, subtree:true});
    } catch(error) {}
  }

  function boot(){
    wrap();
    observe();
    refresh();
    [80, 240, 700, 1400, 2600].forEach(function(ms){ setTimeout(refresh, ms); });
    setInterval(refresh, 1800);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  window.PMS_V213_MILK_MOZZARELLA_LOGO_NO_BLUE_LETTERS = {version:VERSION, refresh:refresh};
})();
