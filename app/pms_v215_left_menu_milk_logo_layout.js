(function(){
  "use strict";

  var VERSION = "pms_v215_left_menu_milk_logo_layout";
  var LOGO_ID = "pms213-milk-mozzarella-logo";
  var STYLE_ID = "pms-v215-left-menu-milk-logo-layout-style";

  function ensureLogoMarkup(){
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
          '<div class="pms213-pitcher"><div class="pms213-pitcher-neck"></div><div class="pms213-pitcher-body"></div></div>',
          '<div class="pms213-stream pms213-stream-a"></div>',
          '<div class="pms213-stream pms213-stream-b"></div>',
          '<div class="pms213-bowl"><div class="pms213-milk-surface"></div><div class="pms213-mozzarella"></div><div class="pms213-shine pms213-shine-a"></div><div class="pms213-shine pms213-shine-b"></div></div>',
        '</div>'
      ].join("");
    }
    return logo;
  }

  function moveLogoToLeftMenu(){
    var sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;
    var logo = ensureLogoMarkup();
    if (logo.parentElement !== sidebar || sidebar.firstElementChild !== logo) {
      sidebar.insertBefore(logo, sidebar.firstChild);
    }
  }

  function cleanMenuLetters(){
    document.querySelectorAll([
      "#nav .pms100-code",
      "#nav .pms52-nav-code",
      "#nav .pms86-nav-code",
      "#nav [class*='nav-code']",
      "#nav .nav-button::before",
      "#nav .nav-button::after"
    ].join(",")).forEach(function(node){
      if (!node || node.closest("#" + LOGO_ID)) return;
      node.textContent = "";
      node.setAttribute("aria-hidden", "true");
      node.setAttribute("data-pms215-hidden-code", "1");
    });
    document.querySelectorAll("#nav .nav-button[data-code]").forEach(function(button){
      button.removeAttribute("data-code");
    });
  }

  function css(){
    var style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = [
      'body.pms215-left-milk-menu .app:not(.hidden){display:flex!important;align-items:stretch!important;min-height:100vh!important;width:100%!important;overflow:hidden!important}',
      'body.pms215-left-milk-menu .sidebar{position:sticky!important;top:0!important;left:0!important;width:292px!important;min-width:292px!important;max-width:292px!important;height:100vh!important;min-height:100vh!important;display:flex!important;flex-direction:column!important;gap:10px!important;padding:12px 12px 14px!important;background:linear-gradient(180deg,#102a24 0%,#0f2338 58%,#182b23 100%)!important;color:#fff!important;border:0!important;border-right:1px solid rgba(255,255,255,.12)!important;box-shadow:8px 0 28px rgba(15,23,42,.18)!important;overflow:hidden!important;z-index:40!important}',
      'body.pms215-left-milk-menu .main{flex:1 1 auto!important;min-width:0!important;width:auto!important;max-width:none!important;overflow:auto!important}',
      'body.pms215-left-milk-menu .topbar{position:sticky!important;top:0!important;z-index:25!important;margin:0!important;background:rgba(244,247,251,.94)!important}',
      'body.pms215-left-milk-menu .sidebar-brand,body.pms215-left-milk-menu .brand-mark,body.pms215-left-milk-menu .brand-mark.small,body.pms215-left-milk-menu #pms165-top-menu,body.pms215-left-milk-menu #pms143-menu,body.pms215-left-milk-menu #pms164-menu-wrap,body.pms215-left-milk-menu #pms163-menu-toggle,body.pms215-left-milk-menu #pms144-world-banner,body.pms215-left-milk-menu .pms144-world-banner{display:none!important;visibility:hidden!important;width:0!important;height:0!important;min-width:0!important;max-width:0!important;min-height:0!important;max-height:0!important;margin:0!important;padding:0!important;border:0!important;overflow:hidden!important;opacity:0!important;pointer-events:none!important}',
      'body.pms215-left-milk-menu #' + LOGO_ID + '{order:0!important;display:grid!important;place-items:center!important;flex:0 0 132px!important;width:100%!important;min-width:0!important;height:132px!important;min-height:132px!important;max-height:132px!important;margin:0 0 6px!important;padding:8px!important;border-radius:8px!important;border:1px solid rgba(255,255,255,.18)!important;background:linear-gradient(135deg,rgba(0,146,70,.16),rgba(255,255,255,.96) 52%,rgba(206,43,55,.13))!important;box-shadow:0 12px 26px rgba(0,0,0,.16)!important;overflow:visible!important;opacity:1!important;visibility:visible!important;pointer-events:none!important}',
      'body.pms215-left-milk-menu #' + LOGO_ID + ' .pms213-scene{position:relative!important;width:156px!important;height:112px!important;transform:none!important;overflow:visible!important}',
      'body.pms215-left-milk-menu #' + LOGO_ID + ' .pms213-orbit{position:absolute!important;left:50%!important;top:52%!important;border-radius:999px!important;pointer-events:none!important;z-index:1!important}',
      'body.pms215-left-milk-menu #' + LOGO_ID + ' .pms213-orbit-a{width:140px!important;height:50px!important;margin:-25px 0 0 -70px!important;border:2px solid rgba(20,113,63,.34)!important;border-top-color:rgba(0,146,70,.76)!important;border-bottom-color:rgba(206,43,55,.65)!important;animation:pms213-orbit-turn 5.8s linear infinite!important}',
      'body.pms215-left-milk-menu #' + LOGO_ID + ' .pms213-orbit-b{width:144px!important;height:40px!important;margin:-20px 0 0 -72px!important;border:1px solid rgba(31,78,120,.25)!important;animation:pms213-orbit-counter 7.4s linear infinite!important}',
      'body.pms215-left-milk-menu #' + LOGO_ID + ' .pms213-pitcher{position:absolute!important;left:22px!important;top:11px!important;width:50px!important;height:48px!important;transform-origin:44px 42px!important;animation:pms213-pour-tilt 3.2s ease-in-out infinite!important;z-index:5!important}',
      'body.pms215-left-milk-menu #' + LOGO_ID + ' .pms213-pitcher-body{position:absolute!important;left:8px!important;top:8px!important;width:33px!important;height:33px!important;border-radius:8px 8px 12px 12px!important;background:linear-gradient(145deg,#ffffff,#dbeafe 52%,#b9d7ef)!important;border:2px solid rgba(31,78,120,.28)!important;box-shadow:inset 5px 4px 8px rgba(255,255,255,.88),0 6px 12px rgba(15,35,56,.14)!important}',
      'body.pms215-left-milk-menu #' + LOGO_ID + ' .pms213-pitcher-neck{position:absolute!important;right:0!important;top:11px!important;width:20px!important;height:12px!important;border-radius:12px 12px 4px 4px!important;background:linear-gradient(90deg,#f8fbff,#dbeafe)!important;border:2px solid rgba(31,78,120,.25)!important;border-left:0!important;z-index:2!important}',
      'body.pms215-left-milk-menu #' + LOGO_ID + ' .pms213-stream{position:absolute!important;left:74px!important;top:39px!important;width:8px!important;height:48px!important;border-radius:999px!important;background:linear-gradient(180deg,rgba(255,255,255,0),#fff 18%,#f8fbff 72%,rgba(255,255,255,0))!important;filter:drop-shadow(0 3px 5px rgba(31,78,120,.10))!important;transform:rotate(14deg)!important;transform-origin:top center!important;z-index:4!important;animation:pms213-milk-stream 1.15s ease-in-out infinite!important}',
      'body.pms215-left-milk-menu #' + LOGO_ID + ' .pms213-stream-b{left:82px!important;top:45px!important;width:4px!important;height:36px!important;opacity:.72!important;animation-delay:.23s!important}',
      'body.pms215-left-milk-menu #' + LOGO_ID + ' .pms213-bowl{position:absolute!important;left:54px!important;bottom:10px!important;width:82px!important;height:42px!important;border-radius:9px 9px 28px 28px!important;background:linear-gradient(180deg,#f8fbff,#dbeafe)!important;border:2px solid rgba(31,78,120,.25)!important;box-shadow:0 10px 16px rgba(15,35,56,.16),inset 0 -7px 12px rgba(31,78,120,.10)!important;z-index:3!important;overflow:visible!important}',
      'body.pms215-left-milk-menu #' + LOGO_ID + ' .pms213-milk-surface{position:absolute!important;left:8px!important;right:8px!important;top:8px!important;height:12px!important;border-radius:999px!important;background:linear-gradient(90deg,#ffffff,#eef8ff,#ffffff)!important;box-shadow:0 0 9px rgba(255,255,255,.95)!important;animation:pms213-surface 1.45s ease-in-out infinite!important}',
      'body.pms215-left-milk-menu #' + LOGO_ID + ' .pms213-mozzarella{position:absolute!important;left:28px!important;top:-15px!important;width:36px!important;height:36px!important;border-radius:999px!important;background:radial-gradient(circle at 30% 24%,#ffffff 0 16%,#fff8ee 42%,#eee3d2 100%)!important;border:1px solid rgba(220,210,190,.82)!important;box-shadow:0 9px 13px rgba(15,35,56,.18),inset -5px -7px 9px rgba(206,190,166,.24),inset 5px 4px 8px rgba(255,255,255,.94)!important;animation:pms213-mozzarella-form 3.2s ease-in-out infinite!important;z-index:4!important}',
      'body.pms215-left-milk-menu #' + LOGO_ID + ' .pms213-shine{position:absolute!important;border-radius:999px!important;background:rgba(255,255,255,.92)!important;z-index:6!important;animation:pms213-shine 3.2s ease-in-out infinite!important}',
      'body.pms215-left-milk-menu #' + LOGO_ID + ' .pms213-shine-a{left:39px!important;top:-6px!important;width:8px!important;height:4px!important;transform:rotate(-22deg)!important}',
      'body.pms215-left-milk-menu #' + LOGO_ID + ' .pms213-shine-b{left:55px!important;top:5px!important;width:5px!important;height:3px!important;transform:rotate(18deg)!important;animation-delay:.18s!important}',
      'body.pms215-left-milk-menu #nav,body.pms215-left-milk-menu #nav.pms86-nav,body.pms215-left-milk-menu #nav.pms100-nav{order:1!important;display:flex!important;flex:1 1 auto!important;min-height:0!important;width:100%!important;flex-direction:column!important;gap:5px!important;overflow-y:auto!important;overflow-x:hidden!important;padding:0 4px 8px 0!important;margin:0!important;scrollbar-width:thin!important}',
      'body.pms215-left-milk-menu #nav .nav-group{display:flex!important;flex-direction:column!important;gap:4px!important;margin:0 0 8px!important;padding:0!important;border:0!important;background:transparent!important}',
      'body.pms215-left-milk-menu #nav .nav-group-title{display:block!important;margin:8px 2px 3px!important;padding:0 6px!important;color:rgba(255,255,255,.55)!important;font-size:10px!important;font-weight:900!important;text-transform:uppercase!important;letter-spacing:0!important;line-height:1.2!important}',
      'body.pms215-left-milk-menu #nav .nav-button,body.pms215-left-milk-menu #nav .nav-button.compact,body.pms215-left-milk-menu #nav.pms86-nav .nav-button,body.pms215-left-milk-menu #nav.pms86-nav .nav-button.compact{position:relative!important;display:flex!important;align-items:center!important;justify-content:flex-start!important;width:100%!important;min-width:0!important;max-width:100%!important;min-height:38px!important;height:auto!important;margin:0!important;padding:8px 10px!important;border:1px solid rgba(255,255,255,.08)!important;border-radius:7px!important;background:rgba(255,255,255,.045)!important;color:rgba(255,255,255,.88)!important;text-align:left!important;font-size:12.5px!important;font-weight:850!important;line-height:1.18!important;white-space:normal!important;overflow:hidden!important;overflow-wrap:anywhere!important;word-break:normal!important;text-overflow:clip!important;box-shadow:none!important;grid-template-columns:minmax(0,1fr)!important;gap:0!important;cursor:pointer!important}',
      'body.pms215-left-milk-menu #nav .nav-button:hover,body.pms215-left-milk-menu #nav .nav-button.active{background:linear-gradient(90deg,rgba(0,146,70,.24),rgba(255,255,255,.10),rgba(206,43,55,.16))!important;color:#fff!important;border-color:rgba(255,255,255,.20)!important}',
      'body.pms215-left-milk-menu #nav .nav-button::before,body.pms215-left-milk-menu #nav .nav-button::after,body.pms215-left-milk-menu #nav.pms86-nav .nav-button::before,body.pms215-left-milk-menu #nav.pms86-nav .nav-button::after{content:none!important;display:none!important;width:0!important;height:0!important;margin:0!important;padding:0!important;border:0!important}',
      'body.pms215-left-milk-menu #nav .pms100-code,body.pms215-left-milk-menu #nav .pms52-nav-code,body.pms215-left-milk-menu #nav .pms86-nav-code,body.pms215-left-milk-menu #nav [class*="nav-code"],body.pms215-left-milk-menu #nav [data-pms215-hidden-code="1"]{display:none!important;visibility:hidden!important;width:0!important;height:0!important;min-width:0!important;max-width:0!important;min-height:0!important;max-height:0!important;margin:0!important;padding:0!important;border:0!important;overflow:hidden!important;opacity:0!important;font-size:0!important;line-height:0!important;color:transparent!important;background:transparent!important;pointer-events:none!important}',
      'body.pms215-left-milk-menu #nav .pms100-label,body.pms215-left-milk-menu #nav .pms52-nav-label,body.pms215-left-milk-menu #nav .pms86-nav-label{display:block!important;min-width:0!important;width:100%!important;grid-column:1!important;color:inherit!important;font-size:inherit!important;font-weight:inherit!important;line-height:inherit!important;white-space:normal!important;overflow-wrap:anywhere!important;word-break:normal!important}',
      'body.pms215-left-milk-menu .sidebar-footer{order:2!important;display:grid!important;gap:8px!important;flex:0 0 auto!important;margin:6px 0 0!important;padding:10px 0 0!important;border-top:1px solid rgba(255,255,255,.14)!important}',
      'body.pms215-left-milk-menu .sidebar-footer span,body.pms215-left-milk-menu #current-user{display:none!important}',
      'body.pms215-left-milk-menu #logout-button{width:100%!important;min-height:38px!important;margin:0!important;border-radius:7px!important;background:rgba(255,255,255,.10)!important;color:#fff!important;border:1px solid rgba(255,255,255,.12)!important}',
      '@media(max-width:780px){body.pms215-left-milk-menu .app:not(.hidden){display:block!important;overflow:visible!important}body.pms215-left-milk-menu .sidebar{position:relative!important;width:100%!important;min-width:0!important;max-width:none!important;height:auto!important;min-height:0!important;max-height:none!important;border-radius:0!important}body.pms215-left-milk-menu .main{overflow:visible!important}body.pms215-left-milk-menu #' + LOGO_ID + '{height:120px!important;min-height:120px!important;max-height:120px!important}body.pms215-left-milk-menu #nav{max-height:none!important;overflow:visible!important}}'
    ].join("\n");
  }

  function refresh(){
    document.body.classList.add("pms215-left-milk-menu");
    document.body.classList.remove("pms165-fixed-top-menu");
    css();
    moveLogoToLeftMenu();
    cleanMenuLetters();
  }

  function wrap(){
    if (typeof render === "function" && !render.__pms215Wrapped) {
      var baseRender = render;
      render = function(){
        var out = baseRender.apply(this, arguments);
        setTimeout(refresh, 20);
        setTimeout(refresh, 180);
        return out;
      };
      render.__pms215Wrapped = true;
      try { window.render = render; } catch(error) {}
    }
    if (typeof renderNav === "function" && !renderNav.__pms215Wrapped) {
      var baseNav = renderNav;
      renderNav = function(){
        var out = baseNav.apply(this, arguments);
        setTimeout(refresh, 20);
        setTimeout(refresh, 180);
        return out;
      };
      renderNav.__pms215Wrapped = true;
      try { window.renderNav = renderNav; } catch(error) {}
    }
  }

  function boot(){
    wrap();
    refresh();
    [60, 180, 500, 1200, 2500].forEach(function(ms){ setTimeout(refresh, ms); });
    setInterval(refresh, 1600);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  window.PMS_V215_LEFT_MENU_MILK_LOGO_LAYOUT = {version: VERSION, refresh: refresh};
})();
