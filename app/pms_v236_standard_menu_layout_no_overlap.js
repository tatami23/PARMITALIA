(function () {
  "use strict";

  if (window.PMS_V236_STANDARD_MENU_LAYOUT_NO_OVERLAP) return;

  var VERSION = "pms_v236_standard_menu_layout_no_overlap";
  var STYLE_ID = "pms-v236-standard-menu-layout-style";
  var MENU_ID = "pms227-fill-sidebar-menu";
  var MENU_WIDTH = 318;

  function injectStyle() {
    var style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = [
      ":root{--pms236-menu-width:" + MENU_WIDTH + "px}",

      "body.device-desktop #" + MENU_ID + ",body:not(.device-phone):not(.device-tablet) #" + MENU_ID + "{z-index:90!important}",
      "body.device-desktop .app,body:not(.device-phone):not(.device-tablet) .app{display:block!important;min-width:0!important}",
      "body.device-desktop .main,body:not(.device-phone):not(.device-tablet) .main{margin-left:var(--pms236-menu-width)!important;width:calc(100vw - var(--pms236-menu-width))!important;max-width:calc(100vw - var(--pms236-menu-width))!important;min-width:0!important}",
      "body.device-desktop .topbar,body:not(.device-phone):not(.device-tablet) .topbar{left:var(--pms236-menu-width)!important;width:calc(100vw - var(--pms236-menu-width))!important;max-width:calc(100vw - var(--pms236-menu-width))!important}",
      "body.device-desktop .content,body:not(.device-phone):not(.device-tablet) .content{max-width:100%!important;overflow-x:hidden!important}",
      "body.device-desktop #content,body:not(.device-phone):not(.device-tablet) #content{max-width:100%!important;min-width:0!important}",

      ".modal{z-index:500!important;align-items:flex-start!important;padding:22px!important;overflow:auto!important}",
      "body.device-desktop .modal,body:not(.device-phone):not(.device-tablet) .modal{left:var(--pms236-menu-width)!important;width:calc(100vw - var(--pms236-menu-width))!important}",
      ".modal-card{position:relative!important;z-index:501!important;width:min(1040px,calc(100% - 24px))!important;max-width:calc(100% - 24px)!important;margin:18px auto!important;max-height:calc(100vh - 44px)!important;overflow:auto!important}",
      ".modal-form{max-width:100%!important;min-width:0!important}",
      ".modal-form .form-field,.modal-form label{min-width:0!important}",
      ".modal input,.modal select,.modal textarea{max-width:100%!important;min-width:0!important}",

      ".table-wrap,.pms196-orders-table-wrap,.pms230-panel .table-wrap,.pms129-table{max-width:100%!important;overflow-x:auto!important;overflow-y:visible!important;-webkit-overflow-scrolling:touch!important}",
      ".table-wrap table,.pms196-orders-table,.pms230-panel table,.pms129-table table{min-width:max-content!important;width:max-content!important}",
      "#content table th,#content table td{white-space:nowrap!important}",
      "#content table td small,#content table td textarea,#content table td .preview-box,#content table td .pms230-note{white-space:normal!important}",

      "body.device-phone #" + MENU_ID + ",body.device-tablet #" + MENU_ID + "{z-index:90!important}",
      "body.device-phone .main,body.device-tablet .main{margin-left:0!important;width:100%!important;max-width:100%!important}",
      "body.device-phone .modal,body.device-tablet .modal{left:0!important;width:100vw!important;padding:10px!important}",
      "body.device-phone .modal-card,body.device-tablet .modal-card{width:100%!important;max-width:100%!important;margin:8px auto!important}",

      "@media print{#" + MENU_ID + "{display:none!important}.main,.topbar,.modal{left:0!important;margin-left:0!important;width:100%!important;max-width:100%!important}}"
    ].join("\n");
  }

  function refresh() {
    injectStyle();
  }

  function wrap(name) {
    var fn = window[name];
    if (typeof fn !== "function" || fn.__pms236Wrapped) return;
    var wrapped = function () {
      var result = fn.apply(this, arguments);
      setTimeout(refresh, 20);
      setTimeout(refresh, 160);
      return result;
    };
    wrapped.__pms236Wrapped = true;
    window[name] = wrapped;
    try { eval(name + " = window[name]"); } catch (error) {}
  }

  function install() {
    refresh();
    wrap("render");
    wrap("setPage");
    wrap("openModal");
    wrap("closeModal");
    wrap("bindPageActions");
    window.addEventListener("resize", refresh);
    window.PMS_V236_STANDARD_MENU_LAYOUT_NO_OVERLAP = { version: VERSION, refresh: refresh };
    console.info(VERSION + " loaded");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})();
