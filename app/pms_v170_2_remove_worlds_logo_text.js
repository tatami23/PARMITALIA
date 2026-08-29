(function(){
  "use strict";

  const STYLE_ID = "pms-v170-2-remove-worlds-logo-text-style";
  const REMOVE_SELECTOR = [
    "#pms170-top-globe",
    ".pms170-top-globe",
    "#pms144-world-banner",
    ".pms144-world-banner",
    ".pms144-globe-wrap",
    ".pms144-globe",
    ".pms144-sign",
    ".pms109-hub",
    ".pms109-world",
    ".pms109-world-label",
    ".pms109-logo-orbit",
    ".pms109-logo-sat",
    ".pms113-led-sign",
    ".pms106-hub",
    ".pms106-wheel",
    ".pms106-globe-core",
    ".sidebar-brand",
    ".brand-mark",
    ".brand-text"
  ].join(",");

  function installStyle(){
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = `
      ${REMOVE_SELECTOR}{
        display:none!important;
        visibility:hidden!important;
        width:0!important;
        height:0!important;
        min-width:0!important;
        min-height:0!important;
        max-width:0!important;
        max-height:0!important;
        margin:0!important;
        padding:0!important;
        overflow:hidden!important;
        pointer-events:none!important;
      }
      body.pms113-left-globe .main::before,
      body .main::before{
        content:none!important;
        display:none!important;
        visibility:hidden!important;
        background:none!important;
        background-image:none!important;
      }
    `;
  }

  function clean(){
    installStyle();
    document.documentElement.style.setProperty("--pms113-centered-logo", "none");
    document.querySelectorAll(REMOVE_SELECTOR).forEach(function(node){
      node.remove();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", clean);
  } else {
    clean();
  }
  [50, 150, 400, 900, 1800, 3200].forEach(function(delay){
    setTimeout(clean, delay);
  });
  setInterval(clean, 700);

  window.PMS_V170_2_REMOVE_WORLDS_LOGO_TEXT = { refresh: clean };
})();
