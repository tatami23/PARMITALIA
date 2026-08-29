(function(){
  "use strict";

  var VERSION = "pms_v206_beautiful_parmitalia_polish";
  var LOGO = "assets/parmitalia_logo_background.jpeg";

  function injectCss(){
    var style = document.getElementById("pms-v206-beautiful-polish-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v206-beautiful-polish-style";
      document.head.appendChild(style);
    }
    style.textContent = [
      "body.pms206-beautiful{background:#f4f7f5!important;color:#182536!important}",
      "body.pms206-beautiful::before{content:'';position:fixed;right:-90px;bottom:-70px;width:min(920px,86vw);height:min(560px,58vh);background:url('" + LOGO + "') center/contain no-repeat;opacity:.045;filter:grayscale(8%) saturate(85%);pointer-events:none;z-index:0}",
      "body.pms206-beautiful::after{content:'';position:fixed;left:0;right:0;top:0;height:4px;background:linear-gradient(90deg,#14713f 0 33%,#ffffff 33% 66%,#c9252d 66% 100%);pointer-events:none;z-index:50000}",
      "body.pms206-beautiful .app,body.pms206-beautiful .main,body.pms206-beautiful #content,body.pms206-beautiful .sidebar,body.pms206-beautiful .topbar{position:relative;z-index:1}",
      "body.pms206-beautiful .sidebar{background:#203a31!important;border-right:1px solid rgba(255,255,255,.14)!important;box-shadow:8px 0 28px rgba(17,31,28,.16)!important}",
      "body.pms206-beautiful .sidebar-brand{border-bottom-color:rgba(255,255,255,.22)!important}",
      "body.pms206-beautiful .brand-mark,body.pms206-beautiful .brand-mark.small{background:#ffffff url('" + LOGO + "') center/86% auto no-repeat!important;color:transparent!important;border:1px solid rgba(255,255,255,.72)!important;box-shadow:0 8px 18px rgba(0,0,0,.14)!important}",
      "body.pms206-beautiful .nav-button{border:1px solid transparent!important;border-radius:8px!important;transition:background .16s ease,border-color .16s ease,transform .16s ease!important}",
      "body.pms206-beautiful .nav-button:hover,body.pms206-beautiful .nav-button.active{background:rgba(255,255,255,.14)!important;border-color:rgba(255,255,255,.20)!important;transform:translateX(2px)!important}",
      "body.pms206-beautiful .topbar{background:rgba(255,255,255,.86)!important;backdrop-filter:blur(8px);border-bottom:1px solid #d7e0dc!important;box-shadow:0 8px 24px rgba(28,45,42,.06)!important}",
      "body.pms206-beautiful .topbar h2{color:#17362d!important;font-weight:900!important}",
      "body.pms206-beautiful .topbar p{color:#65766f!important}",
      "body.pms206-beautiful .card,body.pms206-beautiful .table-wrap,body.pms206-beautiful [class*='-panel'],body.pms206-beautiful [class*='-card'],body.pms206-beautiful .pms205-order-filters{border-color:#d7e2dd!important;border-radius:8px!important;background:rgba(255,255,255,.94)!important;box-shadow:0 10px 26px rgba(30,47,43,.075)!important}",
      "body.pms206-beautiful [class*='-hero'],body.pms206-beautiful .section-header{background:#ffffff!important;border:1px solid #d7e2dd!important;border-left:5px solid #14713f!important;border-radius:8px!important;box-shadow:0 10px 24px rgba(30,47,43,.07)!important}",
      "body.pms206-beautiful .pms205-order-filters{border-top:3px solid #14713f!important}",
      "body.pms206-beautiful .pms205-filter-title strong{color:#17362d!important}",
      "body.pms206-beautiful button,body.pms206-beautiful .import-label{border-radius:7px!important;font-weight:850!important;box-shadow:0 3px 8px rgba(24,37,54,.08)!important;transition:transform .12s ease,box-shadow .12s ease,background .12s ease!important}",
      "body.pms206-beautiful button:hover,body.pms206-beautiful .import-label:hover{transform:translateY(-1px)!important;box-shadow:0 7px 16px rgba(24,37,54,.13)!important}",
      "body.pms206-beautiful .primary-button{background:#1c513f!important;border-color:#1c513f!important;color:#fff!important}",
      "body.pms206-beautiful .secondary-button,body.pms206-beautiful .inline-button{background:#f1f6f3!important;border:1px solid #cad9d1!important;color:#1b4b3c!important}",
      "body.pms206-beautiful .inline-danger,body.pms206-beautiful .danger-button,.pms203-danger{background:#fff3f3!important;border-color:#e7b8b8!important;color:#9f1d25!important}",
      "body.pms206-beautiful table{border-collapse:separate!important;border-spacing:0!important}",
      "body.pms206-beautiful th{background:#eef5f1!important;color:#203a31!important;border-bottom:1px solid #cad9d1!important}",
      "body.pms206-beautiful td{border-bottom:1px solid #e6eeea!important}",
      "body.pms206-beautiful tbody tr:nth-child(even) td{background:rgba(244,247,245,.68)!important}",
      "body.pms206-beautiful tbody tr:hover td{background:#edf7f1!important}",
      "body.pms206-beautiful input,body.pms206-beautiful select,body.pms206-beautiful textarea{border-color:#cbd9d2!important;border-radius:7px!important;background:#fff!important}",
      "body.pms206-beautiful input:focus,body.pms206-beautiful select:focus,body.pms206-beautiful textarea:focus{outline:2px solid rgba(20,113,63,.16)!important;border-color:#14713f!important}",
      "body.pms206-beautiful .badge,body.pms206-beautiful [class*='status']{letter-spacing:0!important}",
      "@media(max-width:760px){body.pms206-beautiful::before{opacity:.03;right:-180px;width:760px}.nav-button:hover{transform:none!important}}",
      "@media print{body.pms206-beautiful::before,body.pms206-beautiful::after{display:none!important}body.pms206-beautiful .card,body.pms206-beautiful .table-wrap,body.pms206-beautiful [class*='-panel'],body.pms206-beautiful [class*='-card']{box-shadow:none!important}}"
    ].join("\n");
  }

  function refresh(){
    injectCss();
    if (document.body) document.body.classList.add("pms206-beautiful");
  }
  function wrapRender(){
    if (typeof render === "function" && !render.__pms206Wrapped) {
      var base = render;
      render = function(){
        var result = base.apply(this, arguments);
        setTimeout(refresh, 20);
        setTimeout(refresh, 180);
        return result;
      };
      render.__pms206Wrapped = true;
      try { window.render = render; } catch(error) {}
    }
  }

  injectCss();
  wrapRender();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", refresh);
  else refresh();
  [100, 500, 1200].forEach(function(ms){ setTimeout(refresh, ms); });
  window.PMS_V206_BEAUTIFUL_PARMITALIA_POLISH = {version:VERSION, refresh:refresh};
})();
