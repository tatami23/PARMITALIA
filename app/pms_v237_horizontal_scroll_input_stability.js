(function () {
  "use strict";

  if (window.PMS_V237_HORIZONTAL_SCROLL_PASSIVE) return;

  var VERSION = "pms_v237_horizontal_scroll_input_stability";
  var STYLE_ID = "pms-v237-horizontal-scroll-passive-style";

  function injectStyle() {
    var style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = [
      "html,body{max-width:100%!important}",
      "body{overflow-x:hidden!important}",
      ".app{width:100%!important;max-width:100vw!important;overflow-x:hidden!important}",
      ".main{min-width:0!important;max-width:100%!important;overflow-x:hidden!important}",
      ".content,#content{min-width:0!important;max-width:100%!important;box-sizing:border-box!important;overflow-x:auto!important;overflow-y:visible!important;-webkit-overflow-scrolling:touch!important;scrollbar-width:auto!important}",
      "#content>*,#content section,#content article,#content .grid,#content .grid>*,#content .card,#content [class*='panel'],#content [class*='page'],#content [class*='card'],#content [class*='widget'],#content [class*='table']{min-width:0!important;max-width:100%!important;box-sizing:border-box!important}",
      "#content .card,#content [class*='panel'],#content [class*='widget']{overflow-x:auto!important;overflow-y:visible!important;-webkit-overflow-scrolling:touch!important;scrollbar-width:auto!important}",
      ".table-wrap,#content .table-wrap,#content [class*='table-wrap'],#content [class*='tableWrap'],#content [class*='table-wrapper'],#content [class*='tableWrapper'],#content [class*='table-scroll'],#content [class*='Table'],.pms129-table,.pms196-orders-table-wrap,.pms230-panel .table-wrap,.pms229-panel .table-wrap,.pms69-lines-widget .table-wrap,.pms73-listino-widget .table-wrap{display:block!important;width:100%!important;max-width:100%!important;overflow-x:auto!important;overflow-y:visible!important;-webkit-overflow-scrolling:touch!important;scrollbar-width:auto!important;overscroll-behavior-x:contain!important}",
      "#content table,.modal table,.table-wrap table,.pms129-table table,.pms196-orders-table,.pms230-panel table,.pms229-panel table,.pms69-lines-widget table,.pms73-listino-widget table{width:max-content!important;min-width:100%!important;table-layout:auto!important;border-collapse:collapse}",
      "#content table:has(th:nth-child(7)),.modal table:has(th:nth-child(7)),.table-wrap table:has(th:nth-child(7)),.pms129-table table:has(th:nth-child(7)){min-width:980px!important}",
      "#content table:has(th:nth-child(9)),.modal table:has(th:nth-child(9)),.table-wrap table:has(th:nth-child(9)),.pms129-table table:has(th:nth-child(9)){min-width:1240px!important}",
      "#content table:has(th:nth-child(11)),.modal table:has(th:nth-child(11)),.table-wrap table:has(th:nth-child(11)),.pms129-table table:has(th:nth-child(11)){min-width:1480px!important}",
      "#content table th,#content table td,.modal table th,.modal table td{white-space:nowrap!important;vertical-align:top!important}",
      "#content table td small,#content table td p,#content table td textarea,#content table td .preview-box,.modal table td small,.modal table td p,.modal table td textarea{white-space:normal!important}",
      ".modal{overflow:auto!important}",
      ".modal-card,.pms84-modal-card,.pms85-modal-card,.pms88-wide-modal,.pms92-modal-card,.pms97-modal-card{max-width:calc(100vw - 24px)!important;max-height:calc(100vh - 24px)!important;overflow:auto!important}",
      ".modal-form,.modal-card,.modal-card *{box-sizing:border-box!important}",
      ".modal input,.modal select,.modal textarea,#content input,#content select,#content textarea{opacity:1!important;visibility:visible!important;pointer-events:auto!important;max-width:100%!important;min-width:0!important}",
      ".modal textarea,#content textarea{white-space:pre-wrap!important}",
      "@media(max-width:900px){.content,#content,.table-wrap,#content .table-wrap,#content [class*='table']{overflow-x:auto!important}.modal-card{max-width:calc(100vw - 16px)!important}}",
      "@media print{.content,#content,.table-wrap,#content .table-wrap,#content [class*='table']{overflow:visible!important}}"
    ].join("\n");
  }

  function install() {
    injectStyle();
    window.PMS_V237_HORIZONTAL_SCROLL_PASSIVE = {
      version: VERSION,
      refresh: injectStyle
    };
    console.info(VERSION + " passive loaded");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})();
