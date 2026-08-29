(function(){
  "use strict";

  const VERSION = "pms_v166_restore_previous_sidebar_menu";

  function injectCss(){
    let style = document.getElementById("pms-v166-restore-previous-sidebar-menu-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v166-restore-previous-sidebar-menu-style";
      document.head.appendChild(style);
    }
    style.textContent = `
      body.pms166-restore-sidebar .app{
        display:flex!important;
        min-height:100vh!important;
        width:100%!important;
      }
      body.pms166-restore-sidebar .sidebar{
        position:sticky!important;
        top:0!important;
        z-index:100!important;
        width:282px!important;
        min-width:282px!important;
        height:100vh!important;
        min-height:100vh!important;
        display:flex!important;
        flex-direction:column!important;
        align-items:stretch!important;
        gap:12px!important;
        padding:20px!important;
        overflow:visible!important;
        color:#17242b!important;
        background:linear-gradient(90deg,rgba(95,143,109,.15),rgba(255,255,255,.88) 50%,rgba(189,122,120,.12)),#f7faf8!important;
        border-right:1px solid #dfe9e4!important;
        border-bottom:0!important;
        box-shadow:none!important;
      }
      body.pms166-restore-sidebar .sidebar *{
        text-shadow:none!important;
        letter-spacing:0!important;
      }
      body.pms166-restore-sidebar .sidebar-brand{
        display:flex!important;
        align-items:center!important;
        gap:12px!important;
        padding:0 0 12px!important;
        margin:0!important;
        border-bottom:1px solid rgba(95,143,109,.22)!important;
      }
      body.pms166-restore-sidebar .sidebar-brand strong{
        display:block!important;
        font-size:17px!important;
        color:#17242b!important;
        line-height:1.1!important;
      }
      body.pms166-restore-sidebar .sidebar-brand span{
        display:block!important;
        color:#52606d!important;
        font-size:12px!important;
      }
      body.pms166-restore-sidebar .brand-mark{
        width:42px!important;
        height:42px!important;
        min-width:42px!important;
      }
      body.pms166-restore-sidebar #pms163-menu-toggle,
      body.pms166-restore-sidebar #pms164-menu-wrap,
      body.pms166-restore-sidebar #pms165-top-menu,
      body.pms166-restore-sidebar #pms144-world-banner,
      body.pms166-restore-sidebar .pms144-world-banner,
      body.pms166-restore-sidebar .pms144-sign,
      body.pms166-restore-sidebar .pms113-led-sign{
        display:none!important;
        visibility:hidden!important;
        width:0!important;
        height:0!important;
        min-height:0!important;
        max-height:0!important;
        padding:0!important;
        margin:0!important;
        overflow:hidden!important;
        pointer-events:none!important;
      }
      body.pms166-restore-sidebar #pms143-menu{
        position:static!important;
        inset:auto!important;
        z-index:auto!important;
        display:grid!important;
        grid-template-columns:1fr!important;
        gap:6px!important;
        overflow:auto!important;
        min-height:220px!important;
        max-height:calc(100vh - 170px)!important;
        padding:4px!important;
        margin:0!important;
        border:0!important;
        border-radius:0!important;
        background:transparent!important;
        box-shadow:none!important;
        visibility:visible!important;
        opacity:1!important;
      }
      body.pms166-restore-sidebar #nav[data-pms143-hidden="1"],
      body.pms166-restore-sidebar #nav{
        display:none!important;
        visibility:hidden!important;
        height:0!important;
        min-height:0!important;
        max-height:0!important;
        overflow:hidden!important;
        padding:0!important;
        margin:0!important;
      }
      body.pms166-restore-sidebar .pms143-button{
        display:grid!important;
        grid-template-columns:38px minmax(0,1fr)!important;
        align-items:center!important;
        gap:8px!important;
        width:100%!important;
        min-width:0!important;
        min-height:40px!important;
        margin:0!important;
        padding:7px 9px!important;
        border-radius:8px!important;
        border:1px solid rgba(95,143,109,.22)!important;
        background:rgba(255,255,255,.82)!important;
        text-align:left!important;
        box-shadow:none!important;
        cursor:pointer!important;
      }
      body.pms166-restore-sidebar .pms143-button:hover,
      body.pms166-restore-sidebar .pms143-button.active{
        background:linear-gradient(90deg,rgba(95,143,109,.18),#fff,rgba(189,122,120,.13))!important;
        border-color:rgba(95,143,109,.42)!important;
      }
      body.pms166-restore-sidebar .pms143-button span{
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        width:36px!important;
        height:21px!important;
        border-radius:6px!important;
        background:linear-gradient(90deg,rgba(95,143,109,.18),#fff,rgba(189,122,120,.16))!important;
        color:#3f6b50!important;
        font-size:9px!important;
        font-weight:900!important;
      }
      body.pms166-restore-sidebar .pms143-button b{
        display:block!important;
        min-width:0!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
        white-space:normal!important;
        line-height:1.12!important;
        font-size:11px!important;
        font-weight:800!important;
        color:#17242b!important;
      }
      body.pms166-restore-sidebar .sidebar-footer{
        margin-top:auto!important;
        padding-top:12px!important;
        border-top:1px solid rgba(95,143,109,.22)!important;
        display:grid!important;
        gap:8px!important;
      }
      body.pms166-restore-sidebar .sidebar-footer span,
      body.pms166-restore-sidebar #current-user{
        display:none!important;
      }
      body.pms166-restore-sidebar #logout-button{
        width:100%!important;
        min-width:0!important;
        height:auto!important;
        margin:0!important;
        padding:10px 12px!important;
        border-radius:8px!important;
        background:#fff!important;
        border:1px solid #dfe9e4!important;
        color:#17242b!important;
        font-weight:950!important;
      }
      body.pms166-restore-sidebar .main{
        flex:1!important;
        width:auto!important;
        min-width:0!important;
        max-width:none!important;
      }
      body.pms166-restore-sidebar .topbar{
        top:0!important;
        z-index:50!important;
      }
      @media(max-width:860px){
        body.pms166-restore-sidebar .app{display:block!important}
        body.pms166-restore-sidebar .sidebar{
          position:relative!important;
          width:100%!important;
          min-width:0!important;
          height:auto!important;
          min-height:0!important;
        }
        body.pms166-restore-sidebar #pms143-menu{
          max-height:320px!important;
        }
        body.pms166-restore-sidebar .topbar{position:relative!important}
      }
    `;
  }

  function cleanupTopMenu(){
    document.body.classList.remove("pms163-menu-open");
    document.body.classList.remove("pms163-top-menu");
    document.body.classList.remove("pms164-top-select-menu");
    document.body.classList.remove("pms165-fixed-top-menu");
    document.body.classList.add("pms166-restore-sidebar");
    document.querySelectorAll(".pms144-sign").forEach(function(node){ node.remove(); });
    const user = document.getElementById("current-user");
    if (user) user.textContent = "";
    document.querySelectorAll(".sidebar-footer span").forEach(function(node){ node.textContent = ""; });
  }

  function ensurePreviousMenu(){
    if (typeof window.renderNav === "function") {
      try { window.renderNav(); } catch(error) { console.warn(VERSION + " renderNav failed", error); }
    }
    cleanupTopMenu();
  }

  function install(){
    injectCss();
    cleanupTopMenu();
    ensurePreviousMenu();
    [50, 150, 350, 700, 1400, 2600].forEach(function(ms){
      setTimeout(function(){
        injectCss();
        cleanupTopMenu();
      }, ms);
    });
    setInterval(function(){
      injectCss();
      cleanupTopMenu();
    }, 1800);
    window.PMS_V166_RESTORE_PREVIOUS_SIDEBAR_MENU = { version: VERSION };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();
})();
