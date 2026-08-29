(function(){
  "use strict";

  const VERSION = "pms_v163_top_dropdown_menu";

  function qs(selector, root){ return (root || document).querySelector(selector); }
  function qsa(selector, root){ return Array.from((root || document).querySelectorAll(selector)); }

  function injectCss(){
    let style = document.getElementById("pms-v163-top-dropdown-menu-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v163-top-dropdown-menu-style";
      document.head.appendChild(style);
    }
    style.textContent = `
      body.pms163-top-menu{background:linear-gradient(120deg,rgba(95,143,109,.055),rgba(255,255,255,.52),rgba(189,122,120,.05)),#f7faf8!important}
      body.pms163-top-menu .app{display:block!important;min-height:100vh!important;width:100%!important}
      body.pms163-top-menu .sidebar{
        position:sticky!important;
        top:0!important;
        z-index:3000!important;
        width:100%!important;
        height:auto!important;
        min-height:64px!important;
        display:flex!important;
        flex-direction:row!important;
        align-items:center!important;
        gap:12px!important;
        padding:10px 16px!important;
        overflow:visible!important;
        background:linear-gradient(90deg,rgba(95,143,109,.22),rgba(255,255,255,.96) 48%,rgba(189,122,120,.18)),#f7faf8!important;
        border:0!important;
        border-bottom:1px solid #dfe9e4!important;
        box-shadow:0 8px 22px rgba(30,45,60,.08)!important;
        color:#17242b!important;
      }
      body.pms163-top-menu .sidebar *{text-shadow:none!important;letter-spacing:0!important}
      #mobile-menu-toggle,
      html body.pms163-top-menu .sidebar .sidebar-brand,
      html body.pms163-top-menu .sidebar .brand-mark,
      html body.pms163-top-menu .sidebar .brand-text,
      html body.pms163-top-menu .sidebar [id*="logo"],
      html body.pms163-top-menu .sidebar [class*="logo"]{
        display:none!important;
        visibility:hidden!important;
        width:0!important;
        height:0!important;
        min-width:0!important;
        min-height:0!important;
        margin:0!important;
        padding:0!important;
        overflow:hidden!important;
      }
      body.pms163-top-menu .sidebar-brand{
        flex:0 1 auto!important;
        min-width:0!important;
        display:flex!important;
        align-items:center!important;
        gap:10px!important;
        padding:0!important;
        border:0!important;
        margin:0!important;
      }
      body.pms163-top-menu .sidebar-brand strong{display:block!important;font-size:16px!important;color:#17242b!important;line-height:1.05!important;white-space:nowrap!important}
      body.pms163-top-menu .sidebar-brand span{display:block!important;font-size:11px!important;color:#52606d!important;white-space:nowrap!important}
      body.pms163-top-menu .brand-mark{width:38px!important;height:38px!important;min-width:38px!important}
      body.pms163-top-menu #pms144-world-banner,
      body.pms163-top-menu .pms144-world-banner,
      body.pms163-top-menu .pms144-sign,
      body.pms163-top-menu .pms113-led-sign,
      body.pms163-top-menu [data-pms144-hidden="1"]{display:none!important;visibility:hidden!important;width:0!important;height:0!important;min-height:0!important;margin:0!important;padding:0!important;overflow:hidden!important}
      body.pms163-top-menu .sidebar-footer{
        margin:0 0 0 auto!important;
        padding:0!important;
        border:0!important;
        display:flex!important;
        align-items:center!important;
        gap:8px!important;
      }
      body.pms163-top-menu .sidebar-footer span,
      body.pms163-top-menu #current-user{display:none!important}
      body.pms163-top-menu #logout-button{
        width:auto!important;
        min-width:78px!important;
        margin:0!important;
        padding:9px 14px!important;
        border-radius:8px!important;
        background:#fff!important;
        border:1px solid #dfe9e4!important;
        color:#17242b!important;
        font-weight:900!important;
        box-shadow:0 3px 10px rgba(30,45,60,.08)!important;
      }
      #pms163-menu-toggle{
        appearance:none!important;
        border:1px solid rgba(95,143,109,.34)!important;
        background:linear-gradient(90deg,#5f8f6d,#ffffff 54%,#bd7a78)!important;
        color:#17242b!important;
        border-radius:8px!important;
        padding:10px 14px!important;
        min-width:118px!important;
        height:40px!important;
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        gap:8px!important;
        font-weight:950!important;
        cursor:pointer!important;
        box-shadow:0 5px 14px rgba(30,45,60,.08)!important;
      }
      #pms163-menu-toggle:after{content:"v";font-size:11px!important;font-weight:950!important;transform:translateY(-1px)!important}
      body.pms163-menu-open #pms163-menu-toggle:after{transform:rotate(180deg) translateY(1px)!important}
      body.pms163-top-menu #pms143-menu,
      body.pms163-top-menu #nav{
        position:absolute!important;
        top:calc(100% + 7px)!important;
        left:14px!important;
        right:14px!important;
        z-index:3100!important;
        display:none!important;
        grid-template-columns:repeat(auto-fit,minmax(190px,1fr))!important;
        gap:8px!important;
        min-height:0!important;
        max-height:calc(100vh - 92px)!important;
        overflow:auto!important;
        padding:12px!important;
        margin:0!important;
        border:1px solid #dfe9e4!important;
        border-radius:8px!important;
        background:rgba(255,255,255,.98)!important;
        box-shadow:0 18px 44px rgba(30,45,60,.18)!important;
        backdrop-filter:blur(8px)!important;
      }
      body.pms163-top-menu.pms163-menu-open #pms143-menu,
      body.pms163-top-menu.pms163-menu-open #nav:not([data-pms143-hidden="1"]){display:grid!important;visibility:visible!important;opacity:1!important}
      body.pms163-top-menu #nav[data-pms143-hidden="1"]{display:none!important}
      body.pms163-top-menu .pms143-button,
      body.pms163-top-menu .nav-button{
        display:grid!important;
        grid-template-columns:42px minmax(0,1fr)!important;
        align-items:center!important;
        gap:9px!important;
        width:100%!important;
        min-width:0!important;
        min-height:44px!important;
        margin:0!important;
        padding:8px 10px!important;
        border-radius:8px!important;
        border:1px solid rgba(95,143,109,.22)!important;
        background:#fff!important;
        color:#17242b!important;
        text-align:left!important;
        box-shadow:none!important;
      }
      body.pms163-top-menu .pms143-button:hover,
      body.pms163-top-menu .pms143-button.active,
      body.pms163-top-menu .nav-button:hover,
      body.pms163-top-menu .nav-button.active{
        background:linear-gradient(90deg,rgba(95,143,109,.16),#fff,rgba(189,122,120,.12))!important;
        border-color:rgba(95,143,109,.42)!important;
      }
      body.pms163-top-menu .pms143-button span{
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        width:38px!important;
        height:24px!important;
        border-radius:6px!important;
        background:linear-gradient(90deg,rgba(95,143,109,.18),#fff,rgba(189,122,120,.16))!important;
        color:#3f6b50!important;
        font-size:9px!important;
        font-weight:950!important;
      }
      body.pms163-top-menu .pms143-button b,
      body.pms163-top-menu .nav-button span{
        min-width:0!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
        white-space:normal!important;
        line-height:1.14!important;
        font-size:12px!important;
        font-weight:900!important;
        color:#17242b!important;
      }
      body.pms163-top-menu .main{width:100%!important;max-width:none!important;min-width:0!important}
      body.pms163-top-menu .topbar{top:64px!important;z-index:1200!important}
      html body.pms163-top-menu #pms163-menu-toggle{
        position:fixed!important;
        top:11px!important;
        left:16px!important;
        z-index:3200!important;
        display:inline-flex!important;
        visibility:visible!important;
        opacity:1!important;
      }
      html body.pms163-top-menu #pms143-menu,
      html body.pms163-top-menu #nav{
        position:fixed!important;
        top:62px!important;
        left:14px!important;
        right:14px!important;
        bottom:auto!important;
        z-index:3100!important;
      }
      @media(max-width:760px){
        body.pms163-top-menu .sidebar{padding:9px 10px!important;gap:8px!important;min-height:58px!important}
        body.pms163-top-menu .sidebar-brand strong{font-size:14px!important}
        body.pms163-top-menu .sidebar-brand span{display:none!important}
        body.pms163-top-menu .brand-mark{width:34px!important;height:34px!important;min-width:34px!important}
        #pms163-menu-toggle{min-width:92px!important;height:38px!important;padding:9px 10px!important}
        body.pms163-top-menu #logout-button{min-width:64px!important;padding:8px 10px!important}
        body.pms163-top-menu #pms143-menu,
        body.pms163-top-menu #nav{left:8px!important;right:8px!important;grid-template-columns:1fr!important;max-height:calc(100vh - 78px)!important}
        body.pms163-top-menu .topbar{top:58px!important}
      }
    `;
  }

  function removeDuplicateText(){
    qsa(".pms144-sign").forEach(function(node){ node.remove(); });
    const user = document.getElementById("current-user");
    if (user) user.textContent = "";
    qsa(".sidebar-footer span").forEach(function(node){ node.textContent = ""; });
  }

  function closeMenu(){
    document.body.classList.remove("pms163-menu-open");
    const toggle = document.getElementById("pms163-menu-toggle");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  }

  function toggleMenu(){
    const open = !document.body.classList.contains("pms163-menu-open");
    document.body.classList.toggle("pms163-menu-open", open);
    const toggle = document.getElementById("pms163-menu-toggle");
    if (toggle) toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function ensureTopButton(){
    const sidebar = qs(".sidebar");
    if (!sidebar) return;
    let toggle = document.getElementById("pms163-menu-toggle");
    if (!toggle) {
      toggle = document.createElement("button");
      toggle.type = "button";
      toggle.id = "pms163-menu-toggle";
      toggle.textContent = "Menu";
      toggle.setAttribute("aria-haspopup", "true");
      toggle.setAttribute("aria-expanded", "false");
      const brand = qs(".sidebar-brand", sidebar);
      if (brand && brand.nextSibling) sidebar.insertBefore(toggle, brand.nextSibling);
      else sidebar.insertBefore(toggle, sidebar.firstChild);
    }
    if (toggle.dataset.pms163Bound !== "1") {
      toggle.dataset.pms163Bound = "1";
      toggle.addEventListener("click", function(event){
        event.preventDefault();
        event.stopPropagation();
        toggleMenu();
      });
    }
  }

  function bindCloseHandlers(){
    const host = document.getElementById("pms143-menu") || document.getElementById("nav");
    if (host && host.dataset.pms163CloseBound !== "1") {
      host.dataset.pms163CloseBound = "1";
      host.addEventListener("click", function(event){
        if (event.target.closest("button")) setTimeout(closeMenu, 30);
      }, true);
    }
    if (document.body.dataset.pms163OutsideBound !== "1") {
      document.body.dataset.pms163OutsideBound = "1";
      document.addEventListener("click", function(event){
        if (!document.body.classList.contains("pms163-menu-open")) return;
        if (event.target.closest(".sidebar")) return;
        closeMenu();
      }, true);
      document.addEventListener("keydown", function(event){
        if (event.key === "Escape") closeMenu();
      });
    }
  }

  function refresh(){
    document.body.classList.add("pms163-top-menu");
    injectCss();
    ensureTopButton();
    removeDuplicateText();
    bindCloseHandlers();
  }

  function wrapRenderers(){
    if (typeof renderNav === "function" && !renderNav.pms163Wrapped) {
      const baseRenderNav = renderNav;
      renderNav = function(){
        const result = baseRenderNav.apply(this, arguments);
        setTimeout(refresh, 0);
        setTimeout(refresh, 120);
        return result;
      };
      renderNav.pms163Wrapped = true;
      window.renderNav = renderNav;
    }
    if (typeof render === "function" && !render.pms163Wrapped) {
      const baseRender = render;
      render = function(){
        const result = baseRender.apply(this, arguments);
        setTimeout(refresh, 0);
        setTimeout(refresh, 120);
        return result;
      };
      render.pms163Wrapped = true;
      window.render = render;
    }
  }

  function install(){
    wrapRenderers();
    refresh();
    [60, 180, 450, 900, 1600, 2600].forEach(function(ms){ setTimeout(refresh, ms); });
    setInterval(refresh, 2500);
    window.PMS_V163_TOP_DROPDOWN_MENU = { version: VERSION };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();
})();
