(function(){
  "use strict";

  const VERSION = "pms_v174_uniform_sidebar_menu_cleanup";

  function injectCss(){
    let style = document.getElementById("pms-v174-uniform-sidebar-menu-cleanup-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v174-uniform-sidebar-menu-cleanup-style";
      document.head.appendChild(style);
    }
    if (style.dataset.pms174Ready === "1") return;
    style.dataset.pms174Ready = "1";
    style.textContent = `
      body,
      body.device-phone,
      body.device-tablet,
      body.device-desktop{
        overflow-x:hidden!important;
      }
      body.pms166-restore-sidebar .app,
      body.device-phone.pms166-restore-sidebar .app,
      body.device-tablet.pms166-restore-sidebar .app{
        display:flex!important;
        align-items:stretch!important;
        min-height:100vh!important;
        width:100%!important;
      }
      body.pms166-restore-sidebar .sidebar,
      body.device-phone.pms166-restore-sidebar .sidebar,
      body.device-tablet.pms166-restore-sidebar .sidebar{
        position:sticky!important;
        top:0!important;
        left:0!important;
        z-index:150!important;
        width:282px!important;
        min-width:282px!important;
        max-width:282px!important;
        height:100vh!important;
        min-height:100vh!important;
        max-height:100vh!important;
        display:flex!important;
        flex-direction:column!important;
        align-items:stretch!important;
        justify-content:flex-start!important;
        gap:10px!important;
        padding:14px 12px!important;
        overflow:hidden!important;
        color:#17242b!important;
        background:linear-gradient(90deg,rgba(95,143,109,.13),rgba(255,255,255,.94) 50%,rgba(189,122,120,.11)),#f7faf8!important;
        border-right:1px solid #dfe9e4!important;
        border-bottom:0!important;
        box-shadow:4px 0 18px rgba(20,37,48,.06)!important;
        transform:none!important;
      }
      body.pms166-restore-sidebar .main,
      body.device-phone.pms166-restore-sidebar .main,
      body.device-tablet.pms166-restore-sidebar .main{
        flex:1 1 auto!important;
        width:calc(100% - 282px)!important;
        min-width:0!important;
        max-width:none!important;
      }
      body.pms166-restore-sidebar .sidebar-brand,
      body.device-phone.pms166-restore-sidebar .sidebar-brand,
      body.device-tablet.pms166-restore-sidebar .sidebar-brand{
        display:grid!important;
        grid-template-columns:46px minmax(0,1fr)!important;
        align-items:center!important;
        gap:10px!important;
        width:100%!important;
        min-height:54px!important;
        padding:0 0 10px!important;
        margin:0!important;
        border-bottom:1px solid rgba(95,143,109,.22)!important;
      }
      body.pms166-restore-sidebar .brand-mark{
        width:42px!important;
        height:42px!important;
        min-width:42px!important;
        border-radius:999px!important;
      }
      body.pms166-restore-sidebar .sidebar-brand strong{
        display:block!important;
        color:#0f172a!important;
        font-size:16px!important;
        line-height:1.08!important;
        font-weight:950!important;
        white-space:normal!important;
        overflow:visible!important;
        text-overflow:clip!important;
      }
      body.pms166-restore-sidebar .sidebar-brand span{
        display:block!important;
        color:#475569!important;
        font-size:12px!important;
        line-height:1.12!important;
        white-space:normal!important;
      }
      #pms170-top-globe,
      body.pms166-restore-sidebar #pms170-top-globe{
        flex:0 0 auto!important;
        width:100%!important;
        min-height:114px!important;
        max-height:114px!important;
        display:grid!important;
        grid-template-rows:72px 30px!important;
        align-items:center!important;
        justify-items:center!important;
        gap:5px!important;
        padding:7px 6px!important;
        margin:0!important;
        overflow:hidden!important;
        border:1px solid rgba(95,143,109,.18)!important;
        border-radius:8px!important;
        background:linear-gradient(90deg,rgba(95,143,109,.08),rgba(255,255,255,.96),rgba(189,122,120,.08))!important;
        box-shadow:none!important;
      }
      #pms170-top-globe .pms170-world{
        grid-row:1!important;
        width:96px!important;
        height:70px!important;
        margin:0!important;
        transform:none!important;
      }
      #pms170-top-globe .pms170-earth{
        width:58px!important;
        height:58px!important;
      }
      #pms170-top-globe .pms170-ellipse{
        top:13px!important;
        height:44px!important;
      }
      #pms170-top-globe .pms170-logo-dot{
        width:25px!important;
        height:25px!important;
        top:-11px!important;
        margin-left:-12.5px!important;
      }
      #pms170-top-globe .pms170-lit-name{
        grid-row:2!important;
        width:100%!important;
        min-height:30px!important;
        max-height:30px!important;
        display:grid!important;
        place-items:center!important;
        margin:0!important;
        padding:5px 8px!important;
        border-radius:8px!important;
        color:#0f172a!important;
        background:linear-gradient(90deg,rgba(0,146,70,.34),rgba(255,255,255,.82),rgba(206,43,55,.3)),#ffffff!important;
        border:1px solid rgba(95,143,109,.28)!important;
        box-shadow:0 3px 10px rgba(23,59,92,.08)!important;
        text-shadow:none!important;
        font-size:12px!important;
        font-weight:950!important;
        line-height:1.05!important;
        text-align:center!important;
        white-space:normal!important;
        overflow:hidden!important;
      }
      #pms170-top-globe .pms170-payoff,
      #pms170-top-globe [class*="payoff"],
      #pms170-top-globe small,
      #pms170-top-globe p{
        display:none!important;
        visibility:hidden!important;
        opacity:0!important;
        width:0!important;
        height:0!important;
        min-height:0!important;
        max-height:0!important;
        padding:0!important;
        margin:0!important;
        overflow:hidden!important;
      }
      body.pms166-restore-sidebar #pms143-menu,
      body.device-phone.pms166-restore-sidebar #pms143-menu,
      body.device-tablet.pms166-restore-sidebar #pms143-menu{
        flex:1 1 auto!important;
        display:grid!important;
        grid-template-columns:1fr!important;
        align-content:start!important;
        gap:6px!important;
        width:100%!important;
        min-height:0!important;
        max-height:none!important;
        overflow-y:auto!important;
        overflow-x:hidden!important;
        padding:2px 3px 6px!important;
        margin:0!important;
        border:0!important;
        background:transparent!important;
        scrollbar-width:thin!important;
      }
      body.pms166-restore-sidebar .pms143-button,
      body.device-phone.pms166-restore-sidebar .pms143-button,
      body.device-tablet.pms166-restore-sidebar .pms143-button{
        display:grid!important;
        grid-template-columns:38px minmax(0,1fr)!important;
        align-items:center!important;
        gap:8px!important;
        width:100%!important;
        min-width:0!important;
        min-height:39px!important;
        max-height:none!important;
        margin:0!important;
        padding:7px 9px!important;
        border-radius:8px!important;
        border:1px solid rgba(95,143,109,.22)!important;
        background:rgba(255,255,255,.9)!important;
        color:#17242b!important;
        text-align:left!important;
        box-shadow:none!important;
      }
      body.pms166-restore-sidebar .pms143-button span{
        width:36px!important;
        height:22px!important;
        min-width:36px!important;
        display:inline-grid!important;
        place-items:center!important;
        border-radius:6px!important;
        background:linear-gradient(90deg,rgba(95,143,109,.18),#fff,rgba(189,122,120,.16))!important;
        color:#3f6b50!important;
        font-size:9px!important;
        font-weight:950!important;
        line-height:1!important;
      }
      body.pms166-restore-sidebar .pms143-button b{
        min-width:0!important;
        display:block!important;
        color:#17242b!important;
        font-size:11.5px!important;
        font-weight:850!important;
        line-height:1.12!important;
        white-space:normal!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
      }
      body.pms166-restore-sidebar .pms143-button[data-page="productForms"] small,
      body.pms166-restore-sidebar .pms143-button[data-module="productForms"] small,
      body.pms166-restore-sidebar .pms143-button small,
      body.pms166-restore-sidebar .pms143-button em,
      body.pms166-restore-sidebar .pms143-button .subtitle{
        display:none!important;
        visibility:hidden!important;
        height:0!important;
        margin:0!important;
        padding:0!important;
        overflow:hidden!important;
      }
      body.pms166-restore-sidebar .sidebar-footer{
        flex:0 0 auto!important;
        display:grid!important;
        gap:0!important;
        width:100%!important;
        margin:0!important;
        padding-top:8px!important;
        border-top:1px solid rgba(95,143,109,.22)!important;
      }
      body.pms166-restore-sidebar .sidebar-footer > :not(#logout-button),
      body.pms166-restore-sidebar .sidebar-footer span,
      body.pms166-restore-sidebar #current-user{
        display:none!important;
        visibility:hidden!important;
        width:0!important;
        height:0!important;
        margin:0!important;
        padding:0!important;
        overflow:hidden!important;
      }
      body.pms166-restore-sidebar #logout-button{
        display:block!important;
        width:100%!important;
        min-height:34px!important;
        margin:0!important;
        padding:8px 10px!important;
        border-radius:8px!important;
      }
      @media(max-width:420px){
        body.pms166-restore-sidebar .sidebar,
        body.device-phone.pms166-restore-sidebar .sidebar{
          width:268px!important;
          min-width:268px!important;
          max-width:268px!important;
          padding:12px 9px!important;
        }
        body.pms166-restore-sidebar .main,
        body.device-phone.pms166-restore-sidebar .main{
          width:calc(100% - 268px)!important;
        }
      }
      @media print{
        #pms170-top-globe{display:none!important}
      }
    `;
  }

  function removeExtraText(){
    const banner = document.getElementById("pms170-top-globe");
    if (banner) {
      banner.querySelectorAll(".pms170-payoff,[class*='payoff']").forEach(function(node){
        node.textContent = "";
        node.setAttribute("aria-hidden", "true");
        node.style.display = "none";
      });
      const name = banner.querySelector(".pms170-lit-name");
      if (name) name.textContent = "Parmitalia Distribution";
    }
    document.querySelectorAll(".pms143-button").forEach(function(button){
      button.querySelectorAll("small,em,.subtitle").forEach(function(node){
        node.textContent = "";
        node.style.display = "none";
      });
      const text = (button.textContent || "").toLowerCase();
      if (text.indexOf("moduli prodotto") >= 0 || button.getAttribute("data-page") === "productForms" || button.getAttribute("data-module") === "productForms") {
        button.querySelectorAll("small,em,.subtitle").forEach(function(node){ node.remove(); });
      }
    });
    document.querySelectorAll(".sidebar-footer span,#current-user").forEach(function(node){
      node.textContent = "";
      node.style.display = "none";
    });
  }

  function enforceLayout(){
    document.body.classList.add("pms166-restore-sidebar");
    document.body.classList.remove("pms165-fixed-top-menu", "pms164-top-select-menu", "pms163-top-menu", "pms163-menu-open");
    injectCss();
    removeExtraText();
  }

  function install(){
    enforceLayout();
    const baseRender = typeof render === "function" ? render : null;
    if (baseRender && !render.__pms174Wrapped) {
      render = function(){
        const result = baseRender.apply(this, arguments);
        setTimeout(enforceLayout, 20);
        setTimeout(enforceLayout, 160);
        return result;
      };
      render.__pms174Wrapped = true;
      try { window.render = render; } catch(error) {}
    }
    [60, 180, 420, 900, 1800].forEach(function(ms){ setTimeout(enforceLayout, ms); });
    setInterval(enforceLayout, 1400);
    window.PMS_V174_UNIFORM_SIDEBAR_MENU_CLEANUP = { version: VERSION };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();
})();
