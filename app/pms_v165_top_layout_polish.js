(function(){
  "use strict";

  const VERSION = "pms_v165_top_layout_polish";
  const STYLE_ID = "pms-v165-top-layout-polish-style";

  function installStyle(){
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }

    style.textContent = `
      html,body{
        width:100%!important;
        min-width:0!important;
        margin:0!important;
        overflow-x:hidden!important;
      }
      body.pms163-top-menu .app:not(.hidden){
        display:block!important;
        width:100%!important;
        min-width:0!important;
        max-width:none!important;
        min-height:100vh!important;
        padding:64px 0 0!important;
        margin:0!important;
      }
      html body.pms163-top-menu .sidebar{
        position:fixed!important;
        inset:0 0 auto 0!important;
        z-index:3000!important;
        display:flex!important;
        flex-direction:row!important;
        align-items:center!important;
        width:100%!important;
        min-width:0!important;
        max-width:none!important;
        height:64px!important;
        min-height:64px!important;
        max-height:64px!important;
        gap:10px!important;
        margin:0!important;
        padding:10px 16px!important;
        overflow:visible!important;
        background:linear-gradient(90deg,rgba(95,143,109,.22),rgba(255,255,255,.97) 48%,rgba(189,122,120,.18)),#f7faf8!important;
        border:0!important;
        border-bottom:1px solid #dfe9e4!important;
        box-shadow:0 8px 22px rgba(30,45,60,.08)!important;
      }
      html body.pms163-top-menu #pms163-menu-toggle{
        position:relative!important;
        inset:auto!important;
        z-index:3200!important;
        flex:0 0 auto!important;
        display:inline-flex!important;
        width:auto!important;
        min-width:118px!important;
        height:40px!important;
        margin:0!important;
        visibility:visible!important;
        opacity:1!important;
      }
      html body.pms163-top-menu .sidebar-footer{
        position:relative!important;
        inset:auto!important;
        display:flex!important;
        align-items:center!important;
        flex:0 0 auto!important;
        margin:0 0 0 auto!important;
        padding:0!important;
        border:0!important;
      }
      html body.pms163-top-menu #logout-button{
        width:auto!important;
        min-width:72px!important;
        min-height:40px!important;
        margin:0!important;
        padding:8px 13px!important;
      }
      html body.pms163-top-menu #pms143-menu,
      html body.pms163-top-menu #nav{
        position:fixed!important;
        inset:64px 14px auto 14px!important;
        z-index:3100!important;
        width:auto!important;
        max-width:none!important;
        max-height:calc(100vh - 78px)!important;
        overflow:auto!important;
      }
      html body.pms163-top-menu .main{
        display:block!important;
        width:100%!important;
        min-width:0!important;
        max-width:none!important;
        margin:0!important;
        padding:0!important;
        overflow:visible!important;
      }
      html body.pms163-top-menu .topbar{
        position:sticky!important;
        top:64px!important;
        z-index:2000!important;
        display:grid!important;
        grid-template-columns:minmax(190px,auto) minmax(0,1fr)!important;
        align-items:start!important;
        width:100%!important;
        min-width:0!important;
        min-height:102px!important;
        gap:16px 24px!important;
        margin:0!important;
        padding:16px 24px!important;
        background:rgba(247,249,252,.97)!important;
        border-bottom:1px solid #dfe5ec!important;
        backdrop-filter:blur(10px)!important;
      }
      html body.pms163-top-menu .topbar > div:first-child{
        min-width:0!important;
        padding-top:3px!important;
      }
      html body.pms163-top-menu .topbar h2{
        margin:0!important;
        font-size:25px!important;
        line-height:1.15!important;
        overflow-wrap:anywhere!important;
      }
      html body.pms163-top-menu .topbar p{
        margin:5px 0 0!important;
        font-size:13px!important;
        line-height:1.3!important;
      }
      html body.pms163-top-menu .topbar-actions{
        display:flex!important;
        align-items:center!important;
        justify-content:flex-end!important;
        align-content:flex-start!important;
        flex-wrap:wrap!important;
        min-width:0!important;
        gap:8px!important;
        margin:0!important;
      }
      html body.pms163-top-menu .topbar-actions > *{
        flex:0 0 auto!important;
        max-width:100%!important;
        margin:0!important;
      }
      html body.pms163-top-menu .topbar-actions button,
      html body.pms163-top-menu .topbar-actions .import-label,
      html body.pms163-top-menu .topbar-actions select{
        min-height:38px!important;
        padding:8px 11px!important;
        border-radius:7px!important;
        font-size:12px!important;
        line-height:1.2!important;
        white-space:nowrap!important;
      }
      html body.pms163-top-menu #content{
        display:block!important;
        width:100%!important;
        min-width:0!important;
        max-width:none!important;
        margin:0!important;
        padding:18px 24px 48px!important;
        overflow:visible!important;
      }
      html body.pms163-top-menu #pms159-dashboard-agenda{
        width:100%!important;
        min-width:0!important;
        max-width:none!important;
        margin:0 0 18px!important;
        padding:16px!important;
        overflow:hidden!important;
      }
      html body.pms163-top-menu .pms159-head{
        display:grid!important;
        grid-template-columns:minmax(220px,1fr) auto!important;
        align-items:start!important;
        gap:12px 18px!important;
      }
      html body.pms163-top-menu .pms159-actions{
        display:flex!important;
        align-items:center!important;
        justify-content:flex-end!important;
        flex-wrap:wrap!important;
        gap:7px!important;
      }
      html body.pms163-top-menu .pms159-grid{
        display:grid!important;
        grid-template-columns:repeat(7,minmax(0,1fr))!important;
        gap:9px!important;
        width:100%!important;
        min-width:0!important;
        min-height:0!important;
      }
      html body.pms163-top-menu .pms159-day{
        min-width:0!important;
        min-height:520px!important;
      }
      html body.pms163-top-menu .pms159-list,
      html body.pms163-top-menu .pms159-event,
      html body.pms163-top-menu .pms159-new{
        min-width:0!important;
      }
      html body.pms163-top-menu .pms159-event strong{
        font-size:12px!important;
        overflow-wrap:anywhere!important;
      }
      @media(max-width:1280px){
        html body.pms163-top-menu .topbar{
          grid-template-columns:1fr!important;
          min-height:0!important;
        }
        html body.pms163-top-menu .topbar-actions{
          justify-content:flex-start!important;
        }
        html body.pms163-top-menu .pms159-grid{
          grid-template-columns:repeat(4,minmax(0,1fr))!important;
        }
        html body.pms163-top-menu .pms159-day{min-height:340px!important}
      }
      @media(max-width:860px){
        body.pms163-top-menu .app:not(.hidden){padding-top:58px!important}
        html body.pms163-top-menu .sidebar{
          height:58px!important;
          min-height:58px!important;
          max-height:58px!important;
          padding:9px 10px!important;
        }
        html body.pms163-top-menu #pms163-menu-toggle{
          min-width:96px!important;
          height:38px!important;
        }
        html body.pms163-top-menu #pms143-menu,
        html body.pms163-top-menu #nav{
          inset:58px 8px auto 8px!important;
          max-height:calc(100vh - 68px)!important;
        }
        html body.pms163-top-menu .topbar{
          top:58px!important;
          padding:14px 16px!important;
        }
        html body.pms163-top-menu #content{padding:14px 16px 40px!important}
        html body.pms163-top-menu .pms159-head{grid-template-columns:1fr!important}
        html body.pms163-top-menu .pms159-actions{justify-content:flex-start!important}
        html body.pms163-top-menu .pms159-grid{
          grid-template-columns:repeat(2,minmax(0,1fr))!important;
        }
      }
      @media(max-width:560px){
        html body.pms163-top-menu #logout-button{
          min-width:58px!important;
          padding:7px 9px!important;
        }
        html body.pms163-top-menu .topbar-actions > *{
          flex:1 1 150px!important;
        }
        html body.pms163-top-menu .topbar-actions button,
        html body.pms163-top-menu .topbar-actions .import-label,
        html body.pms163-top-menu .topbar-actions select{
          width:100%!important;
          white-space:normal!important;
        }
        html body.pms163-top-menu .pms159-grid{
          grid-template-columns:1fr!important;
        }
        html body.pms163-top-menu .pms159-day{min-height:260px!important}
      }
    `;
  }

  function apply(){
    document.body.classList.add("pms165-layout-polished");
    installStyle();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }
  [100, 500, 1500].forEach(function(delay){ setTimeout(apply, delay); });
  window.PMS_V165_TOP_LAYOUT_POLISH = { version: VERSION, refresh: apply };
})();
