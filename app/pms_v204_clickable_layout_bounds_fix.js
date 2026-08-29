(function(){
  "use strict";

  var VERSION = "pms_v204_clickable_layout_bounds_fix";

  function injectCss(){
    var style = document.getElementById("pms-v204-clickable-layout-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v204-clickable-layout-style";
      document.head.appendChild(style);
    }
    style.textContent = [
      "*,*::before,*::after{box-sizing:border-box!important}",
      "html,body,.app,.main,#content,.content,.card,.table-wrap,[class*='-panel'],[class*='-card'],[class*='-hero'],[class*='-page']{min-width:0!important;max-width:100%!important}",
      "body{overflow-x:hidden!important}",
      "#content{overflow-x:hidden!important}",
      ".table-wrap,.pms200-table,[class*='-table-wrap']{max-width:100%!important;overflow-x:auto!important;overflow-y:visible!important;-webkit-overflow-scrolling:touch!important}",
      "table{max-width:100%!important}",
      "th,td{min-width:0;overflow-wrap:anywhere!important;word-break:normal!important}",

      ".topbar{align-items:flex-start!important;gap:12px!important;min-width:0!important;overflow:visible!important}",
      ".topbar>div:first-child{min-width:0!important;flex:1 1 auto!important}",
      ".topbar h2,.topbar p{max-width:100%!important;overflow-wrap:anywhere!important}",
      ".topbar-actions{display:flex!important;flex-wrap:wrap!important;justify-content:flex-end!important;align-items:center!important;gap:7px!important;min-width:0!important;max-width:min(620px,100%)!important;overflow:visible!important}",
      ".topbar-actions>*{min-width:0!important;max-width:100%!important}",

      "button,.import-label,.primary-button,.secondary-button,.ghost-button,.danger-button,.inline-button,.inline-danger{position:relative!important;z-index:2!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;width:auto!important;max-width:100%!important;min-width:0!important;min-height:32px!important;margin:0!important;padding:7px 10px!important;line-height:1.14!important;white-space:normal!important;text-align:center!important;overflow-wrap:anywhere!important;word-break:normal!important;cursor:pointer!important;pointer-events:auto!important}",
      ".icon-button{width:38px!important;min-width:38px!important;max-width:38px!important;height:38px!important;padding:0!important;white-space:nowrap!important}",

      ".filters,.form-actions,.template-actions,.print-actions,.pms95-actions,.pms97-actions,.pms102-actions,.pms103-actions,.pms134-langbar,.pms179-actions,.pms189-actions,.pms197-actions,.pms200-actions,.pms200-row-actions,.pms203-actions,[class*='-actions']{max-width:100%!important;min-width:0!important;display:flex!important;flex-wrap:wrap!important;align-items:center!important;gap:7px!important;overflow:visible!important;pointer-events:auto!important}",
      ".filters button,.form-actions button,.template-actions button,.print-actions button,[class*='-actions'] button{flex:0 1 auto!important;max-width:170px!important;min-width:64px!important}",

      ".pms203-actions-cell,.pms202-actions-cell,.pms189-stable-cell,.pms184-stable-actions-cell,.pms197-table td:last-child,.pms200-table td:last-child{width:auto!important;min-width:240px!important;max-width:320px!important;text-align:left!important;vertical-align:top!important;overflow:visible!important}",
      ".pms203-actions,.pms189-actions,.pms197-actions,.pms200-row-actions{justify-content:flex-start!important;align-content:flex-start!important;max-width:100%!important;min-width:0!important}",
      ".pms203-actions button,.pms189-actions button,.pms197-actions button,.pms200-row-actions button{min-width:68px!important;max-width:132px!important;padding:6px 8px!important;font-size:11px!important;white-space:normal!important;line-height:1.12!important}",
      ".pms203-old-actions{display:none!important}",

      ".pms200-hero,.pms134-transport-head,.pms79-crm-hero,.pms79-legal-hero,[class*='-hero']{min-width:0!important;overflow:visible!important}",
      ".pms200-hero>div:first-child,[class*='-hero']>div:first-child{min-width:0!important;flex:1 1 260px!important}",
      ".pms200-actions{justify-content:flex-end!important;flex:0 1 380px!important}",

      ".modal,.modal-card,.pms200-modal,.pms179-modal,.pms175-modal,.pms172-modal,.pms92-modal-card{max-width:96vw!important;overflow:auto!important}",
      ".modal-actions,.pms200-modal-actions,.pms92-modal-actions{display:flex!important;flex-wrap:wrap!important;justify-content:flex-end!important;gap:8px!important;overflow:visible!important}",

      "@media(max-width:900px){.topbar{display:block!important}.topbar-actions{justify-content:flex-start!important;max-width:100%!important;margin-top:10px!important}.pms203-actions-cell,.pms202-actions-cell,.pms189-stable-cell,.pms184-stable-actions-cell,.pms197-table td:last-child,.pms200-table td:last-child{min-width:210px!important;max-width:260px!important}.filters button,.form-actions button,.template-actions button,.print-actions button,[class*='-actions'] button{max-width:100%!important}}",
      "@media(max-width:640px){button,.import-label,.primary-button,.secondary-button,.ghost-button,.danger-button,.inline-button,.inline-danger{width:100%!important}.filters,.form-actions,.template-actions,.print-actions,[class*='-actions']{align-items:stretch!important}.pms203-actions-cell,.pms202-actions-cell,.pms189-stable-cell,.pms184-stable-actions-cell,.pms197-table td:last-child,.pms200-table td:last-child{min-width:180px!important;max-width:230px!important}}"
    ].join("\n");
  }

  function mark(){
    if (document.body) document.body.classList.add("pms204-clickable-layout");
    document.querySelectorAll("button,.import-label,.inline-button,.inline-danger").forEach(function(el){
      if (!el.getAttribute("title")) el.setAttribute("title", (el.textContent || "").trim());
    });
  }
  function refresh(){
    injectCss();
    mark();
  }
  function wrapRender(){
    if (typeof render === "function" && !render.__pms204Wrapped) {
      var base = render;
      render = function(){
        var result = base.apply(this, arguments);
        setTimeout(refresh, 20);
        setTimeout(refresh, 180);
        return result;
      };
      render.__pms204Wrapped = true;
      try { window.render = render; } catch(error) {}
    }
    if (typeof bindPageActions === "function" && !bindPageActions.__pms204Wrapped) {
      var baseBind = bindPageActions;
      bindPageActions = function(){
        var result = baseBind.apply(this, arguments);
        setTimeout(refresh, 20);
        return result;
      };
      bindPageActions.__pms204Wrapped = true;
      try { window.bindPageActions = bindPageActions; } catch(error) {}
    }
  }

  injectCss();
  wrapRender();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", refresh);
  else refresh();
  [80, 260, 900, 1800].forEach(function(ms){ setTimeout(refresh, ms); });
  window.PMS_V204_CLICKABLE_LAYOUT_BOUNDS_FIX = {version:VERSION, refresh:refresh};
})();
