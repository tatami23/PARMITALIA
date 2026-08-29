(function(){
  "use strict";

  const STYLE_ID = "pms-v162-1-clean-side-menu-style";

  function install(){
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }

    style.textContent = `
      #pms144-world-banner,
      .pms144-world-banner,
      .pms144-globe-wrap,
      .pms144-globe,
      .pms134-langbar label:has(#pms134-print-lang),
      .pms137-lang-line label:has(#pms137-print-lang-top){
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
    `;

    document.querySelectorAll(
      "#pms144-world-banner,.pms144-world-banner"
    ).forEach(function(node){ node.remove(); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install);
  } else {
    install();
  }
  [100, 400, 1000, 2200].forEach(function(delay){ setTimeout(install, delay); });
  setInterval(install, 2500);

  window.PMS_V162_1_CLEAN_SIDE_MENU = { refresh: install };
})();
