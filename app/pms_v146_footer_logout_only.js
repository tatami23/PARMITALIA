(function(){
  "use strict";

  const VERSION = "PMS-V146-FOOTER-LOGOUT-ONLY";

  function injectCss(){
    let style = document.getElementById("pms-v146-footer-logout-only-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v146-footer-logout-only-style";
      document.head.appendChild(style);
    }
    style.textContent = `
      .sidebar{position:relative!important}
      .sidebar-footer{
        margin-top:auto!important;
        padding:10px 10px 14px!important;
        border-top:0!important;
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        background:transparent!important;
        box-shadow:none!important;
        min-height:48px!important;
      }
      #current-user{
        display:none!important;
        visibility:hidden!important;
        width:0!important;
        height:0!important;
        overflow:hidden!important;
      }
      #logout-button{
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        width:auto!important;
        min-width:86px!important;
        min-height:34px!important;
        margin:0!important;
        padding:7px 14px!important;
        border:0!important;
        border-radius:8px!important;
        background:rgba(255,255,255,.72)!important;
        color:#17242b!important;
        font-weight:900!important;
        box-shadow:none!important;
      }
      #logout-button:hover{
        background:linear-gradient(90deg,rgba(95,143,109,.16),#fff,rgba(189,122,120,.12))!important;
      }
      #pms143-menu{
        max-height:calc(100vh - 230px)!important;
      }
      body.pms108-bottom-menu .sidebar-footer{
        flex:0 0 auto!important;
        min-width:86px!important;
        padding:4px 6px!important;
        align-self:center!important;
      }
      body.pms108-bottom-menu #logout-button{
        min-width:64px!important;
        min-height:30px!important;
        padding:5px 10px!important;
        font-size:11px!important;
      }
    `;
  }

  function cleanFooter(){
    const currentUser = document.getElementById("current-user");
    if (currentUser) {
      currentUser.textContent = "";
      currentUser.setAttribute("aria-hidden", "true");
    }
    const logout = document.getElementById("logout-button");
    if (logout) logout.textContent = "Esci";
  }

  function run(){
    injectCss();
    cleanFooter();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run, {once:true});
  else run();
  [100,500,1500].forEach(ms => setTimeout(run, ms));
  setInterval(run, 3000);
  window.PMS_V146_FOOTER_LOGOUT_ONLY = {version: VERSION};
})();
