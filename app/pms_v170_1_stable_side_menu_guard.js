(function(){
  "use strict";

  const STYLE_ID = "pms-v170-1-stable-side-menu-guard-style";

  function installStyle(){
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }

    style.textContent = `
      html body.pms1701-side-menu .app:not(.hidden){
        display:flex!important;
        width:100%!important;
        min-width:0!important;
        min-height:100vh!important;
        margin:0!important;
        padding:0!important;
      }
      html body.pms1701-side-menu .sidebar{
        position:sticky!important;
        inset:0 auto auto 0!important;
        z-index:100!important;
        display:flex!important;
        flex:0 0 282px!important;
        flex-direction:column!important;
        align-items:stretch!important;
        width:282px!important;
        min-width:282px!important;
        max-width:282px!important;
        height:100vh!important;
        min-height:100vh!important;
        max-height:100vh!important;
        gap:12px!important;
        margin:0!important;
        padding:20px!important;
        overflow:hidden!important;
        border-right:1px solid #dfe9e4!important;
        border-bottom:0!important;
        box-shadow:none!important;
      }
      html body.pms1701-side-menu #pms163-menu-toggle,
      html body.pms1701-side-menu #pms164-menu-wrap,
      html body.pms1701-side-menu #pms165-top-menu{
        display:none!important;
        visibility:hidden!important;
        width:0!important;
        height:0!important;
        min-width:0!important;
        min-height:0!important;
        margin:0!important;
        padding:0!important;
        overflow:hidden!important;
        pointer-events:none!important;
      }
      html body.pms1701-side-menu #pms143-menu{
        position:static!important;
        inset:auto!important;
        z-index:auto!important;
        display:grid!important;
        grid-template-columns:minmax(0,1fr)!important;
        flex:1 1 auto!important;
        width:100%!important;
        min-width:0!important;
        min-height:220px!important;
        max-height:none!important;
        gap:6px!important;
        margin:0!important;
        padding:4px!important;
        overflow-x:hidden!important;
        overflow-y:auto!important;
        border:0!important;
        border-radius:0!important;
        background:transparent!important;
        box-shadow:none!important;
        visibility:visible!important;
        opacity:1!important;
      }
      html body.pms1701-side-menu #nav{
        display:none!important;
        visibility:hidden!important;
        width:0!important;
        height:0!important;
        min-height:0!important;
        max-height:0!important;
        margin:0!important;
        padding:0!important;
        overflow:hidden!important;
      }
      html body.pms1701-side-menu #pms143-menu .pms143-button{
        position:relative!important;
        display:grid!important;
        grid-template-columns:38px minmax(0,1fr)!important;
        align-items:center!important;
        width:100%!important;
        min-width:0!important;
        min-height:40px!important;
        margin:0!important;
      }
      html body.pms1701-side-menu .sidebar-footer{
        flex:0 0 auto!important;
        margin-top:auto!important;
      }
      html body.pms1701-side-menu .main{
        position:relative!important;
        display:block!important;
        flex:1 1 auto!important;
        width:auto!important;
        min-width:0!important;
        max-width:none!important;
        margin:0!important;
        padding:0!important;
        overflow:visible!important;
      }
      html body.pms1701-side-menu .topbar{
        top:0!important;
        z-index:50!important;
      }
      @media(max-width:860px){
        html body.pms1701-side-menu .app:not(.hidden){display:block!important}
        html body.pms1701-side-menu .sidebar{
          position:relative!important;
          width:100%!important;
          min-width:0!important;
          max-width:none!important;
          height:auto!important;
          min-height:0!important;
          max-height:none!important;
        }
        html body.pms1701-side-menu #pms143-menu{max-height:320px!important}
      }
    `;
  }

  function enforce(){
    document.body.classList.remove(
      "pms163-top-menu",
      "pms163-menu-open",
      "pms164-top-select-menu",
      "pms165-fixed-top-menu"
    );
    document.body.classList.add("pms166-restore-sidebar", "pms1701-side-menu");
    const toggle = document.getElementById("pms163-menu-toggle");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    installStyle();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enforce);
  } else {
    enforce();
  }

  [50, 150, 400, 900, 1800, 3200].forEach(function(delay){
    setTimeout(enforce, delay);
  });
  setInterval(enforce, 500);

  window.PMS_V170_1_STABLE_SIDE_MENU_GUARD = { refresh: enforce };
})();
