(function () {
  "use strict";

  if (window.PMS_V200_OFFERS_COMMANDS_FINAL_LAYOUT) return;
  window.PMS_V200_OFFERS_COMMANDS_FINAL_LAYOUT = { version: "pms_v200_offers_commands_final_layout" };

  var nativeSetTimeout = window.setTimeout.bind(window);

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char];
    });
  }

  function installCss() {
    if (document.getElementById("pms200-offers-final-style")) return;
    var style = document.createElement("style");
    style.id = "pms200-offers-final-style";
    style.textContent = `
      body.pms200-offers-final #content .table-wrap{
        width:100%!important;
        max-width:100%!important;
        overflow-x:auto!important;
        overflow-y:visible!important;
      }
      body.pms200-offers-final #content table{
        width:max-content!important;
        min-width:100%!important;
        table-layout:auto!important;
        border-collapse:separate!important;
        border-spacing:0!important;
      }
      body.pms200-offers-final #content table th,
      body.pms200-offers-final #content table td{
        min-width:112px!important;
        max-width:260px!important;
        padding:9px 10px!important;
        writing-mode:horizontal-tb!important;
        text-orientation:mixed!important;
        white-space:nowrap!important;
        word-break:keep-all!important;
        overflow-wrap:normal!important;
        hyphens:none!important;
        vertical-align:middle!important;
      }
      body.pms200-offers-final #content table th{
        height:38px!important;
        font-size:11px!important;
        line-height:1.15!important;
        letter-spacing:0!important;
        text-align:left!important;
      }
      body.pms200-offers-final #content table td{
        font-size:12px!important;
        line-height:1.25!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
      }
      body.pms200-offers-final #content table th:nth-child(1),
      body.pms200-offers-final #content table td:nth-child(1){min-width:142px!important}
      body.pms200-offers-final #content table th:nth-child(2),
      body.pms200-offers-final #content table td:nth-child(2){min-width:125px!important}
      body.pms200-offers-final #content table th:nth-child(3),
      body.pms200-offers-final #content table td:nth-child(3){min-width:190px!important}
      body.pms200-offers-final #content table th:nth-child(4),
      body.pms200-offers-final #content table td:nth-child(4){min-width:180px!important}
      body.pms200-offers-final #content table th:nth-child(5),
      body.pms200-offers-final #content table td:nth-child(5){min-width:210px!important}
      body.pms200-offers-final #content th:last-child,
      body.pms200-offers-final #content td:last-child{
        width:365px!important;
        min-width:365px!important;
        max-width:365px!important;
        overflow:visible!important;
      }
      .pms200-offer-final-actions{
        position:relative!important;
        display:grid!important;
        grid-template-columns:72px 88px 105px 70px!important;
        gap:5px!important;
        align-items:center!important;
        width:350px!important;
        max-width:350px!important;
      }
      .pms200-offer-final-actions button,
      .pms200-offer-final-actions summary{
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        width:100%!important;
        min-width:0!important;
        height:28px!important;
        margin:0!important;
        padding:4px 6px!important;
        border:1px solid #cbd5e1!important;
        border-radius:5px!important;
        background:#fff!important;
        color:#24352f!important;
        font-family:inherit!important;
        font-size:10px!important;
        line-height:1!important;
        font-weight:800!important;
        letter-spacing:0!important;
        white-space:nowrap!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
        cursor:pointer!important;
        box-sizing:border-box!important;
      }
      .pms200-offer-final-actions .pms200-primary-cmd{
        background:#154734!important;
        border-color:#154734!important;
        color:#fff!important;
      }
      .pms200-offer-final-actions .pms200-danger-cmd{
        background:#fff7f7!important;
        border-color:#fecaca!important;
        color:#991b1b!important;
      }
      .pms200-offer-more{
        position:relative!important;
        width:70px!important;
        min-width:70px!important;
      }
      .pms200-offer-more summary{list-style:none!important}
      .pms200-offer-more summary::-webkit-details-marker{display:none!important}
      .pms200-offer-more[open] summary{
        border-color:#154734!important;
        color:#154734!important;
      }
      .pms200-offer-more-menu{
        position:absolute!important;
        z-index:1000!important;
        top:33px!important;
        right:0!important;
        display:grid!important;
        grid-template-columns:1fr!important;
        gap:4px!important;
        width:145px!important;
        padding:6px!important;
        border:1px solid #cbd5e1!important;
        border-radius:6px!important;
        background:#fff!important;
        box-shadow:0 12px 30px rgba(15,23,42,.18)!important;
      }
      .pms200-offer-more-menu button{
        width:100%!important;
        justify-content:flex-start!important;
        padding:5px 8px!important;
        text-align:left!important;
      }
      body.pms200-offers-final #content .approval-actions,
      body.pms200-offers-final #content .pms179-actions{
        display:contents!important;
      }
      @media(max-width:1100px){
        body.pms200-offers-final #content th:last-child,
        body.pms200-offers-final #content td:last-child{
          min-width:365px!important;
          width:365px!important;
        }
      }
      @media(max-width:760px){
        body.pms200-offers-final #content th:last-child,
        body.pms200-offers-final #content td:last-child{
          min-width:365px!important;
          width:365px!important;
        }
      }
      @media print{.pms200-offer-final-actions{display:none!important}}
    `;
    document.head.appendChild(style);
  }

  function isOffersPage() {
    return !!(window.current && current.page === "offers");
  }

  function offerCommands(item) {
    var id = esc(item && item.id);
    return '<div class="pms200-offer-final-actions">' +
      '<button type="button" class="inline-button pms200-primary-cmd" data-edit="offers" data-id="' + id + '" title="Modifica offerta">Modifica</button>' +
      '<button type="button" class="inline-button" data-print-offer-external="' + id + '" title="PDF per cliente o fornitore">PDF cliente</button>' +
      '<button type="button" class="inline-button" data-pms69-send-client="' + id + '" title="Invia email al cliente">Email cliente</button>' +
      '<details class="pms200-offer-more">' +
        '<summary title="Altri comandi">Altro</summary>' +
        '<div class="pms200-offer-more-menu">' +
          '<button type="button" class="inline-button" data-print-offer-internal="' + id + '" title="PDF interno">PDF interna</button>' +
          '<button type="button" class="inline-button" data-pms69-send-supplier="' + id + '" title="Invia email al fornitore">Email fornitore</button>' +
          '<button type="button" class="inline-button" data-offer-history-v20="' + id + '" title="Storico invii">Storico</button>' +
          '<button type="button" class="inline-danger pms200-danger-cmd" data-delete="offers" data-id="' + id + '" title="Elimina offerta">Elimina</button>' +
        '</div>' +
      '</details>' +
      '</div>';
  }

  function uniqueColumns(columns) {
    var seen = {};
    return columns.filter(function (key) {
      if (seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  function installColumnOverride() {
    if (window.__pms200OffersFinalColumnsInstalled) return;
    window.__pms200OffersFinalColumnsInstalled = true;

    var baseGetColumns = typeof getColumns === "function" ? getColumns : null;
    var baseColumnLabel = typeof columnLabel === "function" ? columnLabel : null;
    var baseCellValue = typeof cellValue === "function" ? cellValue : null;

    if (baseGetColumns) {
      window.getColumns = function (module) {
        var columns = baseGetColumns.apply(this, arguments) || [];
        if (module !== "offers") return columns;
        return [
          "code",
          "subAgent",
          "offerType",
          "client",
          "product",
          "total",
          "validUntil",
          "status",
          "adminAuthorization",
          "offerCommands"
        ];
      };
      try { getColumns = window.getColumns; } catch (_) {}
    }

    if (baseColumnLabel) {
      window.columnLabel = function (key) {
        var labels = {
          code: "Codice",
          subAgent: "Subagente",
          offerType: "Tipo offerta",
          client: "Cliente",
          product: "Prodotto",
          total: "Totale",
          validUntil: "Validita",
          status: "Stato",
          adminAuthorization: "Autorizzazione",
          offerCommands: "Comandi"
        };
        if (labels[key]) return labels[key];
        return baseColumnLabel.apply(this, arguments);
      };
      try { columnLabel = window.columnLabel; } catch (_) {}
    }

    if (baseCellValue) {
      window.cellValue = function (module, item, key) {
        if (module === "offers" && key === "offerCommands") return offerCommands(item);
        if (module === "offers" && (key === "print" || key === "actions")) return "";
        return baseCellValue.apply(this, arguments);
      };
      try { cellValue = window.cellValue; } catch (_) {}
    }
  }

  function cleanupLegacyOfferTables() {
    document.body.classList.toggle("pms200-offers-final", isOffersPage());
    if (!isOffersPage()) return;
    document.querySelectorAll("#content table").forEach(function (table) {
      table.classList.add("pms200-offers-horizontal-table");
      var headers = Array.prototype.slice.call(table.querySelectorAll("thead th"));
      var printIndex = headers.findIndex(function (th) { return /^stampa$/i.test(String(th.textContent || "").trim()); });
      var actionsIndex = headers.findIndex(function (th) { return /^azioni$/i.test(String(th.textContent || "").trim()); });
      if (printIndex >= 0) headers[printIndex].textContent = "Comandi";
      if (actionsIndex >= 0 && printIndex >= 0 && actionsIndex !== printIndex) {
        headers[actionsIndex].remove();
        table.querySelectorAll("tbody tr").forEach(function (row) {
          var cells = Array.prototype.slice.call(row.children);
          if (cells[actionsIndex]) cells[actionsIndex].remove();
        });
      }
    });
  }

  function closeCommandMenus(event) {
    document.querySelectorAll(".pms200-offer-more[open]").forEach(function (menu) {
      if (!event || !menu.contains(event.target) || event.target.closest("button")) {
        menu.removeAttribute("open");
      }
    });
  }

  function wrapRender(name) {
    var original = window[name];
    if (typeof original !== "function" || original.__pms200OffersFinalWrapped) return;
    var wrapped = function () {
      var result = original.apply(this, arguments);
      nativeSetTimeout(cleanupLegacyOfferTables, 30);
      nativeSetTimeout(cleanupLegacyOfferTables, 180);
      return result;
    };
    wrapped.__pms200OffersFinalWrapped = true;
    window[name] = wrapped;
    try { eval(name + " = window[name]"); } catch (_) {}
  }

  function boot() {
    installCss();
    installColumnOverride();
    wrapRender("render");
    wrapRender("setPage");
    document.addEventListener("click", closeCommandMenus, false);
    cleanupLegacyOfferTables();
    if (isOffersPage() && typeof window.render === "function") {
      nativeSetTimeout(function () {
        try { window.render(); } catch (_) {}
      }, 80);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
