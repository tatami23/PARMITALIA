(function () {
  "use strict";

  if (window.PMS_V235_STANDARD_MENU_MODAL_SCROLL_FIX) return;

  var VERSION = "pms_v235_standard_menu_modal_scroll_fix";
  var STYLE_ID = "pms-v235-standard-menu-modal-scroll-style";
  var MENU_ID = "pms227-fill-sidebar-menu";

  function modalIsOpen() {
    var modal = document.getElementById("modal");
    return !!(modal && !modal.classList.contains("hidden"));
  }

  function injectStyle() {
    var style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = [
      "#" + MENU_ID + "{z-index:40!important}",
      "body.pms235-modal-open #" + MENU_ID + "{opacity:.08!important;pointer-events:none!important}",
      ".modal{z-index:2147483620!important}",
      ".modal-card{z-index:2147483621!important;position:relative!important;max-width:min(1120px,calc(100vw - 34px))!important}",
      ".modal-form{max-width:100%!important;min-width:0!important}",
      ".modal input,.modal select,.modal textarea,.modal button{position:relative!important;z-index:2147483622!important}",
      ".table-wrap,.pms129-table,.pms230-panel .table-wrap,.pms196-orders-table-wrap,.pms102-card .table-wrap,.pms103-card .table-wrap,.pms168-card .table-wrap{max-width:100%!important;overflow-x:auto!important;overflow-y:visible!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior-x:contain!important}",
      ".table-wrap table,.pms129-table table,.pms230-panel table,.pms196-orders-table,.pms102-card table,.pms103-card table{width:max-content!important;min-width:100%!important;border-collapse:collapse}",
      "#content table th,#content table td,.modal table th,.modal table td{white-space:nowrap!important}",
      "#content table td textarea,#content table td .preview-box,#content table td .pms128-note,#content table td .pms230-note{white-space:normal!important}",
      ".pms235-scroll-hint{display:block!important;margin:4px 0 8px!important;color:#64748b!important;font-size:11px!important;font-weight:800!important}",
      "@media(max-width:920px){#" + MENU_ID + "{z-index:30!important}.modal-card{max-width:calc(100vw - 18px)!important}.modal{padding:9px!important}}",
      "@media print{#" + MENU_ID + "{display:none!important}.pms235-scroll-hint{display:none!important}}"
    ].join("\n");
  }

  function updateModalState() {
    document.body.classList.toggle("pms235-modal-open", modalIsOpen());
  }

  function nearestScrollableParent(table) {
    var node = table.parentElement;
    while (node && node !== document.body) {
      if (node.classList && (
        node.classList.contains("table-wrap") ||
        /table|card|panel|widget/i.test(node.className || "")
      )) return node;
      node = node.parentElement;
    }
    return table.parentElement;
  }

  function estimateMinWidth(table) {
    var row = table.tHead && table.tHead.rows && table.tHead.rows[0];
    var cols = row ? row.cells.length : (table.rows && table.rows[0] ? table.rows[0].cells.length : 0);
    if (!cols || cols < 6) return "";
    return Math.max(900, cols * 138) + "px";
  }

  function decorateTables(root) {
    root = root || document;
    var scope = root.querySelectorAll ? root : document;
    scope.querySelectorAll("#content table, .modal table").forEach(function (table) {
      if (table.closest && table.closest("#print-root")) return;
      var parent = nearestScrollableParent(table);
      if (!parent) return;
      parent.style.maxWidth = "100%";
      parent.style.overflowX = "auto";
      parent.style.overflowY = "visible";
      parent.style.webkitOverflowScrolling = "touch";
      table.style.width = "max-content";
      table.style.minWidth = estimateMinWidth(table) || "100%";
      if (parent.dataset.pms235Hint !== "1" && table.scrollWidth > parent.clientWidth + 12) {
        parent.dataset.pms235Hint = "1";
        var hint = document.createElement("span");
        hint.className = "pms235-scroll-hint";
        hint.textContent = "Scorri lateralmente la tabella per vedere tutte le colonne.";
        parent.parentElement && parent.parentElement.insertBefore(hint, parent);
      }
    });
  }

  function refresh() {
    injectStyle();
    updateModalState();
    decorateTables(document);
  }

  function scheduleRefresh() {
    setTimeout(refresh, 20);
    setTimeout(refresh, 180);
    setTimeout(refresh, 520);
  }

  function observeModal() {
    var modal = document.getElementById("modal");
    if (!modal || modal.__pms235Observed) return;
    modal.__pms235Observed = true;
    new MutationObserver(scheduleRefresh).observe(modal, { attributes: true, attributeFilter: ["class", "style"] });
  }

  function wrap(name) {
    var fn = window[name];
    if (typeof fn !== "function" || fn.__pms235Wrapped) return;
    var wrapped = function () {
      var result = fn.apply(this, arguments);
      scheduleRefresh();
      return result;
    };
    wrapped.__pms235Wrapped = true;
    window[name] = wrapped;
    try { eval(name + " = window[name]"); } catch (error) {}
  }

  function bindGlobal() {
    if (document.__pms235Bound) return;
    document.__pms235Bound = true;
    document.addEventListener("click", function () { scheduleRefresh(); }, true);
    document.addEventListener("input", function () { scheduleRefresh(); }, true);
    window.addEventListener("resize", scheduleRefresh);
  }

  function install() {
    injectStyle();
    bindGlobal();
    observeModal();
    wrap("render");
    wrap("setPage");
    wrap("openModal");
    wrap("closeModal");
    wrap("bindPageActions");
    scheduleRefresh();
    window.PMS_V235_STANDARD_MENU_MODAL_SCROLL_FIX = {
      version: VERSION,
      refresh: refresh
    };
    console.info(VERSION + " loaded");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})();
