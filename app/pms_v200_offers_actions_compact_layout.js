(function () {
  "use strict";

  if (window.PMS_V200_OFFERS_ACTIONS_COMPACT_LAYOUT) return;
  window.PMS_V200_OFFERS_ACTIONS_COMPACT_LAYOUT = { version: "pms_v200_offers_actions_compact_layout" };

  var nativeSetTimeout = window.setTimeout.bind(window);

  function installCss() {
    if (document.getElementById("pms200-offers-actions-style")) return;
    var style = document.createElement("style");
    style.id = "pms200-offers-actions-style";
    style.textContent = `
      body.pms200-offers-compact #content .table-wrap{overflow:auto!important}
      body.pms200-offers-compact #content table{table-layout:auto!important}
      body.pms200-offers-compact #content th.pms200-offer-command-head,
      body.pms200-offers-compact #content td.pms200-offer-command-cell{
        width:220px!important;
        min-width:220px!important;
        max-width:260px!important;
        white-space:normal!important;
      }
      .pms200-offer-commandbar{
        display:flex!important;
        flex-wrap:wrap!important;
        align-items:center!important;
        justify-content:flex-start!important;
        gap:5px!important;
        max-width:252px!important;
      }
      .pms200-offer-commandbar .inline-button,
      .pms200-offer-commandbar .inline-danger,
      .pms200-offer-commandbar button,
      .pms200-offer-commandbar a{
        width:auto!important;
        min-width:0!important;
        height:28px!important;
        margin:0!important;
        padding:4px 7px!important;
        border-radius:6px!important;
        font-size:11px!important;
        line-height:1!important;
        font-weight:850!important;
        white-space:nowrap!important;
      }
      .pms200-offer-commandbar .inline-danger,
      .pms200-offer-commandbar [data-delete="offers"]{
        margin-left:auto!important;
        border-color:#fecaca!important;
        background:#fff7f7!important;
        color:#991b1b!important;
      }
      .pms200-offer-commandbar .pms200-offer-separator{
        width:1px!important;
        align-self:stretch!important;
        min-height:22px!important;
        background:#d7e2dd!important;
        margin:0 1px!important;
      }
      body.pms200-offers-compact #content td,
      body.pms200-offers-compact #content th{
        vertical-align:middle!important;
      }
      @media(max-width:900px){
        body.pms200-offers-compact #content th.pms200-offer-command-head,
        body.pms200-offers-compact #content td.pms200-offer-command-cell{
          min-width:190px!important;
          width:190px!important;
        }
        .pms200-offer-commandbar{max-width:210px!important}
      }
      @media print{
        .pms200-offer-commandbar{display:none!important}
      }
    `;
    document.head.appendChild(style);
  }

  function headerText(cell) {
    return String(cell && cell.textContent || "").trim().toLowerCase();
  }

  function isOffersPage() {
    if (window.current && current.page === "offers") return true;
    var title = document.getElementById("page-title");
    return /offerte/i.test(title && title.textContent || "");
  }

  function moveChildren(from, to) {
    Array.prototype.slice.call(from.children || []).forEach(function (child) {
      to.appendChild(child);
    });
    if (!to.children.length && String(from.textContent || "").trim()) {
      var span = document.createElement("span");
      span.textContent = String(from.textContent || "").trim();
      to.appendChild(span);
    }
  }

  function compactTable(table) {
    if (!table || table.dataset.pms200OffersActionsCompact === "1") return;
    var headers = Array.prototype.slice.call(table.querySelectorAll("thead th"));
    if (!headers.length) return;
    var printIndex = headers.findIndex(function (th) { return /^(stampa|print)$/i.test(headerText(th)); });
    var actionsIndex = headers.findIndex(function (th) { return /^(azioni|actions)$/i.test(headerText(th)); });
    if (printIndex < 0 || actionsIndex < 0 || printIndex === actionsIndex) return;

    headers[printIndex].textContent = "Comandi";
    headers[printIndex].classList.add("pms200-offer-command-head");
    headers[actionsIndex].remove();

    table.querySelectorAll("tbody tr").forEach(function (row) {
      var cells = Array.prototype.slice.call(row.children);
      if (cells.length <= Math.max(printIndex, actionsIndex)) return;
      var printCell = cells[printIndex];
      var actionsCell = cells[actionsIndex];
      if (!printCell || !actionsCell || printCell.classList.contains("pms200-offer-command-cell")) return;

      var bar = document.createElement("div");
      bar.className = "pms200-offer-commandbar";
      moveChildren(printCell, bar);
      var hasPrintCommands = bar.children.length > 0;
      if (hasPrintCommands && actionsCell.children.length) {
        var sep = document.createElement("span");
        sep.className = "pms200-offer-separator";
        sep.setAttribute("aria-hidden", "true");
        bar.appendChild(sep);
      }
      moveChildren(actionsCell, bar);
      printCell.innerHTML = "";
      printCell.appendChild(bar);
      printCell.classList.add("pms200-offer-command-cell");
      actionsCell.remove();
    });
    table.dataset.pms200OffersActionsCompact = "1";
  }

  function compactOffersActions() {
    installCss();
    document.body.classList.toggle("pms200-offers-compact", isOffersPage());
    if (!isOffersPage()) return;
    document.querySelectorAll("#content table").forEach(compactTable);
  }

  function wrapRender(name) {
    var original = window[name];
    if (typeof original !== "function" || original.__pms200OffersActionsCompact) return;
    var wrapped = function () {
      var result = original.apply(this, arguments);
      nativeSetTimeout(compactOffersActions, 40);
      nativeSetTimeout(compactOffersActions, 220);
      return result;
    };
    wrapped.__pms200OffersActionsCompact = true;
    window[name] = wrapped;
    try { eval(name + " = window[name]"); } catch (_) {}
  }

  function boot() {
    installCss();
    compactOffersActions();
    wrapRender("render");
    wrapRender("setPage");
    document.addEventListener("click", function () {
      nativeSetTimeout(compactOffersActions, 120);
    }, true);
    var content = document.getElementById("content");
    if (content) {
      var observer = new MutationObserver(function () {
        nativeSetTimeout(compactOffersActions, 60);
      });
      observer.observe(content, { childList: true, subtree: true });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
